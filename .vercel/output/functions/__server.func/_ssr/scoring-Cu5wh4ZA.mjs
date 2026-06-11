import { c as createLucideIcon } from "./label-DWX2Ekou.mjs";
import { b as scorerEntriesMatch, p as parseScorerEntry } from "./scorer-entry-BM5_IaSg.mjs";
const __iconNode = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode);
const PREDICTION_LOCK_MINUTES = 60;
const WORLD_CUP_START_ISO = "2026-06-11T00:00:00.000Z";
const SPECIAL_PREDICTION_DEADLINE_ISO = "2026-06-10T00:00:00.000Z";
function isWorldCupStarted() {
  return Date.now() >= new Date(WORLD_CUP_START_ISO).getTime();
}
function isSpecialPredictionLocked() {
  return Date.now() >= new Date(SPECIAL_PREDICTION_DEADLINE_ISO).getTime();
}
function timeUntilSpecialDeadline() {
  const ms = new Date(SPECIAL_PREDICTION_DEADLINE_ISO).getTime() - Date.now();
  if (ms <= 0) return "Cerrado";
  const days = Math.floor(ms / 864e5);
  const hours = Math.floor(ms % 864e5 / 36e5);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}
function minutesUntilKickoff(kickoff) {
  return Math.floor((new Date(kickoff).getTime() - Date.now()) / 6e4);
}
function isPredictionLocked(match) {
  if (match.status !== "pending") return true;
  return minutesUntilKickoff(match.kickoff) < PREDICTION_LOCK_MINUTES;
}
function calculatePoints(prediction, match) {
  if (!match.result) return 0;
  let pts = 0;
  const actualWinner = match.result.homeGoals > match.result.awayGoals ? "home" : match.result.homeGoals < match.result.awayGoals ? "away" : "draw";
  if (prediction.winner === actualWinner) pts += 3;
  if (prediction.homeGoals === match.result.homeGoals && prediction.awayGoals === match.result.awayGoals) pts += 5;
  const actualScorers = [...match.result.scorerEntries.length > 0 ? match.result.scorerEntries : match.result.scorers.map((name) => ({ name }))];
  for (const s of prediction.scorers) {
    const idx = actualScorers.findIndex((actualScorer) => scorerEntriesMatch(actualScorer, parseScorerEntry(s)));
    if (idx >= 0) {
      pts += 2;
      actualScorers.splice(idx, 1);
    }
  }
  return pts;
}
function formatKickoff(iso) {
  return new Date(iso).toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });
}
function formatCountdown(iso) {
  const mins = minutesUntilKickoff(iso);
  if (mins < 0) return "En curso";
  if (mins < 60) return `En ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `En ${h}h ${m}m`;
}
export {
  Lock as L,
  isWorldCupStarted as a,
  isPredictionLocked as b,
  formatCountdown as c,
  calculatePoints as d,
  formatKickoff as f,
  isSpecialPredictionLocked as i,
  timeUntilSpecialDeadline as t
};
