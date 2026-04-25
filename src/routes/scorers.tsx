import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { Flag } from "@/components/Flag";
import { Header } from "@/components/Header";
import { usePredictions } from "@/context/PredictionsContext";
import { buildTopScorers } from "@/lib/tournament-stats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flame, Goal, Users } from "lucide-react";

export const Route = createFileRoute("/scorers")({
  head: () => ({ meta: [{ title: "Máximos goleadores — Balero World Cup" }] }),
  component: ScorersPage,
});

function ScorersPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--gradient-soft)]">
        <Header />
        <ScorersView />
      </div>
    </AuthGuard>
  );
}

function ScorersView() {
  const { matches, teams, loading } = usePredictions();
  const scorers = buildTopScorers(matches);
  const totalGoals = scorers.reduce((sum, scorer) => sum + scorer.goals, 0);
  const teamMap = new Map(teams.map((team) => [team.code, team]));

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <Card className="p-10 text-center text-muted-foreground">Cargando goleadores...</Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <Link to="/teams" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a grupos
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Máximos goleadores</h1>
          <p className="mt-1 text-muted-foreground">Conteo automático según los goleadores cargados por el administrador en cada resultado.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="min-w-[180px] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Jugadores</div>
                <div className="text-2xl font-bold">{scorers.length}</div>
              </div>
            </div>
          </Card>

          <Card className="min-w-[180px] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]">
                <Goal className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Goles cargados</div>
                <div className="text-2xl font-bold">{totalGoals}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[72px_minmax(0,1fr)_140px_92px] gap-3 border-b bg-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Puesto</span>
          <span>Jugador</span>
          <span>Equipo</span>
          <span className="text-right">Goles</span>
        </div>

        <div className="divide-y">
          {scorers.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Aún no hay goleadores cargados en los resultados.
            </div>
          ) : (
            scorers.map((scorer, index) => (
              <div key={`${scorer.teamCode ?? "na"}-${scorer.name}-${index}`} className="grid grid-cols-[72px_minmax(0,1fr)_140px_92px] items-center gap-3 px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${index < 3 ? "bg-primary/10 text-primary-deep" : "bg-secondary text-muted-foreground"}`}>
                    {index + 1}
                  </div>
                  {index === 0 && <Flame className="h-4 w-4 text-primary" />}
                </div>
                <div className="min-w-0 truncate font-medium">{scorer.name}</div>
                <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                  {scorer.teamCode && teamMap.get(scorer.teamCode) ? (
                    <>
                      <Flag team={teamMap.get(scorer.teamCode)!} size={16} className="shadow-none" />
                      <span className="truncate">{teamMap.get(scorer.teamCode)!.name}</span>
                    </>
                  ) : (
                    <span className="truncate">Sin equipo</span>
                  )}
                </div>
                <div className="text-right text-lg font-bold text-primary-deep tabular-nums">{scorer.goals}</div>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/teams">
          <Button variant="outline">Ver grupos</Button>
        </Link>
        <Link to="/calendar">
          <Button variant="outline">Ver calendario</Button>
        </Link>
      </div>
    </main>
  );
}