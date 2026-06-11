const MATCH_SCORER_SEPARATOR = "::";
const OWN_GOAL_SCORER_NAME = "Autogol";
function serializeScorerEntry(teamCode, name) {
  return `${teamCode.trim().toLowerCase()}${MATCH_SCORER_SEPARATOR}${name.trim()}`;
}
function parseScorerEntry(value) {
  const trimmedValue = value.trim();
  const [teamCode, ...nameParts] = trimmedValue.split(MATCH_SCORER_SEPARATOR);
  if (nameParts.length === 0) {
    return { name: trimmedValue, teamCode: void 0 };
  }
  return {
    teamCode: teamCode.trim().toLowerCase(),
    name: nameParts.join(MATCH_SCORER_SEPARATOR).trim()
  };
}
function scorerEntriesMatch(leftScorer, rightScorer) {
  const leftName = leftScorer.name.trim().toLowerCase();
  const rightName = rightScorer.name.trim().toLowerCase();
  if (!leftName || !rightName || leftName !== rightName) {
    return false;
  }
  return !leftScorer.teamCode || !rightScorer.teamCode || leftScorer.teamCode === rightScorer.teamCode;
}
function splitScorerSelections(scorers, homeCode, awayCode, homeGoals, awayGoals) {
  const parsedScorers = scorers.map((scorer) => parseScorerEntry(scorer)).filter((scorer) => scorer.name);
  const homeScorers = parsedScorers.filter((scorer) => scorer.teamCode === homeCode).map((scorer) => serializeScorerEntry(homeCode, scorer.name));
  const awayScorers = parsedScorers.filter((scorer) => scorer.teamCode === awayCode).map((scorer) => serializeScorerEntry(awayCode, scorer.name));
  const legacyScorers = parsedScorers.filter((scorer) => scorer.teamCode !== homeCode && scorer.teamCode !== awayCode).map((scorer) => scorer.name);
  while (homeScorers.length < homeGoals && legacyScorers.length > 0) {
    homeScorers.push(serializeScorerEntry(homeCode, legacyScorers.shift()));
  }
  while (awayScorers.length < awayGoals && legacyScorers.length > 0) {
    awayScorers.push(serializeScorerEntry(awayCode, legacyScorers.shift()));
  }
  return {
    homeScorers,
    awayScorers
  };
}
export {
  OWN_GOAL_SCORER_NAME as O,
  serializeScorerEntry as a,
  scorerEntriesMatch as b,
  parseScorerEntry as p,
  splitScorerSelections as s
};
