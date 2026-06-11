function createTeamMap(teams) {
  return Object.fromEntries(teams.map((team) => [team.code, team]));
}
function groupTeams(teams) {
  const groupedTeams = /* @__PURE__ */ new Map();
  for (const team of teams) {
    const group = team.group ?? "Sin grupo";
    const currentTeams = groupedTeams.get(group) ?? [];
    currentTeams.push(team);
    groupedTeams.set(group, currentTeams);
  }
  return [...groupedTeams.entries()].sort(([groupA], [groupB]) => groupA.localeCompare(groupB, "es")).map(([group, grouped]) => ({
    group,
    teams: [...grouped].sort((teamA, teamB) => teamA.name.localeCompare(teamB.name, "es"))
  }));
}
export {
  createTeamMap as c,
  groupTeams as g
};
