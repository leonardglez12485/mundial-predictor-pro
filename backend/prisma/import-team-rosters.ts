import { PrismaClient } from "@prisma/client";
import { WORLD_CUP_TEAMS } from "./world-cup-teams";

type PlayerPosition = "P" | "DEF" | "MED" | "DEL";

type ImportedPlayer = {
  name: string;
  position: PlayerPosition;
  shirtNumber?: number;
  club?: string;
};

type ImportOptions = {
  dryRun: boolean;
  includePreliminary: boolean;
  teamCodes: Set<string> | null;
};

const TOURNAMENT_SQUADS_PAGE_TITLE = "2026_FIFA_World_Cup_squads";
const MAX_FINAL_SQUAD_SIZE = 26;

const TEAM_SECTION_TITLES: Record<string, string> = {
  mx: "Mexico",
  za: "South Africa",
  kr: "South Korea",
  cz: "Czech Republic",
  ca: "Canada",
  ba: "Bosnia and Herzegovina",
  qa: "Qatar",
  ch: "Switzerland",
  br: "Brazil",
  ma: "Morocco",
  ht: "Haiti",
  "gb-sct": "Scotland",
  us: "United States",
  py: "Paraguay",
  au: "Australia",
  tr: "Turkey",
  de: "Germany",
  cw: "Curaçao",
  ci: "Ivory Coast",
  ec: "Ecuador",
  nl: "Netherlands",
  jp: "Japan",
  se: "Sweden",
  tn: "Tunisia",
  be: "Belgium",
  eg: "Egypt",
  ir: "Iran",
  nz: "New Zealand",
  es: "Spain",
  cv: "Cape Verde",
  sa: "Saudi Arabia",
  uy: "Uruguay",
  fr: "France",
  sn: "Senegal",
  iq: "Iraq",
  no: "Norway",
  ar: "Argentina",
  dz: "Algeria",
  at: "Austria",
  jo: "Jordan",
  pt: "Portugal",
  cd: "DR Congo",
  uz: "Uzbekistan",
  co: "Colombia",
  gb: "England",
  hr: "Croatia",
  gh: "Ghana",
  pa: "Panama",
};

const prisma = new PrismaClient();

