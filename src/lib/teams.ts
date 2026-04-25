import type { Team } from "@/lib/types";

export function createTeamMap(teams: Team[]) {
  return Object.fromEntries(teams.map((team) => [team.code, team]));
}

export function groupTeams(teams: Team[]) {
  const groupedTeams = new Map<string, Team[]>();

  for (const team of teams) {
    const group = team.group ?? "Sin grupo";
    const currentTeams = groupedTeams.get(group) ?? [];
    currentTeams.push(team);
    groupedTeams.set(group, currentTeams);
  }

  return [...groupedTeams.entries()]
    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB, "es"))
    .map(([group, grouped]) => ({
      group,
      teams: [...grouped].sort((teamA, teamB) => teamA.name.localeCompare(teamB.name, "es")),
    }));
}