import type { Match, Team, User } from "./types";

const t = (code: string, name: string, flag: string): Team => ({ code, name, flag });

const URU = t("URU", "Uruguay", "🇺🇾");
const ARG = t("ARG", "Argentina", "🇦🇷");
const BRA = t("BRA", "Brasil", "🇧🇷");
const ESP = t("ESP", "España", "🇪🇸");
const FRA = t("FRA", "Francia", "🇫🇷");
const ENG = t("ENG", "Inglaterra", "🏴󠁧󠁢󠁥󠁮󠁧󠁿");
const GER = t("GER", "Alemania", "🇩🇪");
const POR = t("POR", "Portugal", "🇵🇹");

const today = new Date();
const at = (hoursFromNow: number) => {
  const d = new Date(today);
  d.setMinutes(d.getMinutes() + Math.round(hoursFromNow * 60));
  return d.toISOString();
};

export const MOCK_MATCHES: Match[] = [
  { id: "m1", home: URU, away: ARG, kickoff: at(2), status: "pending", group: "A" },
  { id: "m2", home: BRA, away: ESP, kickoff: at(4.5), status: "pending", group: "B" },
  { id: "m3", home: FRA, away: ENG, kickoff: at(7), status: "pending", group: "C" },
  { id: "m4", home: GER, away: POR, kickoff: at(0.5), status: "pending", group: "D" },
  { id: "m5", home: URU, away: BRA, kickoff: at(-1), status: "live", group: "A",
    result: { homeGoals: 1, awayGoals: 0, scorers: ["Darwin Núñez"] } },
  { id: "m6", home: ARG, away: FRA, kickoff: at(-26), status: "finished", group: "B",
    result: { homeGoals: 3, awayGoals: 2, scorers: ["Messi", "Messi", "Álvarez", "Mbappé", "Mbappé"] } },
];

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Diego Forlán", email: "diego@uy.com", avatar: "DF", password: "demo1234", points: 87 },
  { id: "u2", name: "Luis Suárez", email: "luis@uy.com", avatar: "LS", password: "demo1234", points: 74 },
  { id: "u3", name: "Edinson Cavani", email: "edi@uy.com", avatar: "EC", password: "demo1234", points: 65 },
  { id: "u4", name: "Federico Valverde", email: "fede@uy.com", avatar: "FV", password: "demo1234", points: 58 },
  { id: "u5", name: "Darwin Núñez", email: "darwin@uy.com", avatar: "DN", password: "demo1234", points: 42 },
];
