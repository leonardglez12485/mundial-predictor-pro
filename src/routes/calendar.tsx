import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { usePredictions } from "@/context/PredictionsContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { formatMatchStage, getLocalDateKey } from "@/lib/match-display";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendario — Balero World Cup" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--gradient-soft)]">
        <Header />
        <CalendarView />
      </div>
    </AuthGuard>
  );
}

function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function CalendarView() {
  const { matches, loading } = usePredictions();
  const availablePhases = useMemo(
    () => ["all", ...new Set(matches.map((match) => match.phase ?? "Partido"))],
    [matches],
  );
  const availableDates = useMemo(
    () => [...new Set(matches.map((match) => getLocalDateKey(match.kickoff)))].sort((left, right) => left.localeCompare(right)),
    [matches],
  );

  const preferredDate = useMemo(() => {
    const today = getLocalDateKey(new Date().toISOString());
    return availableDates.find((date) => date >= today) ?? availableDates[0] ?? "";
  }, [availableDates]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("all");
  const effectiveDate = selectedDate || preferredDate;
  const selectedIndex = availableDates.indexOf(effectiveDate);
  const dayMatches = matches.filter((match) => getLocalDateKey(match.kickoff) === effectiveDate && (selectedPhase === "all" || (match.phase ?? "Partido") === selectedPhase));

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <Card className="p-10 text-center text-muted-foreground">Cargando calendario completo...</Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al dashboard
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Calendario por fecha</h1>
          <p className="mt-1 text-muted-foreground">Revisa el fixture completo día por día.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-background/80 p-2 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            disabled={selectedIndex <= 0}
            onClick={() => setSelectedDate(availableDates[selectedIndex - 1] ?? effectiveDate)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <input
            type="date"
            value={effectiveDate}
            min={availableDates[0]}
            max={availableDates[availableDates.length - 1]}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            disabled={selectedIndex < 0 || selectedIndex >= availableDates.length - 1}
            onClick={() => setSelectedDate(availableDates[selectedIndex + 1] ?? effectiveDate)}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto pb-1">
        {availablePhases.map((phase) => (
          <button
            key={phase}
            type="button"
            onClick={() => setSelectedPhase(phase)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${phase === selectedPhase ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          >
            {phase === "all" ? "Todas las fases" : formatMatchStage({ id: "", home: { code: "", name: "", flag: "" }, away: { code: "", name: "", flag: "" }, kickoff: new Date().toISOString(), status: "pending", phase })}
          </button>
        ))}
      </div>

      <Card className="mb-6 overflow-hidden p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]">
            <CalendarDays className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-lg font-bold capitalize">{effectiveDate ? formatDateLabel(effectiveDate) : "Sin fecha"}</div>
            <div className="text-sm text-muted-foreground">{dayMatches.length} partidos {selectedPhase === "all" ? "programados" : `en ${formatMatchStage({ id: "", home: { code: "", name: "", flag: "" }, away: { code: "", name: "", flag: "" }, kickoff: new Date().toISOString(), status: "pending", phase: selectedPhase })}`}</div>
          </div>
        </div>
      </Card>

      {dayMatches.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No hay partidos programados para esta fecha.</p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {dayMatches.map((match, index) => (
            <div key={match.id} className="animate-slide-up" style={{ animationDelay: `${index * 70}ms` }}>
              <MatchCard match={match} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}