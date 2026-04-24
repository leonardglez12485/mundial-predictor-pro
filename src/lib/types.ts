export type MatchStatus = "pending" | "live" | "finished";

export interface Team {
  code: string;
  name: string;
  flag: string; // emoji
}

export interface Match {
  id: string;
  home: Team;
  away: Team;
  kickoff: string; // ISO datetime
  status: MatchStatus;
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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // initials color seed
  password: string;
  points: number;
}
