import type { Match, Team } from "@/lib/types";
import { groupTeams } from "@/lib/teams";

export interface GroupStandingRow {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupStandingTable {
  group: string;
  rows: GroupStandingRow[];
}

export interface TopScorerRow {
  name: string;
  goals: number;
  teamCode?: string;
  teamName?: string;
}

export function buildGroupTables(teams: Team[], matches: Match[]): GroupStandingTable[] {
  const groupedTeams = groupTeams(teams).filter(({ group }) => group !== "Sin grupo");

  return groupedTeams.map(({ group, teams: teamsInGroup }) => {
    const rowMap = new Map<string, GroupStandingRow>(
      teamsInGroup.map((team) => [team.code, createEmptyRow(team)]),
    );

    for (const match of matches) {
      if (!match.group || match.group !== group || !match.result) {
        continue;
      }

      const homeRow = rowMap.get(match.home.code);
      const awayRow = rowMap.get(match.away.code);
      if (!homeRow || !awayRow) {
        continue;
      }

      const { homeGoals, awayGoals } = match.result;

      homeRow.played += 1;
      awayRow.played += 1;
      homeRow.goalsFor += homeGoals;
      homeRow.goalsAgainst += awayGoals;
      awayRow.goalsFor += awayGoals;
      awayRow.goalsAgainst += homeGoals;

      if (homeGoals > awayGoals) {
        homeRow.won += 1;
        awayRow.lost += 1;
        homeRow.points += 3;
      } else if (homeGoals < awayGoals) {
        awayRow.won += 1;
        homeRow.lost += 1;
        awayRow.points += 3;
      } else {
        homeRow.drawn += 1;
        awayRow.drawn += 1;
        homeRow.points += 1;
        awayRow.points += 1;
      }

      homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;
      awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;
    }

    const rows = [...rowMap.values()].sort(compareStandingRows);
    return { group, rows };
  });
}

export function buildTopScorers(matches: Match[]): TopScorerRow[] {
  const goalsByPlayer = new Map<string, TopScorerRow>();

  for (const match of matches) {
    if (!match.result) {
      continue;
    }

    const scorerEntries = match.result.scorerEntries.length > 0
      ? match.result.scorerEntries
      : match.result.scorers.map((name) => ({ name, teamCode: undefined }));

    for (const scorer of scorerEntries) {
      const normalized = scorer.name.trim();
      if (!normalized) {
        continue;
      }

      const teamCode = scorer.teamCode;
      const key = teamCode ? `${teamCode}::${normalized.toLowerCase()}` : normalized.toLowerCase();
      const teamName = teamCode
        ? (match.home.code === teamCode ? match.home.name : match.away.code === teamCode ? match.away.name : undefined)
        : undefined;
      const existing = goalsByPlayer.get(key);

      if (existing) {
        existing.goals += 1;
        continue;
      }

      goalsByPlayer.set(key, {
        name: normalized,
        goals: 1,
        teamCode,
        teamName,
      });
    }
  }

  return [...goalsByPlayer.values()]
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, "es") || (a.teamName ?? "").localeCompare(b.teamName ?? "", "es"));
}

function createEmptyRow(team: Team): GroupStandingRow {
  return {
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function compareStandingRows(a: GroupStandingRow, b: GroupStandingRow) {
  return (
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.team.name.localeCompare(b.team.name, "es")
  );
}