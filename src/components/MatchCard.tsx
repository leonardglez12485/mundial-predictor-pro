import type { Match } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { formatKickoff, formatCountdown, isPredictionLocked } from "@/lib/scoring";
import { Lock, Clock, CheckCircle2, Radio, TimerReset } from "lucide-react";
import { usePredictions } from "@/context/PredictionsContext";
import { useAuth } from "@/context/AuthContext";
import { Flag } from "@/components/Flag";
import { formatMatchStage, hasResolvedParticipants } from "@/lib/match-display";

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-secondary text-secondary-foreground", icon: Clock },
  starting: {
    label: "Iniciando",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: TimerReset,
  },
  live: {
    label: "En Desarrollo",
    color: "bg-destructive/10 text-destructive border-destructive/30",
    icon: Radio,
  },
  delayed: {
    label: "Atrasado",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Clock,
  },
  finished: { label: "Finalizado", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

export function MatchCard({ match }: { match: Match }) {
  const { user } = useAuth();
  const { getPrediction } = usePredictions();
  const isAdmin = user?.role === "admin";
  const prediction = user ? getPrediction(match.id, user.id) : undefined;
  const locked = isPredictionLocked(match);
  const participantsResolved = hasResolvedParticipants(match);
  const status = statusConfig[match.status];
  const StatusIcon = status.icon;

  return (
    <Card className="group relative overflow-hidden rounded-2xl p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[var(--shadow-elegant)] sm:p-4">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--gradient-primary)] opacity-70 transition-opacity group-hover:opacity-100" />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={`${status.color} gap-1.5 rounded-md px-2 py-0.5 font-semibold`}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
        <span className="text-xs font-medium text-muted-foreground">{formatMatchStage(match)}</span>
      </div>

      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-col items-center text-center">
          <Flag team={match.home} size={30} className="mb-1.5 sm:h-8 sm:w-12" />
          <div className="max-w-full truncate text-xs font-semibold sm:text-sm">
            {match.home.name}
          </div>
        </div>
        <div className="flex min-w-[66px] flex-col items-center rounded-lg bg-secondary/55 px-2 py-1.5">
          {match.result ? (
            <div className="text-lg font-black tabular-nums sm:text-xl">
              {match.result.homeGoals} <span className="text-muted-foreground">-</span>{" "}
              {match.result.awayGoals}
            </div>
          ) : (
            <div className="text-base font-black text-muted-foreground sm:text-lg">VS</div>
          )}
          <div className="mt-1 text-center text-[11px] text-muted-foreground sm:text-xs">
            {formatKickoff(match.kickoff)}
          </div>
        </div>
        <div className="flex min-w-0 flex-col items-center text-center">
          <Flag team={match.away} size={30} className="mb-1.5 sm:h-8 sm:w-12" />
          <div className="max-w-full truncate text-xs font-semibold sm:text-sm">
            {match.away.name}
          </div>
        </div>
      </div>

      {match.status === "pending" && (
        <div className="mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatCountdown(match.kickoff)}
        </div>
      )}

      {!participantsResolved && (
        <div className="mb-4 rounded-lg border border-border bg-secondary/40 p-3 text-center text-xs text-muted-foreground">
          Cruce pendiente de clasificación
        </div>
      )}

      {prediction && (
        <div className="mb-3 rounded-lg border border-primary/20 bg-primary/10 p-2.5 text-center">
          <div className="text-xs text-muted-foreground">Tu predicción</div>
          <div className="text-lg font-bold text-primary-deep">
            {prediction.homeGoals} - {prediction.awayGoals}
          </div>
        </div>
      )}

      <Link
        to={isAdmin ? "/admin" : "/match/$matchId"}
        params={isAdmin ? undefined : { matchId: match.id }}
      >
        <Button
          variant={locked ? "outline" : "default"}
          className="w-full"
          disabled={isAdmin ? false : locked || !participantsResolved}
        >
          {isAdmin ? (
            <>Gestionar partido</>
          ) : !participantsResolved ? (
            <>Esperando clasificados</>
          ) : locked ? (
            <>
              <Lock className="mr-2 h-4 w-4" /> Cerrado
            </>
          ) : prediction ? (
            "Editar predicción"
          ) : (
            "Hacer predicción"
          )}
        </Button>
      </Link>
    </Card>
  );
}
