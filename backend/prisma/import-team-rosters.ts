import { PrismaClient } from "@prisma/client";
import { WORLD_CUP_TEAMS } from "./world-cup-teams";

type PlayerPosition = "P" | "DEF" | "MED" | "DEL";

type ImportedPlayer = {
  name: string;
  position: PlayerPosition;
};

type ImportOptions = {
  dryRun: boolean;
  teamCodes: Set<string> | null;
};

const prisma = new PrismaClient();

const TEAM_PAGE_TITLES: Record<string, string> = {
  mx: "Mexico_national_football_team",
  za: "South_Africa_national_soccer_team",
  kr: "South_Korea_national_football_team",
  cz: "Czech_Republic_national_football_team",
  ca: "Canada_men's_national_soccer_team",
  ba: "Bosnia_and_Herzegovina_national_football_team",
  qa: "Qatar_national_football_team",
  ch: "Switzerland_national_football_team",
  br: "Brazil_national_football_team",
  ma: "Morocco_national_football_team",
  ht: "Haiti_national_football_team",
  "gb-sct": "Scotland_national_football_team",
  us: "United_States_men's_national_soccer_team",
  py: "Paraguay_national_football_team",
  au: "Australia_men's_national_soccer_team",
  tr: "Turkey_national_football_team",
  de: "Germany_national_football_team",
  cw: "Curaçao_national_football_team",
  ci: "Ivory_Coast_national_football_team",
  ec: "Ecuador_national_football_team",
  nl: "Netherlands_national_football_team",
  jp: "Japan_national_football_team",
  se: "Sweden_men's_national_football_team",
  tn: "Tunisia_national_football_team",
  be: "Belgium_national_football_team",
  eg: "Egypt_national_football_team",
  ir: "Iran_national_football_team",
  nz: "New_Zealand_men's_national_football_team",
  es: "Spain_national_football_team",
  cv: "Cape_Verde_national_football_team",
  sa: "Saudi_Arabia_national_football_team",
  uy: "Uruguay_national_football_team",
  fr: "France_national_football_team",
  sn: "Senegal_national_football_team",
  iq: "Iraq_national_football_team",
  no: "Norway_national_football_team",
  ar: "Argentina_national_football_team",
  dz: "Algeria_national_football_team",
  at: "Austria_national_football_team",
  jo: "Jordan_national_football_team",
  pt: "Portugal_national_football_team",
  cd: "DR_Congo_national_football_team",
  uz: "Uzbekistan_national_football_team",
  co: "Colombia_national_football_team",
  gb: "England_national_football_team",
  hr: "Croatia_national_football_team",
  gh: "Ghana_national_football_team",
  pa: "Panama_national_football_team",
};

function parseArgs(argv: string[]): ImportOptions {
  let dryRun = false;
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

    teamCodes.add(arg);
  }

  return {
    dryRun,
    teamCodes: teamCodes.size > 0 ? teamCodes : null,
  };
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

function getCurrentSquadSection(wikitext: string) {
  const headingMatch = /={2,6}\s*Current squad\s*={2,6}/i.exec(wikitext);
  if (!headingMatch) {
    throw new Error("No se encontró la sección Current squad");
  }

  const sectionStart = headingMatch.index + headingMatch[0].length;
  const remaining = wikitext.slice(sectionStart);
  const nextHeadingMatch = /\n={2,6}\s*[^=\n].*?={2,6}/.exec(remaining);

  return remaining.slice(0, nextHeadingMatch ? nextHeadingMatch.index : remaining.length);
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

    if (!name || !position) {
      continue;
    }

    players.push({ name, position });
  }

  return dedupePlayers(players);
}

async function fetchRoster(teamCode: string) {
  const pageTitle = TEAM_PAGE_TITLES[teamCode];
  if (!pageTitle) {
    throw new Error(`No existe una página configurada para ${teamCode}`);
  }

  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "parse",
    page: pageTitle,
    prop: "wikitext",
    formatversion: "2",
    format: "json",
    origin: "*",
  }).toString();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wikipedia respondió ${response.status} para ${pageTitle}`);
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
    throw new Error(`No se recibió wikitext para ${pageTitle}`);
  }

  const players = extractPlayersFromSection(getCurrentSquadSection(wikitext));
  if (players.length === 0) {
    throw new Error(`No se pudo extraer la plantilla de ${pageTitle}`);
  }

  return {
    pageTitle,
    players,
    sourceUrl: `https://en.wikipedia.org/wiki/${pageTitle}`,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const selectedTeams = WORLD_CUP_TEAMS.filter((team) => !options.teamCodes || options.teamCodes.has(team.code));

  if (selectedTeams.length === 0) {
    throw new Error("No hay equipos válidos para importar");
  }

  const missingMappings = selectedTeams
    .filter((team) => !TEAM_PAGE_TITLES[team.code])
    .map((team) => `${team.code} (${team.name})`);

  if (missingMappings.length > 0) {
    throw new Error(`Faltan páginas configuradas para: ${missingMappings.join(", ")}`);
  }

  let importedTeams = 0;
  let importedPlayers = 0;

  for (const team of selectedTeams) {
    const roster = await fetchRoster(team.code);
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
            active: true,
          })),
        }),
      ]);
    }

    importedTeams += 1;
    importedPlayers += roster.players.length;

    console.log(
      `${options.dryRun ? "[dry-run] " : ""}${team.code} ${team.name}: ${roster.players.length} jugadores (${roster.sourceUrl})`,
    );
  }

  console.log(
    `${options.dryRun ? "Validación completada" : "Importación completada"}: ${importedTeams} equipos, ${importedPlayers} jugadores.`,
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