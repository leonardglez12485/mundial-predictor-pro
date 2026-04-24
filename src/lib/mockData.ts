import type { Match, Team, User } from "./types";

const t = (code: string, name: string, flag: string): Team => ({ code, name, flag });

// Teams (code = ISO-2 lowercase for flagcdn)
export const TEAMS: Record<string, Team> = {
  uy: t("uy", "Uruguay", "🇺🇾"),
  ar: t("ar", "Argentina", "🇦🇷"),
  br: t("br", "Brasil", "🇧🇷"),
  es: t("es", "España", "🇪🇸"),
  fr: t("fr", "Francia", "🇫🇷"),
  gb: t("gb-eng", "Inglaterra", "🏴"),
  de: t("de", "Alemania", "🇩🇪"),
  pt: t("pt", "Portugal", "🇵🇹"),
  nl: t("nl", "Países Bajos", "🇳🇱"),
  it: t("it", "Italia", "🇮🇹"),
  mx: t("mx", "México", "🇲🇽"),
  us: t("us", "Estados Unidos", "🇺🇸"),
  ca: t("ca", "Canadá", "🇨🇦"),
  jp: t("jp", "Japón", "🇯🇵"),
  kr: t("kr", "Corea del Sur", "🇰🇷"),
  ma: t("ma", "Marruecos", "🇲🇦"),
};

const today = new Date();
const at = (hoursFromNow: number) => {
  const d = new Date(today);
  d.setMinutes(d.getMinutes() + Math.round(hoursFromNow * 60));
  return d.toISOString();
};

export const MOCK_MATCHES: Match[] = [
  { id: "m1", home: TEAMS.uy, away: TEAMS.ar, kickoff: at(2), status: "pending", group: "A" },
  { id: "m2", home: TEAMS.br, away: TEAMS.es, kickoff: at(4.5), status: "pending", group: "B" },
  { id: "m3", home: TEAMS.fr, away: TEAMS.gb, kickoff: at(7), status: "pending", group: "C" },
  { id: "m4", home: TEAMS.de, away: TEAMS.pt, kickoff: at(0.5), status: "pending", group: "D" },
  { id: "m5", home: TEAMS.uy, away: TEAMS.br, kickoff: at(-1), status: "live", group: "A",
    result: { homeGoals: 1, awayGoals: 0, scorers: ["Darwin Núñez"] } },
  { id: "m6", home: TEAMS.ar, away: TEAMS.fr, kickoff: at(-26), status: "finished", group: "B",
    result: { homeGoals: 3, awayGoals: 2, scorers: ["Messi", "Messi", "Álvarez", "Mbappé", "Mbappé"] } },
];

export const MOCK_USERS: User[] = [
  { id: "u-admin", name: "Admin", email: "admin@balero.com", avatar: "AD", password: "Realmadridfc*13", points: 0, role: "admin" },
  { id: "u1", name: "Diego Forlán", email: "diego@uy.com", avatar: "DF", password: "demo1234", points: 87, role: "user" },
  { id: "u2", name: "Luis Suárez", email: "luis@uy.com", avatar: "LS", password: "demo1234", points: 74, role: "user" },
  { id: "u3", name: "Edinson Cavani", email: "edi@uy.com", avatar: "EC", password: "demo1234", points: 65, role: "user" },
  { id: "u4", name: "Federico Valverde", email: "fede@uy.com", avatar: "FV", password: "demo1234", points: 58, role: "user" },
  { id: "u5", name: "Darwin Núñez", email: "darwin@uy.com", avatar: "DN", password: "demo1234", points: 42, role: "user" },
];
