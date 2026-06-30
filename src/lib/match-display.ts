import type { Match, Team } from "@/lib/types";

export function isPlaceholderTeam(team: Team) {
  return team.code.startsWith("slot-");
}

export function hasResolvedParticipants(match: Match) {
  return !isPlaceholderTeam(match.home) && !isPlaceholderTeam(match.away);
}

export function isKnockoutMatch(match: Match) {
  return !match.group && match.phase !== "Group";
}

export function hasPenaltyShootout(match: Match) {
  return (
    match.result?.homePenaltyGoals !== undefined && match.result.awayPenaltyGoals !== undefined
  );
}

export function formatMatchStage(match: Match) {
  if (match.phase === "Group" && match.group) {
    return `Grupo ${match.group}`;
  }

  switch (match.phase) {
    case "R32":
      return "Dieciseisavos";
    case "R16":
      return "Octavos";
    case "QF":
      return "Cuartos";
    case "SF":
      return "Semifinal";
    case "3P":
      return "Tercer puesto";
    case "Final":
      return "Final";
    default:
      return match.group ? `Grupo ${match.group}` : "Partido";
  }
}

export function getLocalDateKey(isoDate: string) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
