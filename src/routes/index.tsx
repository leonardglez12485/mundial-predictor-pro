import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { BrandLogo } from "@/components/BrandLogo";
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
        <Card className="p-6 text-center text-muted-foreground sm:p-10">
          Cargando datos del torneo...
        </Card>
      </main>
    );
  }

  const today = getLocalDateKey(new Date().toISOString());
  const todayMatches = matches.filter((m) => getLocalDateKey(m.kickoff) === today);
  const userPredictions = predictions.filter((p) => p.userId === user.id);
  const ranking = [...users].sort((a, b) => b.points - a.points);
  const userRank = ranking.findIndex((u) => u.id === user.id) + 1;
  const specialPred = getSpecialPrediction(user.id);
  const specialLocked = isSpecialPredictionLocked();

  const stats = isAdmin
    ? [
        {
          label: "Partidos hoy",
          value: todayMatches.length,
          icon: CalendarDays,
          color: "bg-primary",
        },
        {
          label: "Partidos totales",
          value: matches.length,
          icon: Target,
          color: "bg-primary-deep",
        },
        {
          label: "Finalizados",
          value: matches.filter((match) => match.status === "finished").length,
          icon: Trophy,
          color: "bg-primary",
        },
        {
          label: "En Desarrollo",
          value: matches.filter((match) => match.status === "live" || match.status === "starting")
            .length,
          icon: TrendingUp,
          color: "bg-primary-deep",
        },
      ]
    : [
        {
          label: "Partidos hoy",
          value: todayMatches.length,
          icon: CalendarDays,
          color: "bg-primary",
        },
        {
          label: "Tus predicciones",
          value: userPredictions.length,
          icon: Target,
          color: "bg-primary-deep",
        },
        {
          label: "Tus puntos",
          value: user.points,
          icon: Trophy,
          color: "bg-primary",
        },
        {
          label: "Tu posición",
          value: `#${userRank}`,
          icon: TrendingUp,
          color: "bg-primary-deep",
        },
      ];

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:py-7">
      <div className="stadium-hero mb-5 overflow-hidden rounded-lg border border-white/35 p-4 text-white shadow-[var(--shadow-elegant)] animate-fade-in sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
                <div className="mb-3 inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/82 backdrop-blur">
                  <BrandLogo
                    size="sm"
                    framed={false}
                    showWordmark={false}
                    className="mr-2"
                    imageClassName="h-6 w-6"
                  />
                  Mundial 2026
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Hola, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-white/78">
              {isAdmin
                ? todayMatches.length > 0
                  ? `Tenés ${todayMatches.length} partidos para supervisar hoy`
                  : "No hay partidos hoy para gestionar"
                : todayMatches.length > 0
                  ? `Tenés ${todayMatches.length} partidos por predecir hoy`
                  : "No hay partidos hoy, revisá el calendario próximo"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-right sm:flex">
            <div className="rounded-md border border-white/18 bg-white/10 px-3 py-2 backdrop-blur">
              <div className="text-[11px] uppercase text-white/65">Puntos</div>
              <div className="text-xl font-black">{user.points}</div>
            </div>
            <div className="rounded-md border border-white/18 bg-white/10 px-3 py-2 backdrop-blur">
              <div className="text-[11px] uppercase text-white/65">Ranking</div>
              <div className="text-xl font-black">#{userRank || "-"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="overflow-hidden p-3 transition-all hover:border-primary/35 hover:shadow-[var(--shadow-soft)] animate-slide-up sm:p-4"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="mt-1 text-2xl font-black">{s.value}</div>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color} shadow-[var(--shadow-soft)]`}
                >
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!isAdmin && !specialLocked && !specialPred && (
        <Card className="mb-5 overflow-hidden border-primary/30 bg-[var(--gradient-primary)] p-4 text-primary-foreground shadow-[var(--shadow-soft)] animate-slide-up">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Star className="h-6 w-6" />
            </div>
            <div className="min-w-[200px] flex-1">
              <div className="font-bold">¡Hacé tu pronóstico del Mundial!</div>
              <div className="text-sm text-primary-foreground/82">
                Campeón, goleador y final. Tiempo restante: {timeUntilSpecialDeadline()}
              </div>
            </div>
            <Link to="/special" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full font-semibold sm:w-auto">
                Predecir <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {!isAdmin && !specialLocked && specialPred && (
        <Card className="mb-5 border-primary/20 bg-primary/5 p-3 animate-slide-up">
          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
            <Star className="h-4 w-4 text-primary" />
            <span>
              Pronóstico cargado. Podés modificarlo hasta el cierre ({timeUntilSpecialDeadline()}{" "}
              restantes).
            </span>
            <Link
              to="/special"
              className="text-sm font-semibold text-primary-deep hover:underline sm:ml-auto"
            >
              Ver / Editar
            </Link>
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black">
            {isAdmin ? "Partidos del día" : "Calendario de hoy"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("es-UY", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Link to="/calendar" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            Ver por fecha <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {todayMatches.length === 0 ? (
        <Card className="p-8 text-center sm:p-12">
          <CalendarDays className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            {isAdmin
              ? "No hay partidos para gestionar hoy"
              : "No hay partidos programados para hoy"}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
