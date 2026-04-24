import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { MOCK_MATCHES } from "@/lib/mockData";
import type { Match, Prediction, SpecialPrediction } from "@/lib/types";

interface PredictionsState {
  matches: Match[];
  predictions: Prediction[];
  specialPredictions: SpecialPrediction[];
  getPrediction: (matchId: string, userId: string) => Prediction | undefined;
  savePrediction: (p: Prediction) => void;
  getSpecialPrediction: (userId: string) => SpecialPrediction | undefined;
  saveSpecialPrediction: (p: SpecialPrediction) => void;
  // Admin
  addMatch: (m: Match) => void;
  updateMatchResult: (id: string, result: { homeGoals: number; awayGoals: number; scorers: string[] }) => void;
  setMatchStatus: (id: string, status: Match["status"]) => void;
  deleteMatch: (id: string) => void;
}

const PredictionsContext = createContext<PredictionsState | null>(null);
const STORAGE_PREDS = "balero_predictions_v2";
const STORAGE_SPECIAL = "balero_special_v2";
const STORAGE_MATCHES = "balero_matches_v2";

export function PredictionsProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>(() => {
    if (typeof window === "undefined") return MOCK_MATCHES;
    const stored = localStorage.getItem(STORAGE_MATCHES);
    return stored ? JSON.parse(stored) : MOCK_MATCHES;
  });
  const [predictions, setPredictions] = useState<Prediction[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_PREDS);
    return stored ? JSON.parse(stored) : [];
  });
  const [specialPredictions, setSpecialPredictions] = useState<SpecialPrediction[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_SPECIAL);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => { localStorage.setItem(STORAGE_PREDS, JSON.stringify(predictions)); }, [predictions]);
  useEffect(() => { localStorage.setItem(STORAGE_SPECIAL, JSON.stringify(specialPredictions)); }, [specialPredictions]);
  useEffect(() => { localStorage.setItem(STORAGE_MATCHES, JSON.stringify(matches)); }, [matches]);

  const getPrediction = (matchId: string, userId: string) =>
    predictions.find(p => p.matchId === matchId && p.userId === userId);

  const savePrediction = (p: Prediction) => {
    setPredictions(prev => {
      const idx = prev.findIndex(x => x.matchId === p.matchId && x.userId === p.userId);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = p; return copy; }
      return [...prev, p];
    });
  };

  const getSpecialPrediction = (userId: string) =>
    specialPredictions.find(p => p.userId === userId);

  const saveSpecialPrediction = (p: SpecialPrediction) => {
    setSpecialPredictions(prev => {
      const idx = prev.findIndex(x => x.userId === p.userId);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = p; return copy; }
      return [...prev, p];
    });
  };

  const addMatch = (m: Match) => setMatches(prev => [...prev, m]);
  const updateMatchResult: PredictionsState["updateMatchResult"] = (id, result) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, result, status: "finished" } : m));
  };
  const setMatchStatus: PredictionsState["setMatchStatus"] = (id, status) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };
  const deleteMatch = (id: string) => setMatches(prev => prev.filter(m => m.id !== id));

  return (
    <PredictionsContext.Provider value={{
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
