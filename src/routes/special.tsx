import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { usePredictions } from "@/context/PredictionsContext";
import { TEAMS } from "@/lib/mockData";
import { isSpecialPredictionLocked, isWorldCupStarted, timeUntilSpecialDeadline } from "@/lib/scoring";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag } from "@/components/Flag";
import { Star, Lock, Trophy, Save, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/special")({
  head: () => ({ meta: [{ title: "Mi pronóstico — Balero World Cup" }] }),
  component: SpecialPage,
});

function SpecialPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--gradient-soft)]">
        <Header />
        <SpecialForm />
      </div>
    </AuthGuard>
  );
}

function SpecialForm() {
  const { user } = useAuth();
  const { getSpecialPrediction, saveSpecialPrediction } = usePredictions();
  const navigate = useNavigate();
  const existing = user ? getSpecialPrediction(user.id) : undefined;
  const locked = isSpecialPredictionLocked();
  const started = isWorldCupStarted();

  const teamCodes = Object.keys(TEAMS);

  const [championCode, setChampionCode] = useState(existing?.championCode ?? "");
  const [topScorer, setTopScorer] = useState(existing?.topScorer ?? "");
  const [finalHomeCode, setFinalHomeCode] = useState(existing?.finalHomeCode ?? "");
  const [finalAwayCode, setFinalAwayCode] = useState(existing?.finalAwayCode ?? "");
  const [finalHomeGoals, setFinalHomeGoals] = useState<number>(existing?.finalHomeGoals ?? 1);
  const [finalAwayGoals, setFinalAwayGoals] = useState<number>(existing?.finalAwayGoals ?? 0);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return toast.error("El plazo ya cerró");
    if (!championCode || !topScorer.trim() || !finalHomeCode || !finalAwayCode) {
      return toast.error("Completá todos los campos");
    }
    if (finalHomeCode === finalAwayCode) {
      return toast.error("Los dos finalistas deben ser distintos");
    }
    saveSpecialPrediction({
      userId: user.id,
      championCode, topScorer: topScorer.trim(),
      finalHomeCode, finalAwayCode,
      finalHomeGoals, finalAwayGoals,
      updatedAt: new Date().toISOString(),
    });
    toast.success(existing ? "Pronóstico actualizado" : "¡Pronóstico guardado!");
    navigate({ to: "/" });
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al dashboard
      </Link>

      <Card className="overflow-hidden p-8 shadow-[var(--shadow-elegant)] animate-slide-up">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <Star className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mi pronóstico del Mundial</h1>
            <p className="text-sm text-muted-foreground">
              Campeón, goleador y final. Editable hasta 1 día antes del Mundial.
            </p>
          </div>
        </div>

        {!locked && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            ⏱️ Tiempo restante para modificar: <strong className="text-primary-deep">{timeUntilSpecialDeadline()}</strong>
            <div className="mt-1 text-xs text-muted-foreground">Cierre: 10 de junio de 2026</div>
          </div>
        )}

        {locked && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
            <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <div>
              <div className="font-semibold text-destructive">Pronóstico bloqueado</div>
              <div className="text-destructive/80">
                {started
                  ? "El Mundial ya comenzó. Solo podés predecir los partidos del día."
                  : "El plazo para modificar ya cerró."}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={locked} className="space-y-6 disabled:opacity-60">
            <div className="space-y-2">
              <Label className="text-base font-semibold">🏆 Campeón del Mundial</Label>
              <Select value={championCode} onValueChange={setChampionCode}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Elegí una selección..." /></SelectTrigger>
                <SelectContent>
                  {teamCodes.map(c => (
                    <SelectItem key={c} value={c}>
                      <span className="inline-flex items-center gap-2">
                        <Flag team={TEAMS[c]} size={18} />
                        {TEAMS[c].name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">⚽ Goleador del torneo</Label>
              <Input value={topScorer} onChange={e => setTopScorer(e.target.value)}
                placeholder="Nombre del jugador..." className="h-12" />
            </div>

            <div className="rounded-xl border bg-secondary/30 p-5">
              <Label className="mb-3 block text-base font-semibold">🥇 Partido final</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select value={finalHomeCode} onValueChange={setFinalHomeCode}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Finalista 1" /></SelectTrigger>
                  <SelectContent>
                    {teamCodes.map(c => (
                      <SelectItem key={c} value={c}>
                        <span className="inline-flex items-center gap-2">
                          <Flag team={TEAMS[c]} size={16} /> {TEAMS[c].name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={finalAwayCode} onValueChange={setFinalAwayCode}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Finalista 2" /></SelectTrigger>
                  <SelectContent>
                    {teamCodes.map(c => (
                      <SelectItem key={c} value={c}>
                        <span className="inline-flex items-center gap-2">
                          <Flag team={TEAMS[c]} size={16} /> {TEAMS[c].name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">Goles {finalHomeCode ? TEAMS[finalHomeCode]?.name : "Equipo 1"}</Label>
                  <Input type="number" min={0} max={20} value={finalHomeGoals}
                    onChange={e => setFinalHomeGoals(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-14 text-center text-2xl font-bold" />
                </div>
                <div className="pb-4 text-2xl font-bold text-muted-foreground">-</div>
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">Goles {finalAwayCode ? TEAMS[finalAwayCode]?.name : "Equipo 2"}</Label>
                  <Input type="number" min={0} max={20} value={finalAwayGoals}
                    onChange={e => setFinalAwayGoals(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-14 text-center text-2xl font-bold" />
                </div>
              </div>
            </div>
          </fieldset>

          {!locked && (
            <Button type="submit" className="h-12 w-full bg-[var(--gradient-primary)] text-base font-semibold shadow-[var(--shadow-soft)]">
              <Save className="mr-2 h-4 w-4" />
              {existing ? "Actualizar pronóstico" : "Guardar pronóstico"}
            </Button>
          )}

          {existing && (
            <div className="rounded-xl border bg-card p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-semibold"><Trophy className="h-4 w-4 text-primary" /> Tu pronóstico actual</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>Campeón: <strong className="text-foreground">{TEAMS[existing.championCode]?.name}</strong></li>
                <li>Goleador: <strong className="text-foreground">{existing.topScorer}</strong></li>
                <li>Final: <strong className="text-foreground">{TEAMS[existing.finalHomeCode]?.name} {existing.finalHomeGoals} - {existing.finalAwayGoals} {TEAMS[existing.finalAwayCode]?.name}</strong></li>
              </ul>
            </div>
          )}
        </form>
      </Card>
    </main>
  );
}
