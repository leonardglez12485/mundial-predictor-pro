import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { usePredictions } from "@/context/PredictionsContext";
import { isPredictionLocked, formatKickoff, formatCountdown, calculatePoints } from "@/lib/scoring";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, X, Plus, Trophy, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/match/$matchId")({
  head: () => ({ meta: [{ title: "Predicción — Prode Mundial" }] }),
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { matches, getPrediction, savePrediction } = usePredictions();
  const match = matches.find(m => m.id === matchId);

  const existing = user && match ? getPrediction(match.id, user.id) : undefined;
  const [homeGoals, setHomeGoals] = useState(existing?.homeGoals ?? 1);
  const [awayGoals, setAwayGoals] = useState(existing?.awayGoals ?? 1);
  const [scorers, setScorers] = useState<string[]>(existing?.scorers ?? []);
  const [scorerInput, setScorerInput] = useState("");

  if (!match || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">Partido no encontrado</p>
          <Link to="/"><Button variant="link" className="mt-3">Volver</Button></Link>
        </Card>
      </main>
    );
  }

  const locked = isPredictionLocked(match);
  const winner: "home" | "away" | "draw" =
    homeGoals > awayGoals ? "home" : homeGoals < awayGoals ? "away" : "draw";
  const finished = match.status === "finished";
  const earnedPoints = finished && existing ? calculatePoints(existing, match) : 0;

  const addScorer = () => {
    const v = scorerInput.trim();
    if (!v) return;
    if (scorers.length >= 10) return toast.error("Máximo 10 goleadores");
    setScorers([...scorers, v]);
    setScorerInput("");
  };
  const removeScorer = (i: number) => setScorers(scorers.filter((_, idx) => idx !== i));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return toast.error("Las predicciones están cerradas");
    if (homeGoals < 0 || awayGoals < 0 || homeGoals > 20 || awayGoals > 20) {
      return toast.error("Marcador inválido");
    }
    savePrediction({
      matchId: match.id, userId: user.id,
      winner, homeGoals, awayGoals, scorers,
      updatedAt: new Date().toISOString(),
    });
    toast.success("¡Predicción guardada!");
    navigate({ to: "/" });
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al dashboard
      </Link>

      <Card className="overflow-hidden p-8 shadow-[var(--shadow-elegant)] animate-slide-up">
        {match.group && (
          <div className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Grupo {match.group} · {formatKickoff(match.kickoff)}
          </div>
        )}

        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="text-center">
            <div className="mb-2 text-6xl">{match.home.flag}</div>
            <div className="text-lg font-bold">{match.home.name}</div>
          </div>
          <div className="text-3xl font-black text-muted-foreground">VS</div>
          <div className="text-center">
            <div className="mb-2 text-6xl">{match.away.flag}</div>
            <div className="text-lg font-bold">{match.away.name}</div>
          </div>
        </div>

        {match.status === "pending" && !locked && (
          <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-center text-sm">
            ⏱️ {formatCountdown(match.kickoff)} — Aún puedes predecir
          </div>
        )}

        {locked && match.status !== "finished" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
            <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <div>
              <div className="font-semibold text-destructive">Tiempo expirado</div>
              <div className="text-destructive/80">
                Las predicciones se cierran 60 minutos antes del partido. Ya no es posible crear ni modificar.
              </div>
            </div>
          </div>
        )}

        {finished && match.result && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Resultado final</div>
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
          <fieldset disabled={locked} className="space-y-6 disabled:opacity-60">
            <div>
              <Label className="mb-3 block text-base font-semibold">Marcador predicho</Label>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className="space-y-1.5">
                  <div className="text-center text-xs text-muted-foreground">{match.home.name}</div>
                  <Input type="number" min={0} max={20} value={homeGoals}
                    onChange={e => setHomeGoals(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-20 text-center text-4xl font-bold" />
                </div>
                <div className="text-3xl font-bold text-muted-foreground">-</div>
                <div className="space-y-1.5">
                  <div className="text-center text-xs text-muted-foreground">{match.away.name}</div>
                  <Input type="number" min={0} max={20} value={awayGoals}
                    onChange={e => setAwayGoals(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-20 text-center text-4xl font-bold" />
                </div>
              </div>
              <div className="mt-3 text-center text-sm text-muted-foreground">
                Ganador: <span className="font-semibold text-foreground">
                  {winner === "draw" ? "Empate" : winner === "home" ? match.home.name : match.away.name}
                </span>
              </div>
            </div>

            <div>
              <Label className="mb-3 block text-base font-semibold">Goleadores</Label>
              <div className="flex gap-2">
                <Input value={scorerInput}
                  onChange={e => setScorerInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addScorer(); } }}
                  placeholder="Nombre del jugador..." className="h-11" />
                <Button type="button" onClick={addScorer} variant="outline" className="h-11" disabled={locked}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {scorers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {scorers.map((s, i) => (
                    <Badge key={i} variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
                      ⚽ {s}
                      {!locked && (
                        <button type="button" onClick={() => removeScorer(i)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">+2 puntos por cada goleador acertado</p>
            </div>

            <div className="rounded-xl border bg-secondary/40 p-4 text-sm">
              <div className="mb-2 font-semibold">Sistema de puntos</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Acertar el ganador: <strong className="text-foreground">+3 pts</strong></li>
                <li>✓ Acertar el marcador exacto: <strong className="text-foreground">+5 pts adicionales</strong></li>
                <li>✓ Cada goleador correcto: <strong className="text-foreground">+2 pts</strong></li>
              </ul>
            </div>
          </fieldset>

          {!locked && (
            <Button type="submit" className="h-12 w-full bg-[var(--gradient-primary)] text-base font-semibold shadow-[var(--shadow-soft)]">
              <Save className="mr-2 h-4 w-4" />
              {existing ? "Actualizar predicción" : "Guardar predicción"}
            </Button>
          )}
        </form>
      </Card>
    </main>
  );
}
