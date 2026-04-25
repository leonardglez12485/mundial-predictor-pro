const MATCH_SCORER_SEPARATOR = "::";

export interface ScorerEntry {
  name: string;
  teamCode?: string;
}

export function serializeScorerEntry(teamCode: string, name: string) {
  return `${teamCode.trim().toLowerCase()}${MATCH_SCORER_SEPARATOR}${name.trim()}`;
}

export function parseScorerEntry(value: string): ScorerEntry {
  const trimmedValue = value.trim();
  const [teamCode, ...nameParts] = trimmedValue.split(MATCH_SCORER_SEPARATOR);

  if (nameParts.length === 0) {
    return { name: trimmedValue, teamCode: undefined };
  }

  return {
    teamCode: teamCode.trim().toLowerCase(),
    name: nameParts.join(MATCH_SCORER_SEPARATOR).trim(),
  };
}

export function scorerEntriesMatch(leftScorer: ScorerEntry, rightScorer: ScorerEntry) {
  const leftName = leftScorer.name.trim().toLowerCase();
  const rightName = rightScorer.name.trim().toLowerCase();

  if (!leftName || !rightName || leftName !== rightName) {
    return false;
  }

  return !leftScorer.teamCode || !rightScorer.teamCode || leftScorer.teamCode === rightScorer.teamCode;
}

export function splitScorerSelections(
  scorers: string[],
  homeCode: string,
  awayCode: string,
  homeGoals: number,
  awayGoals: number,
) {
  const parsedScorers = scorers.map((scorer) => parseScorerEntry(scorer)).filter((scorer) => scorer.name);
  const homeScorers = parsedScorers
    .filter((scorer) => scorer.teamCode === homeCode)
    .map((scorer) => serializeScorerEntry(homeCode, scorer.name));
  const awayScorers = parsedScorers
    .filter((scorer) => scorer.teamCode === awayCode)
    .map((scorer) => serializeScorerEntry(awayCode, scorer.name));
  const legacyScorers = parsedScorers
    .filter((scorer) => scorer.teamCode !== homeCode && scorer.teamCode !== awayCode)
    .map((scorer) => scorer.name);

  while (homeScorers.length < homeGoals && legacyScorers.length > 0) {
    homeScorers.push(serializeScorerEntry(homeCode, legacyScorers.shift()!));
  }

  while (awayScorers.length < awayGoals && legacyScorers.length > 0) {
    awayScorers.push(serializeScorerEntry(awayCode, legacyScorers.shift()!));
  }

  return {
    homeScorers,
    awayScorers,
  };
}