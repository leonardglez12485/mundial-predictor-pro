import type { Match, Prediction } from "./types";

export const PREDICTION_LOCK_MINUTES = 60;

// Mundial 2026 — kick-off oficial: 11 de junio 2026
export const WORLD_CUP_START_ISO = "2026-06-11T00:00:00.000Z";
// Deadline para predicciones especiales: 1 día antes
export const SPECIAL_PREDICTION_DEADLINE_ISO = "2026-06-10T00:00:00.000Z";

export function isWorldCupStarted(): boolean {
  return Date.now() >= new Date(WORLD_CUP_START_ISO).getTime();
}

export function isSpecialPredictionLocked(): boolean {
  return Date.now() >= new Date(SPECIAL_PREDICTION_DEADLINE_ISO).getTime();
}

export function timeUntilSpecialDeadline(): string {
  const ms = new Date(SPECIAL_PREDICTION_DEADLINE_ISO).getTime() - Date.now();
  if (ms <= 0) return "Cerrado";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

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
