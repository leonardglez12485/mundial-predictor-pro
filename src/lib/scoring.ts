import type { Match, Prediction } from "./types";

export const PREDICTION_LOCK_MINUTES = 60;

export function minutesUntilKickoff(kickoff: string): number {
  return Math.floor((new Date(kickoff).getTime() - Date.now()) / 60000);
}

export function isPredictionLocked(match: Match): boolean {
  if (match.status !== "pending") return true;
  return minutesUntilKickoff(match.kickoff) < PREDICTION_LOCK_MINUTES;
}

export function calculatePoints(prediction: Prediction, match: Match): number {
  if (!match.result) return 0;
  let pts = 0;
  const actualWinner: "home" | "away" | "draw" =
    match.result.homeGoals > match.result.awayGoals ? "home" :
    match.result.homeGoals < match.result.awayGoals ? "away" : "draw";

  if (prediction.winner === actualWinner) pts += 3;
  if (prediction.homeGoals === match.result.homeGoals && prediction.awayGoals === match.result.awayGoals) pts += 5;

  const actualScorers = [...match.result.scorers];
  for (const s of prediction.scorers) {
    const idx = actualScorers.findIndex(a => a.toLowerCase().trim() === s.toLowerCase().trim());
    if (idx >= 0) {
      pts += 2;
      actualScorers.splice(idx, 1);
    }
  }
  return pts;
}

export function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });
}

export function formatCountdown(iso: string): string {
  const mins = minutesUntilKickoff(iso);
  if (mins < 0) return "En curso";
  if (mins < 60) return `En ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `En ${h}h ${m}m`;
}
