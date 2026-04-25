import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { usePredictions } from "@/context/PredictionsContext";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Trophy, Target, TrendingUp, Star, ArrowRight } from "lucide-react";
import { isSpecialPredictionLocked, timeUntilSpecialDeadline } from "@/lib/scoring";
import { getLocalDateKey } from "@/lib/match-display";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Balero World Cup" }] }),
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
  const { matches, predictions, getSpecialPrediction, loading } = usePredictions();
  const { user, users } = useAuth();
  if (!user) return null;
  const isAdmin = user.role === "admin";

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <Card className="p-10 text-center text-muted-foreground">Cargando datos del torneo...</Card>
      </main>
    );
  }

  const today = getLocalDateKey(new Date().toISOString());
  const todayMatches = matches.filter(m => getLocalDateKey(m.kickoff) === today);
  const userPredictions = predictions.filter(p => p.userId === user.id);
  const ranking = [...users].sort((a, b) => b.points - a.points);
  const userRank = ranking.findIndex(u => u.id === user.id) + 1;
  const specialPred = getSpecialPrediction(user.id);
  const specialLocked = isSpecialPredictionLocked();

  const stats = isAdmin
    ? [
        { label: "Partidos hoy", value: todayMatches.length, icon: CalendarDays, color: "from-primary to-primary-glow" },
        { label: "Partidos totales", value: matches.length, icon: Target, color: "from-primary-deep to-primary" },
        { label: "Finalizados", value: matches.filter((match) => match.status === "finished").length, icon: Trophy, color: "from-primary to-primary-deep" },
        { label: "En juego", value: matches.filter((match) => match.status === "live").length, icon: TrendingUp, color: "from-primary-glow to-primary" },
      ]
    : [
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
          {isAdmin
            ? (todayMatches.length > 0 ? `Tienes ${todayMatches.length} partidos para supervisar hoy` : "No hay partidos hoy para gestionar")
            : (todayMatches.length > 0 ? `Tienes ${todayMatches.length} partidos por predecir hoy` : "No hay partidos hoy, revisa próximamente")}
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

      {!isAdmin && !specialLocked && !specialPred && (
        <Card className="mb-8 overflow-hidden border-primary/30 bg-[var(--gradient-primary)] p-5 text-primary-foreground shadow-[var(--shadow-soft)] animate-slide-up">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Star className="h-6 w-6" />
            </div>
            <div className="min-w-[200px] flex-1">
              <div className="font-bold">¡Hacé tu pronóstico del Mundial!</div>
              <div className="text-sm text-white/90">Campeón, goleador y final. Tiempo restante: {timeUntilSpecialDeadline()}</div>
            </div>
            <Link to="/special">
              <Button variant="secondary" className="font-semibold">
                Predecir <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {!isAdmin && !specialLocked && specialPred && (
        <Card className="mb-8 border-primary/20 bg-primary/5 p-4 animate-slide-up">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Star className="h-4 w-4 text-primary" />
            <span>Pronóstico cargado. Podés modificarlo hasta el cierre ({timeUntilSpecialDeadline()} restantes).</span>
            <Link to="/special" className="ml-auto text-sm font-semibold text-primary-deep hover:underline">Ver / Editar</Link>
          </div>
        </Card>
      )}

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isAdmin ? "Partidos del día" : "Calendario de hoy"}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link to="/calendar">
          <Button variant="outline">
            Ver por fecha <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {todayMatches.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">{isAdmin ? "No hay partidos para gestionar hoy" : "No hay partidos programados para hoy"}</p>
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
