const MATCH_SCORER_SEPARATOR = "::";

export interface StoredScorerEntry {
  name: string;
  teamCode?: string;
}

export function serializeStoredScorer(teamCode: string, name: string) {
  return `${teamCode.trim().toLowerCase()}${MATCH_SCORER_SEPARATOR}${name.trim()}`;
}

export function parseStoredScorer(value: string): StoredScorerEntry {
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

export function scorersMatch(leftScorer: StoredScorerEntry, rightScorer: StoredScorerEntry) {
  const leftName = leftScorer.name.trim().toLowerCase();
  const rightName = rightScorer.name.trim().toLowerCase();

  if (!leftName || !rightName || leftName !== rightName) {
    return false;
  }

  return !leftScorer.teamCode || !rightScorer.teamCode || leftScorer.teamCode === rightScorer.teamCode;
}