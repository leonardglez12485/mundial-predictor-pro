import type { Match } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { formatKickoff, formatCountdown, isPredictionLocked, minutesUntilKickoff, PREDICTION_LOCK_MINUTES } from "@/lib/scoring";
import { Lock, Clock, CheckCircle2, Radio } from "lucide-react";
import { usePredictions } from "@/context/PredictionsContext";
import { useAuth } from "@/context/AuthContext";
import { Flag } from "@/components/Flag";

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-secondary text-secondary-foreground", icon: Clock },
  live: { label: "En juego", color: "bg-destructive/10 text-destructive border-destructive/30", icon: Radio },
  finished: { label: "Finalizado", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

export function MatchCard({ match }: { match: Match }) {
  const { user } = useAuth();
  const { getPrediction } = usePredictions();
  const prediction = user ? getPrediction(match.id, user.id) : undefined;
  const locked = isPredictionLocked(match);
  const status = statusConfig[match.status];
  const StatusIcon = status.icon;
  const mins = minutesUntilKickoff(match.kickoff);

  return (
    <Card className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[var(--gradient-primary)] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="mb-4 flex items-center justify-between">
        <Badge variant="outline" className={`${status.color} gap-1.5 font-medium`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
        {match.group && <span className="text-xs font-medium text-muted-foreground">Grupo {match.group}</span>}
      </div>

      <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center text-center">
          <Flag team={match.home} size={36} className="mb-2" />
          <div className="text-sm font-semibold">{match.home.name}</div>
        </div>
        <div className="flex flex-col items-center">
          {match.result ? (
            <div className="text-2xl font-bold tabular-nums">
              {match.result.homeGoals} <span className="text-muted-foreground">-</span> {match.result.awayGoals}
            </div>
          ) : (
            <div className="text-xl font-bold text-muted-foreground">VS</div>
          )}
          <div className="mt-1 text-xs text-muted-foreground">{formatKickoff(match.kickoff)}</div>
        </div>
        <div className="flex flex-col items-center text-center">
          <Flag team={match.away} size={36} className="mb-2" />
          <div className="text-sm font-semibold">{match.away.name}</div>
        </div>
      </div>

      {match.status === "pending" && (
        <div className="mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatCountdown(match.kickoff)}
        </div>
      )}

      {prediction && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
          <div className="text-xs text-muted-foreground">Tu predicción</div>
          <div className="text-lg font-bold text-primary-deep">
            {prediction.homeGoals} - {prediction.awayGoals}
          </div>
        </div>
      )}

      <Link to="/match/$matchId" params={{ matchId: match.id }}>
        <Button
          variant={locked ? "outline" : "default"}
          className="w-full"
          disabled={match.status === "finished"}
        >
          {match.status === "finished" ? (
            <>Ver resultado</>
          ) : locked ? (
            <><Lock className="mr-2 h-4 w-4" />
              {mins < 0 ? "Cerrado (en juego)" : `Cerrado (${PREDICTION_LOCK_MINUTES}min)`}
            </>
          ) : prediction ? "Editar predicción" : "Hacer predicción"}
        </Button>
      </Link>
    </Card>
  );
}
