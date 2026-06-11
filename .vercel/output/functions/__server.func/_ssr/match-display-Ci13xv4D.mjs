function isPlaceholderTeam(team) {
  return team.code.startsWith("slot-");
}
function hasResolvedParticipants(match) {
  return !isPlaceholderTeam(match.home) && !isPlaceholderTeam(match.away);
}
function formatMatchStage(match) {
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
function getLocalDateKey(isoDate) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export {
  formatMatchStage as f,
  getLocalDateKey as g,
  hasResolvedParticipants as h
};
