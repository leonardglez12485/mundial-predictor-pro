import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { usePredictions } from "@/context/PredictionsContext";
import { api, readApiError } from "@/lib/api";
import {
  OWN_GOAL_SCORER_NAME,
  parseScorerEntry,
  serializeScorerEntry,
  splitScorerSelections,
} from "@/lib/scorer-entry";
import { isPredictionLocked, formatKickoff, formatCountdown, calculatePoints } from "@/lib/scoring";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Lock, Trophy, Save } from "lucide-react";
import { toast } from "sonner";
import { Flag } from "@/components/Flag";
import { formatMatchStage, hasResolvedParticipants } from "@/lib/match-display";
import type { Match, Player, Prediction, User } from "@/lib/types";

export const Route = createFileRoute("/match/$matchId")({
  head: () => ({ meta: [{ title: "Predicción — Balero World Cup" }] }),
  component: MatchPredictionPage,
});

function MatchPredictionPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--gradient-soft)]">
        <Header />
        <PredictionForm />
      </div>
    </AuthGuard>
  );
}

function PredictionForm() {
  const { matchId } = Route.useParams();
  const { user } = useAuth();
  const { matches, getPrediction, savePrediction, loading } = usePredictions();
  const match = matches.find((m) => m.id === matchId);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <Card className="p-6 text-center text-muted-foreground sm:p-10">
          Cargando partido y predicción...
        </Card>
      </main>
    );
  }

  if (!match || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <Card className="p-6 text-center sm:p-10">
          <p className="text-muted-foreground">Partido no encontrado</p>
          <Link to="/">
            <Button variant="link" className="mt-3">
              Volver
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  if (user.role === "admin") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <Card className="p-6 text-center sm:p-10">
          <p className="text-lg font-semibold">Acceso solo para gestión administrativa</p>
          <p className="mt-2 text-muted-foreground">
            El administrador no puede crear predicciones. Cargá resultados y goleadores desde el
            panel admin.
          </p>
          <Link to="/admin">
            <Button className="mt-4">Ir al panel admin</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const existing = getPrediction(match.id, user.id);
  return (
    <LoadedPredictionForm
      key={`${match.id}:${existing?.updatedAt ?? "new"}`}
      match={match}
      user={user}
      existing={existing}
      savePrediction={savePrediction}
    />
  );
}

