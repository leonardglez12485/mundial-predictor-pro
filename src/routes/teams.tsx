import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { Flag } from "@/components/Flag";
import { usePredictions } from "@/context/PredictionsContext";
import { buildGroupTables } from "@/lib/tournament-stats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Layers3, Flame } from "lucide-react";

export const Route = createFileRoute("/teams")({
  head: () => ({ meta: [{ title: "Equipos del Mundial — Balero World Cup" }] }),
  component: TeamsPage,
});

function TeamsPage() {
  const location = useLocation();
  const showingList = location.pathname === "/teams";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--gradient-soft)]">
        <Header />
        {showingList ? <TeamsView /> : <Outlet />}
      </div>
    </AuthGuard>
  );
}

function TeamsView() {
  const { teams, matches, loading } = usePredictions();
  const groupTables = buildGroupTables(teams, matches);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <Card className="p-10 text-center text-muted-foreground">Cargando equipos del Mundial...</Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al dashboard
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Equipos del Mundial</h1>
          <p className="mt-1 text-muted-foreground">Visualiza las 48 selecciones organizadas por grupo.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="min-w-[180px] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Selecciones</div>
                <div className="text-2xl font-bold">{teams.length}</div>
              </div>
            </div>
          </Card>

          <Card className="min-w-[180px] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]">
                <Layers3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Grupos</div>
                <div className="text-2xl font-bold">{groupTables.length}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groupTables.map(({ group, rows }, index) => (
          <Card key={group} className="overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 45}ms` }}>
            <div className="border-b bg-secondary/40 px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">Grupo {group}</h2>
                {/* <span className="text-xs text-muted-foreground">{rows.length} equipos</span> */}
              </div>
            </div>

            <div className="px-3 py-2.5">
              <div className="grid grid-cols-[minmax(0,1.95fr)_repeat(6,minmax(0,0.5fr))] gap-2 border-b px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <span>Equipo</span>
                <span className="text-center">PJ</span>
                <span className="text-center">V</span>
                <span className="text-center">E</span>
                <span className="text-center">D</span>
                <span className="text-center">DG</span>
                <span className="text-center">P</span>
              </div>

              <div className="divide-y">
                {rows.map((row, rowIndex) => (
                  <div key={row.team.code} className="grid grid-cols-[minmax(0,1.95fr)_repeat(6,minmax(0,0.5fr))] items-center gap-2 px-1 py-2 text-xs">
                    <a href={`/teams/${encodeURIComponent(row.team.code)}`} className="flex min-w-0 items-center gap-2.5 rounded-md px-1 py-1 transition-colors hover:bg-secondary/50">
                      <span className="w-4 flex-shrink-0 text-[10px] font-bold text-muted-foreground">{rowIndex + 1}</span>
                      <Flag team={row.team} size={18} className="shadow-none" />
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-semibold leading-tight">{row.team.name}</div>
                        {/* <div className="text-[10px] text-muted-foreground">Ver plantel</div> */}
                      </div>
                    </a>
                    <StatCell value={row.played} />
                    <StatCell value={row.won} />
                    <StatCell value={row.drawn} />
                    <StatCell value={row.lost} />
                    <StatCell value={formatGoalDifference(row.goalDifference)} />
                    <StatCell value={row.points} strong />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/scorers">
          <Button><Flame className="mr-2 h-4 w-4" />Ver máximos goleadores</Button>
        </Link>
        <Link to="/calendar">
          <Button variant="outline">Ver calendario</Button>
        </Link>
      </div>
    </main>
  );
}

function StatCell({ value, strong = false }: { value: number | string; strong?: boolean }) {
  return <span className={`text-center tabular-nums ${strong ? "font-bold text-primary-deep" : "text-foreground"}`}>{value}</span>;
}

function formatGoalDifference(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}