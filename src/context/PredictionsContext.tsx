import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, readApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Match, Prediction, SpecialPrediction, Team } from "@/lib/types";

interface PredictionsState {
  loading: boolean;
  teams: Team[];
  matches: Match[];
  predictions: Prediction[];
  specialPredictions: SpecialPrediction[];
  getPrediction: (matchId: string, userId: string) => Prediction | undefined;
  savePrediction: (p: Prediction) => Promise<void>;
  getSpecialPrediction: (userId: string) => SpecialPrediction | undefined;
  saveSpecialPrediction: (p: SpecialPrediction) => Promise<void>;
  // Admin
  addMatch: (m: Match) => Promise<void>;
  updateMatchResult: (id: string, result: { homeGoals: number; awayGoals: number; homeScorers: string[]; awayScorers: string[] }) => Promise<void>;
  setMatchStatus: (id: string, status: Match["status"]) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
}

const PredictionsContext = createContext<PredictionsState | null>(null);

export function PredictionsProvider({ children }: { children: ReactNode }) {
  const { user, refreshCurrentUser, refreshUsers } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [specialPredictions, setSpecialPredictions] = useState<SpecialPrediction[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [privateLoading, setPrivateLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadTeams = async () => {
      try {
        const nextTeams = await api.teams.list();
        if (active) {
          setTeams(nextTeams);
        }
      } catch (error) {
        if (active) {
          setTeams([]);
        }

        console.error(readApiError(error, "No fue posible cargar los equipos"));
      } finally {
        if (active) {
          setTeamsLoading(false);
        }
      }
    };

    void loadTeams();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadMatches = async () => {
      try {
        const nextMatches = await api.matches.list();
        if (active) {
          setMatches(nextMatches);
        }
      } catch (error) {
        if (active) {
          setMatches([]);
        }

        console.error(readApiError(error, "No fue posible cargar los partidos"));
      } finally {
        if (active) {
          setMatchesLoading(false);
        }
      }
    };

    void loadMatches();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadPrivateData = async () => {
      if (!user || user.role === "admin") {
        setPredictions([]);
        setSpecialPredictions([]);
        setPrivateLoading(false);
        return;
      }

      setPrivateLoading(true);
      try {
        const [nextPredictions, nextSpecialPrediction] = await Promise.all([
          api.predictions.mine(),
          api.specialPredictions.mine(),
        ]);

        if (!active) {
          return;
        }

        setPredictions(nextPredictions);
        setSpecialPredictions(nextSpecialPrediction ? [nextSpecialPrediction] : []);
      } catch (error) {
        if (active) {
          setPredictions([]);
          setSpecialPredictions([]);
        }

        console.error(readApiError(error, "No fue posible cargar las predicciones del usuario"));
      } finally {
        if (active) {
          setPrivateLoading(false);
        }
      }
    };

    void loadPrivateData();

    return () => {
      active = false;
    };
  }, [user]);

  const loading = teamsLoading || matchesLoading || privateLoading;

  const getPrediction = (matchId: string, userId: string) =>
    predictions.find(p => p.matchId === matchId && p.userId === userId);

  const savePrediction = async (p: Prediction) => {
    if (user?.role === "admin") {
      throw new Error("El administrador no puede registrar predicciones");
    }

    const savedPrediction = await api.predictions.upsert(p.matchId, {
      winner: p.winner,
      homeGoals: p.homeGoals,
      awayGoals: p.awayGoals,
      scorers: p.scorers,
    });

    setPredictions(prev => {
      const idx = prev.findIndex(x => x.matchId === savedPrediction.matchId && x.userId === savedPrediction.userId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedPrediction;
        return copy;
      }
      return [...prev, savedPrediction];
    });

    await Promise.all([refreshCurrentUser(), refreshUsers()]);
  };

  const getSpecialPrediction = (userId: string) =>
    specialPredictions.find(p => p.userId === userId);

  const saveSpecialPrediction = async (p: SpecialPrediction) => {
    if (user?.role === "admin") {
      throw new Error("El administrador no puede registrar pronósticos especiales");
    }

    const savedPrediction = await api.specialPredictions.upsert({
      championCode: p.championCode,
      topScorer: p.topScorer,
      finalHomeCode: p.finalHomeCode,
      finalAwayCode: p.finalAwayCode,
      finalHomeGoals: p.finalHomeGoals,
      finalAwayGoals: p.finalAwayGoals,
    });

    setSpecialPredictions([savedPrediction]);
    await Promise.all([refreshCurrentUser(), refreshUsers()]);
  };

  const addMatch = async (m: Match) => {
    const createdMatch = await api.matches.create({
      homeTeamCode: m.home.code,
      awayTeamCode: m.away.code,
      kickoff: m.kickoff,
      group: m.group,
    });
    setMatches(prev => [...prev, createdMatch].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()));
  };

  const updateMatchResult: PredictionsState["updateMatchResult"] = async (id, result) => {
    const updatedMatch = await api.matches.updateResult(id, result);
    setMatches(prev => prev.map(m => m.id === id ? updatedMatch : m));
    await Promise.all([refreshCurrentUser(), refreshUsers()]);
  };

  const setMatchStatus: PredictionsState["setMatchStatus"] = async (id, status) => {
    const updatedMatch = await api.matches.updateStatus(id, status);
    setMatches(prev => prev.map(m => m.id === id ? updatedMatch : m));
  };

  const deleteMatch = async (id: string) => {
    await api.matches.remove(id);
    setMatches(prev => prev.filter(m => m.id !== id));
    setPredictions(prev => prev.filter(p => p.matchId !== id));
    await Promise.all([refreshCurrentUser(), refreshUsers()]);
  };

  return (
    <PredictionsContext.Provider value={{
      loading,
      teams,
      matches, predictions, specialPredictions,
      getPrediction, savePrediction,
      getSpecialPrediction, saveSpecialPrediction,
      addMatch, updateMatchResult, setMatchStatus, deleteMatch,
    }}>
      {children}
    </PredictionsContext.Provider>
  );
}

export function usePredictions() {
  const ctx = useContext(PredictionsContext);
  if (!ctx) throw new Error("usePredictions must be used inside PredictionsProvider");
  return ctx;
}