function parseArgs(argv: string[]): ImportOptions {
  let dryRun = false;
  let includePreliminary = false;
  const teamCodes = new Set<string>();

  for (const rawArg of argv) {
    const arg = rawArg.trim().toLowerCase();
    if (!arg) {
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--include-preliminary") {
      includePreliminary = true;
      continue;
    }

    teamCodes.add(arg);
  }

  return {
    dryRun,
    includePreliminary,
    teamCodes: teamCodes.size > 0 ? teamCodes : null,
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitTopLevel(value: string, delimiter: string) {
  const parts: string[] = [];
  let current = "";
  let braceDepth = 0;
  let bracketDepth = 0;

  for (const char of value) {
    if (char === "{") {
      braceDepth += 1;
    } else if (char === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
    } else if (char === "[") {
      bracketDepth += 1;
    } else if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
    }

    if (char === delimiter && braceDepth === 0 && bracketDepth === 0) {
      parts.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  parts.push(current);
  return parts;
}

function parseTemplateParams(templateLine: string) {
  let content = templateLine.trim();
  if (content.startsWith("{{")) {
    content = content.slice(2);
  }
  if (content.endsWith("}}")) {
    content = content.slice(0, -2);
  }

  const segments = splitTopLevel(content, "|");
  const params = new Map<string, string>();

  for (const segment of segments.slice(1)) {
    const separatorIndex = segment.indexOf("=");
    if (separatorIndex < 0) {
      continue;
    }

    const key = segment.slice(0, separatorIndex).trim().toLowerCase();
    const rawValue = segment.slice(separatorIndex + 1).trim();
    if (key) {
      params.set(key, rawValue);
    }
  }

  return params;
}

function stripHtmlAndComments(value: string) {
  return value
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<ref[^>]*\/>/gi, " ")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#124;/gi, "|");
}

function normalizePlayerName(rawValue: string) {
  let value = stripHtmlAndComments(rawValue);

  let previous = "";
  while (value !== previous) {
    previous = value;
    value = value
      .replace(/\{\{sortname\|([^|{}]+)\|([^|{}]+)(?:\|[^{}]*)?\}\}/gi, "$1 $2")
      .replace(/\{\{nowrap\|([^{}]+)\}\}/gi, "$1")
      .replace(/\{\{small\|([^{}]+)\}\}/gi, "$1")
      .replace(/\{\{nobold\|([^{}]+)\}\}/gi, "$1")
      .replace(/\{\{abbr\|([^|{}]+)\|([^|{}]+)\}\}/gi, "$1")
      .replace(/\{\{[^{}]*\}\}/g, " ");
  }

  value = value
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/''+/g, "")
    .replace(/[\u200e\u200f]/g, "");

  value = decodeEntities(value)
    .replace(/\s*\([^)]*\)$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return value;
}

function normalizeClubName(rawValue: string) {
  let value = stripHtmlAndComments(rawValue);

  let previous = "";
  while (value !== previous) {
    previous = value;
    value = value
      .replace(/\{\{nowrap\|([^{}]+)\}\}/gi, "$1")
      .replace(/\{\{small\|([^{}]+)\}\}/gi, "$1")
      .replace(/\{\{nobold\|([^{}]+)\}\}/gi, "$1")
      .replace(/\{\{abbr\|([^|{}]+)\|([^|{}]+)\}\}/gi, "$1")
      .replace(/\{\{[^{}]*\}\}/g, " ");
  }

  return decodeEntities(
    value
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      .replace(/''+/g, "")
      .replace(/[\u200e\u200f]/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function parseShirtNumber(rawValue: string) {
  const normalized = rawValue.trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 99) {
    return undefined;
  }

  return parsed;
}

function mapPosition(rawPosition: string): PlayerPosition | null {
  const normalized = rawPosition.toUpperCase();

  if (normalized.includes("GK")) {
    return "P";
  }

  if (normalized.includes("DF") || normalized.includes("CB") || normalized.includes("LB") || normalized.includes("RB")) {
    return "DEF";
  }

  if (normalized.includes("MF") || normalized.includes("DM") || normalized.includes("AM")) {
    return "MED";
  }

  if (normalized.includes("FW") || normalized.includes("ST") || normalized.includes("CF") || normalized.includes("WG")) {
    return "DEL";
  }

  return null;
}

function getTeamSection(wikitext: string, sectionTitle: string) {
  const headingMatch = new RegExp(`={3}\s*${escapeRegExp(sectionTitle)}\s*={3}`, "i").exec(wikitext);
  if (!headingMatch) {
    throw new Error(`No se encontró la sección ${sectionTitle}`);
  }

  const sectionStart = headingMatch.index + headingMatch[0].length;
  const remaining = wikitext.slice(sectionStart);
  const nextHeadingMatch = /\n={2,3}\s*[^=\n].*?={2,3}/.exec(remaining);

  return remaining.slice(0, nextHeadingMatch ? nextHeadingMatch.index : remaining.length);
}

function getRosterSection(teamSection: string) {
  const startMatch = /\{\{\s*nat fs g start\s*\}\}/i.exec(teamSection);
  if (!startMatch) {
    throw new Error("No se encontró la tabla de plantilla");
  }

  const remaining = teamSection.slice(startMatch.index);
  const endMatch = /\{\{\s*nat fs g end\s*\}\}/i.exec(remaining);

  return remaining.slice(0, endMatch ? endMatch.index + endMatch[0].length : remaining.length);
}

function hasFinalRosterAnnouncement(teamSection: string) {
  const preamble = teamSection.split(/\{\{\s*nat fs g start\s*\}\}/i, 1)[0];

  if (/final squad (?:will|to be) announced/i.test(preamble)) {
    return false;
  }

  return (
    /announced (?:their |the )?final squad/i.test(preamble) ||
    /their final squad was announced/i.test(preamble) ||
    /officially confirmed/i.test(preamble)
  );
}

function dedupePlayers(players: ImportedPlayer[]) {
  const seen = new Set<string>();
  return players.filter((player) => {
    const key = player.name.toLocaleLowerCase("es");
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function extractPlayersFromSection(section: string) {
  const players: ImportedPlayer[] = [];

  for (const rawLine of section.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!/^\{\{\s*nat fs/i.test(line) || !/player\|/i.test(line)) {
      continue;
    }

    const params = parseTemplateParams(line);
    const name = normalizePlayerName(params.get("name") ?? "");
    const position = mapPosition(params.get("pos") ?? params.get("position") ?? "");
    const shirtNumber = parseShirtNumber(params.get("no") ?? params.get("number") ?? params.get("num") ?? "");
    const club = normalizeClubName(params.get("club") ?? "");

    if (!name || !position) {
      continue;
    }

    players.push({ name, position, shirtNumber, club: club || undefined });
  }

  return dedupePlayers(players);
}

async function fetchTournamentSquadsPage() {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "parse",
    page: TOURNAMENT_SQUADS_PAGE_TITLE,
    prop: "wikitext",
    formatversion: "2",
    format: "json",
    origin: "*",
  }).toString();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wikipedia respondió ${response.status} para ${TOURNAMENT_SQUADS_PAGE_TITLE}`);
  }

  const payload = await response.json() as {
    error?: { info?: string };
    parse?: { wikitext?: string };
  };

  if (payload.error?.info) {
    throw new Error(payload.error.info);
  }

  const wikitext = payload.parse?.wikitext;
  if (!wikitext) {
    throw new Error(`No se recibió wikitext para ${TOURNAMENT_SQUADS_PAGE_TITLE}`);
  }

  return wikitext;
}

async function fetchRoster(teamCode: string, squadsPageWikitext: string) {
  const sectionTitle = TEAM_SECTION_TITLES[teamCode];
  if (!sectionTitle) {
    throw new Error(`No existe una sección configurada para ${teamCode}`);
  }

  const teamSection = getTeamSection(squadsPageWikitext, sectionTitle);
  const players = extractPlayersFromSection(getRosterSection(teamSection));
  if (players.length === 0) {
    throw new Error(`No se pudo extraer la plantilla de ${sectionTitle}`);
  }

  return {
    sectionTitle,
    players,
    final: players.length <= MAX_FINAL_SQUAD_SIZE || hasFinalRosterAnnouncement(teamSection),
    sourceUrl: `https://en.wikipedia.org/wiki/${TOURNAMENT_SQUADS_PAGE_TITLE}`,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const selectedTeams = WORLD_CUP_TEAMS.filter((team) => !options.teamCodes || options.teamCodes.has(team.code));

  if (selectedTeams.length === 0) {
    throw new Error("No hay equipos válidos para importar");
  }

  const missingMappings = selectedTeams
    .filter((team) => !TEAM_SECTION_TITLES[team.code])
    .map((team) => `${team.code} (${team.name})`);

  if (missingMappings.length > 0) {
    throw new Error(`Faltan secciones configuradas para: ${missingMappings.join(", ")}`);
  }

  const squadsPageWikitext = await fetchTournamentSquadsPage();

  let importedTeams = 0;
  let importedPlayers = 0;
  let skippedTeams = 0;

  for (const team of selectedTeams) {
    const roster = await fetchRoster(team.code, squadsPageWikitext);

    if (!options.includePreliminary && !roster.final) {
      skippedTeams += 1;
      console.log(
        `[skip] ${team.code} ${team.name}: ${roster.players.length} jugadores en lista preliminar (${roster.sourceUrl})`,
      );
      continue;
    }

    const persistedTeam = await prisma.team.upsert({
      where: { code: team.code },
      update: {
        name: team.name,
        flag: team.flag,
        group: team.group,
      },
      create: team,
    });

    if (!options.dryRun) {
      await prisma.$transaction([
        prisma.player.deleteMany({ where: { teamId: persistedTeam.id } }),
        prisma.player.createMany({
          data: roster.players.map((player) => ({
            teamId: persistedTeam.id,
            name: player.name,
            position: player.position,
            shirtNumber: player.shirtNumber,
            club: player.club,
            active: true,
          })),
        }),
      ]);
    }

    importedTeams += 1;
    importedPlayers += roster.players.length;

    console.log(
      `${options.dryRun ? "[dry-run] " : ""}${team.code} ${team.name}: ${roster.players.length} jugadores${
        roster.final ? "" : " (preliminar)"
      } (${roster.sourceUrl})`,
    );
  }

  console.log(
    `${options.dryRun ? "Validación completada" : "Importación completada"}: ${importedTeams} equipos, ${importedPlayers} jugadores, ${skippedTeams} equipos omitidos por plantilla preliminar.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