function LoadedPredictionForm({
  match,
  user,
  existing,
  savePrediction,
}: {
  match: Match;
  user: User;
  existing: Prediction | undefined;
  savePrediction: (prediction: Prediction) => Promise<void>;
}) {
  const navigate = useNavigate();
  const [homeGoals, setHomeGoals] = useState(existing?.homeGoals ?? 1);
  const [awayGoals, setAwayGoals] = useState(existing?.awayGoals ?? 1);
  const initialScorers = existing
    ? splitScorerSelections(
        existing.scorers,
        match.home.code,
        match.away.code,
        existing.homeGoals,
        existing.awayGoals,
      )
    : { homeScorers: [], awayScorers: [] };
  const [homeScorers, setHomeScorers] = useState(() =>
    resizeScorerList(initialScorers.homeScorers, existing?.homeGoals ?? 1),
  );
  const [awayScorers, setAwayScorers] = useState(() =>
    resizeScorerList(initialScorers.awayScorers, existing?.awayGoals ?? 1),
  );
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(() => hasResolvedParticipants(match));
  const locked = isPredictionLocked(match);
  const participantsResolved = hasResolvedParticipants(match);
  const winner: "home" | "away" | "draw" =
    homeGoals > awayGoals ? "home" : homeGoals < awayGoals ? "away" : "draw";
  const finished = match.status === "finished";
  const earnedPoints = finished && existing ? calculatePoints(existing, match) : 0;

  useEffect(() => {
    let active = true;

    const loadPlayers = async () => {
      if (!participantsResolved) {
        setHomePlayers([]);
        setAwayPlayers([]);
        setPlayersLoading(false);
        return;
      }

      setPlayersLoading(true);
      try {
        const [homeTeam, awayTeam] = await Promise.all([
          api.teams.detail(match.home.code),
          api.teams.detail(match.away.code),
        ]);

        if (!active) {
          return;
        }

        setHomePlayers(homeTeam.players);
        setAwayPlayers(awayTeam.players);
      } catch (error) {
        if (active) {
          toast.error(readApiError(error, "No fue posible cargar los jugadores del partido"));
        }
      } finally {
        if (active) {
          setPlayersLoading(false);
        }
      }
    };

    void loadPlayers();

    return () => {
      active = false;
    };
  }, [match.away.code, match.home.code, participantsResolved]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return toast.error("Las predicciones están cerradas");
    if (homeGoals < 0 || awayGoals < 0 || homeGoals > 20 || awayGoals > 20) {
      return toast.error("Marcador inválido");
    }
    const normalizedHomeScorers = homeScorers.filter(Boolean);
    const normalizedAwayScorers = awayScorers.filter(Boolean);
    if (normalizedHomeScorers.length !== homeGoals) {
      return toast.error(
        `Debés elegir ${homeGoals} goleador${homeGoals === 1 ? "" : "es"} para ${match.home.name}`,
      );
    }
    if (normalizedAwayScorers.length !== awayGoals) {
      return toast.error(
        `Debés elegir ${awayGoals} goleador${awayGoals === 1 ? "" : "es"} para ${match.away.name}`,
      );
    }
    await savePrediction({
      matchId: match.id,
      userId: user.id,
      winner,
      homeGoals,
      awayGoals,
      scorers: [...normalizedHomeScorers, ...normalizedAwayScorers],
      updatedAt: new Date().toISOString(),
    });
    toast.success("¡Predicción guardada!");
    navigate({ to: "/" });
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al dashboard
      </Link>

      <Card className="overflow-hidden p-4 shadow-[var(--shadow-elegant)] animate-slide-up sm:p-8">
        <div className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {formatMatchStage(match)} · {formatKickoff(match.kickoff)}
        </div>

        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-col items-center text-center">
            <Flag team={match.home} size={48} className="mb-3 sm:h-16 sm:w-16" />
            <div className="max-w-full truncate text-sm font-bold sm:text-lg">
              {match.home.name}
            </div>
          </div>
          <div className="text-2xl font-black text-muted-foreground sm:text-3xl">VS</div>
          <div className="flex min-w-0 flex-col items-center text-center">
            <Flag team={match.away} size={48} className="mb-3 sm:h-16 sm:w-16" />
            <div className="max-w-full truncate text-sm font-bold sm:text-lg">
              {match.away.name}
            </div>
          </div>
        </div>

        {match.status === "pending" && !locked && participantsResolved && (
          <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-center text-sm">
            ⏱️ {formatCountdown(match.kickoff)} — Aún puedes predecir
          </div>
        )}

        {!participantsResolved && (
          <div className="mb-6 rounded-xl border bg-secondary/40 px-4 py-3 text-center text-sm text-muted-foreground">
            Este cruce todavía depende de clasificados previos. El calendario ya está cargado, pero
            la predicción quedará habilitada cuando se definan los equipos.
          </div>
        )}

        {locked && match.status !== "finished" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
            <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <div>
              <div className="font-semibold text-destructive">Predicción cerrada</div>
              <div className="text-destructive/80">
                Solo podés predecir en estado pendiente. 15 minutos antes del inicio, y en cualquier
                otro estado, la predicción queda cerrada.
              </div>
            </div>
          </div>
        )}

        {finished && match.result && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Resultado final
            </div>
            <div className="my-1 text-3xl font-black text-primary-deep">
              {match.result.homeGoals} - {match.result.awayGoals}
            </div>
            {existing && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                <Trophy className="h-3.5 w-3.5" /> Ganaste {earnedPoints} puntos
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <fieldset
            disabled={locked || !participantsResolved}
            className="space-y-6 disabled:opacity-60"
          >
            <div>
              <Label className="mb-3 block text-base font-semibold">Marcador predicho</Label>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <div className="text-center text-xs text-muted-foreground">{match.home.name}</div>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    value={homeGoals}
                    onChange={(e) => {
                      const nextGoals = Math.max(0, parseInt(e.target.value) || 0);
                      setHomeGoals(nextGoals);
                      setHomeScorers((prev) => resizeScorerList(prev, nextGoals));
                    }}
                    className="h-12 text-center text-xl font-bold sm:h-14 sm:text-2xl"
                  />
                </div>
                <div className="text-xl font-bold text-muted-foreground sm:text-2xl">-</div>
                <div className="space-y-1.5">
                  <div className="text-center text-xs text-muted-foreground">{match.away.name}</div>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    value={awayGoals}
                    onChange={(e) => {
                      const nextGoals = Math.max(0, parseInt(e.target.value) || 0);
                      setAwayGoals(nextGoals);
                      setAwayScorers((prev) => resizeScorerList(prev, nextGoals));
                    }}
                    className="h-12 text-center text-xl font-bold sm:h-14 sm:text-2xl"
                  />
                </div>
              </div>
              <div className="mt-3 text-center text-sm text-muted-foreground">
                Ganador:{" "}
                <span className="font-semibold text-foreground">
                  {winner === "draw"
                    ? "Empate"
                    : winner === "home"
                      ? match.home.name
                      : match.away.name}
                </span>
              </div>
            </div>

            <div>
              <Label className="mb-3 block text-base font-semibold">Goleadores</Label>
              <p className="mb-3 text-xs text-muted-foreground">
                Si el gol es en contra, elegí{" "}
                <span className="font-semibold text-foreground">{OWN_GOAL_SCORER_NAME}</span>.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <PredictionScorerSection
                  team={match.home}
                  goalCount={homeGoals}
                  players={homePlayers}
                  playersLoading={playersLoading}
                  scorers={homeScorers}
                  onChange={setHomeScorers}
                />
                <PredictionScorerSection
                  team={match.away}
                  goalCount={awayGoals}
                  players={awayPlayers}
                  playersLoading={playersLoading}
                  scorers={awayScorers}
                  onChange={setAwayScorers}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                +2 puntos por cada goleador acertado
              </p>
            </div>

            <div className="rounded-xl border bg-secondary/40 p-4 text-sm">
              <div className="mb-2 font-semibold">Sistema de puntos</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  ✓ Acertar el ganador: <strong className="text-foreground">+3 pts</strong>
                </li>
                <li>
                  ✓ Acertar el marcador exacto:{" "}
                  <strong className="text-foreground">+5 pts adicionales</strong>
                </li>
                <li>
                  ✓ Cada goleador correcto: <strong className="text-foreground">+2 pts</strong>
                </li>
              </ul>
            </div>
          </fieldset>

          {!locked && participantsResolved && (
            <Button
              type="submit"
              className="h-12 w-full bg-[var(--gradient-primary)] text-base font-semibold shadow-[var(--shadow-soft)]"
            >
              <Save className="mr-2 h-4 w-4" />
              {existing ? "Actualizar predicción" : "Guardar predicción"}
            </Button>
          )}

          {locked && participantsResolved && !finished && (
            <Button
              type="button"
              disabled
              variant="outline"
              className="h-12 w-full text-base font-semibold"
            >
              <Lock className="mr-2 h-4 w-4" /> Cerrado
            </Button>
          )}
        </form>
      </Card>
    </main>
  );
}

function PredictionScorerSection({
  team,
  goalCount,
  players,
  playersLoading,
  scorers,
  onChange,
}: {
  team: { code: string; name: string; flag: string; group?: string };
  goalCount: number;
  players: Player[];
  playersLoading: boolean;
  scorers: string[];
  onChange: (scorers: string[]) => void;
}) {
  const playerOptions = buildPredictionPlayerOptions(team.code, players, scorers);

  return (
    <div className="rounded-xl border bg-background/80 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Flag team={team} size={18} className="shadow-none" />
        <div>
          <div className="text-sm font-semibold">{team.name}</div>
          <div className="text-xs text-muted-foreground">
            {goalCount} gol{goalCount === 1 ? "" : "es"} previstos
          </div>
        </div>
      </div>

      {goalCount === 0 ? (
        <div className="rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
          Sin goles para este equipo.
        </div>
      ) : playersLoading ? (
        <div className="rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
          Cargando jugadores...
        </div>
      ) : playerOptions.length === 0 ? (
        <div className="space-y-2 rounded-md bg-secondary/50 px-3 py-3 text-sm text-muted-foreground">
          <div>El catálogo de {team.name} todavía no tiene jugadores activos.</div>
          <div>Pedile al administrador que actualice el plantel provisorio.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {Array.from({ length: goalCount }, (_, index) => (
            <div key={`${team.code}-${index}`} className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Goleador {index + 1}
              </Label>
              <Select
                value={scorers[index] || undefined}
                onValueChange={(value) => {
                  const nextScorers = [...scorers];
                  nextScorers[index] = value;
                  onChange(nextScorers);
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={`Seleccionar jugador de ${team.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {playerOptions.map((playerOption) => (
                    <SelectItem key={playerOption.value} value={playerOption.value}>
                      {playerOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function resizeScorerList(scorers: string[], goalCount: number) {
  const nextScorers = scorers.slice(0, goalCount);
  while (nextScorers.length < goalCount) {
    nextScorers.push("");
  }
  return nextScorers;
}

function buildPredictionPlayerOptions(
  teamCode: string,
  players: Player[],
  selectedScorers: string[],
) {
  const ownGoalValue = serializeScorerEntry(teamCode, OWN_GOAL_SCORER_NAME);
  const activeOptionMap = new Map<string, string>([
    [ownGoalValue, OWN_GOAL_SCORER_NAME] as const,
    ...players
      .filter((player) => player.active)
      .map((player) => [serializeScorerEntry(teamCode, player.name), player.name] as const),
  ]);
  const optionValues = Array.from(
    new Set([...activeOptionMap.keys(), ...selectedScorers.filter(Boolean)]),
  );

  return optionValues
    .map((value) => {
      const parsedScorer = parseScorerEntry(value);
      const label = activeOptionMap.has(value) ? parsedScorer.name : `${parsedScorer.name} (baja)`;
      return { value, label };
    })
    .sort((leftOption, rightOption) => leftOption.label.localeCompare(rightOption.label, "es"));
}
