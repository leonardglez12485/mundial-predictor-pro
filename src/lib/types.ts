export type MatchStatus = "pending" | "live" | "finished";
export type UserRole = "admin" | "user";

export interface Team {
  code: string;        // ISO-2 country code (lowercase) e.g. "uy", "ar"
  name: string;
  flag: string;        // emoji fallback
  group?: string;
}

export interface Match {
  id: string;
  home: Team;
  away: Team;
  kickoff: string; // ISO datetime
  status: MatchStatus;
  phase?: string;
  group?: string;
  result?: { homeGoals: number; awayGoals: number; scorers: string[] };
}

export interface Prediction {
  matchId: string;
  userId: string;
  winner: "home" | "away" | "draw";
  homeGoals: number;
  awayGoals: number;
  scorers: string[];
  updatedAt: string;
}

export interface SpecialPrediction {
  userId: string;
  championCode: string;          // team code
  topScorer: string;             // player name
  finalHomeCode: string;
  finalAwayCode: string;
  finalHomeGoals: number;
  finalAwayGoals: number;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;       // initials
  password?: string;
  points: number;
  role: UserRole;
}
