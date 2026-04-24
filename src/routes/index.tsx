import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { usePredictions } from "@/context/PredictionsContext";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { CalendarDays, Trophy, Target, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Prode Mundial" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--gradient-soft)]">
        <Header />
        <Dashboard />
      </div>
    </AuthGuard>
  );
}

function Dashboard() {
  const { matches, predictions } = usePredictions();
  const { user, users } = useAuth();
  if (!user) return null;

  const today = new Date().toDateString();
  const todayMatches = matches.filter(m => new Date(m.kickoff).toDateString() === today);
  const userPredictions = predictions.filter(p => p.userId === user.id);
  const ranking = [...users].sort((a, b) => b.points - a.points);
  const userRank = ranking.findIndex(u => u.id === user.id) + 1;

  const stats = [
    { label: "Partidos hoy", value: todayMatches.length, icon: CalendarDays, color: "from-primary to-primary-glow" },
    { label: "Tus predicciones", value: userPredictions.length, icon: Target, color: "from-primary-deep to-primary" },
    { label: "Tus puntos", value: user.points, icon: Trophy, color: "from-primary to-primary-deep" },
    { label: "Tu posición", value: `#${userRank}`, icon: TrendingUp, color: "from-primary-glow to-primary" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Hola, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {todayMatches.length > 0 ? `Tienes ${todayMatches.length} partidos por predecir hoy` : "No hay partidos hoy, revisa próximamente"}
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="overflow-hidden p-5 transition-all hover:shadow-[var(--shadow-soft)] animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  <div className="mt-1 text-3xl font-bold">{s.value}</div>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-[var(--shadow-soft)]`}>
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendario de hoy</h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {todayMatches.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No hay partidos programados para hoy</p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {todayMatches.map((m, i) => (
            <div key={m.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <MatchCard match={m} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
