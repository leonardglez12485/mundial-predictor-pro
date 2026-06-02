import type {
  Match,
  Player,
  Prediction,
  SpecialPrediction,
  Team,
  TeamDetail,
  User,
} from "@/lib/types";

export type PublicUser = Omit<User, "password">;
export type RankingEntry = PublicUser & { rank: number };
export type AuthSession = {
  accessToken: string;
  expiresIn: string;
  user: PublicUser;
};

type RequestOptions = {
  requiresAuth?: boolean;
  retryOnUnauthorized?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

let accessToken: string | null = null;
let refreshPromise: Promise<AuthSession | null> | null = null;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toJsonBody(body: BodyInit | null | undefined) {
  if (body === undefined || body === null || body instanceof FormData || typeof body !== "object") {
    return body;
  }

  return JSON.stringify(body);
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function getErrorMessage(data: unknown, fallback: string) {
  if (isRecord(data)) {
    if (typeof data.message === "string") {
      return data.message;
    }

    if (Array.isArray(data.message) && typeof data.message[0] === "string") {
      return data.message[0];
    }

    if (typeof data.error === "string") {
      return data.error;
    }
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return fallback;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<T> {
  const requiresAuth = options.requiresAuth ?? true;
  const retryOnUnauthorized = options.retryOnUnauthorized ?? requiresAuth;
  const headers = new Headers(init.headers ?? {});

  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      body: toJsonBody(init.body),
      headers,
      credentials: "include",
    });
  } catch (error) {
    throw new ApiError(
      "No se pudo conectar con el backend. Verificá que la API esté corriendo en http://localhost:3001.",
      0,
      error,
    );
  }

  if (response.status === 401 && retryOnUnauthorized && path !== "/auth/refresh") {
    const refreshedSession = await api.auth.refresh();
    if (refreshedSession?.accessToken) {
      return request<T>(path, init, { ...options, retryOnUnauthorized: false });
    }
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, "Error de servidor"), response.status, data);
  }

  return data as T;
}

function setSession(session: AuthSession | null) {
  accessToken = session?.accessToken ?? null;
  return session;
}

export function readApiError(error: unknown, fallback = "Ocurrió un error") {
  if (error instanceof ApiError) {
    return getErrorMessage(error.data, error.message || fallback);
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export const api = {
  auth: {
    async login(identifier: string, password: string) {
      const session = await request<AuthSession>(
        "/auth/login",
        {
          method: "POST",
          body: { identifier, password } as unknown as BodyInit,
        },
        { requiresAuth: false, retryOnUnauthorized: false },
      );
      return setSession(session);
    },
    async register(name: string, email: string, password: string) {
      const session = await request<AuthSession>(
        "/auth/register",
        {
          method: "POST",
          body: { name, email, password } as unknown as BodyInit,
        },
        { requiresAuth: false, retryOnUnauthorized: false },
      );
      return setSession(session);
    },
    async refresh() {
      if (!refreshPromise) {
        refreshPromise = request<AuthSession>(
          "/auth/refresh",
          { method: "POST" },
          { requiresAuth: false, retryOnUnauthorized: false },
        )
          .then((session) => setSession(session))
          .catch(() => setSession(null))
          .finally(() => {
            refreshPromise = null;
          });
      }

      return refreshPromise;
    },
    async logout() {
      try {
        await request<{ ok: boolean }>(
          "/auth/logout",
          { method: "POST" },
          { requiresAuth: false, retryOnUnauthorized: false },
        );
      } finally {
        setSession(null);
      }
    },
    me() {
      return request<PublicUser>("/auth/me");
    },
  },
  users: {
    changePassword(currentPassword: string, nextPassword: string) {
      return request<{ ok: boolean }>("/users/me/password", {
        method: "PATCH",
        body: { currentPassword, nextPassword } as unknown as BodyInit,
      });
    },
  },
  ranking: {
    list() {
      return request<RankingEntry[]>(
        "/ranking",
        { method: "GET" },
        { requiresAuth: false, retryOnUnauthorized: false },
      );
    },
  },
  teams: {
    list() {
      return request<Team[]>(
        "/teams",
        { method: "GET" },
        { requiresAuth: false, retryOnUnauthorized: false },
      );
    },
    detail(code: string) {
      return request<TeamDetail>(
        `/teams/${code}`,
        { method: "GET" },
        { requiresAuth: false, retryOnUnauthorized: false },
      );
    },
    createPlayer(
      code: string,
      input: {
        name: string;
        position: "P" | "DEF" | "MED" | "DEL";
        shirtNumber?: number;
        club?: string;
      },
    ) {
      return request<Player>(`/teams/${code}/players`, {
        method: "POST",
        body: input as unknown as BodyInit,
      });
    },
    updatePlayer(
      code: string,
      playerId: string,
      input: {
        name?: string;
        position?: "P" | "DEF" | "MED" | "DEL";
        shirtNumber?: number | null;
        club?: string | null;
        active?: boolean;
      },
    ) {
      return request<Player>(`/teams/${code}/players/${playerId}`, {
        method: "PATCH",
        body: input as unknown as BodyInit,
      });
    },
  },
  matches: {
    list() {
      return request<Match[]>(
        "/matches",
        { method: "GET" },
        { requiresAuth: false, retryOnUnauthorized: false },
      );
    },
    create(input: {
      homeTeamCode: string;
      awayTeamCode: string;
      kickoff: string;
      group?: string;
      phase?: string;
    }) {
      return request<Match>("/matches", {
        method: "POST",
        body: input as unknown as BodyInit,
      });
    },
    updateStatus(id: string, status: Match["status"]) {
      return request<Match>(`/matches/${id}/status`, {
        method: "PATCH",
        body: { status } as unknown as BodyInit,
      });
    },
    updateParticipants(id: string, input: { homeTeamCode: string; awayTeamCode: string }) {
      return request<Match>(`/matches/${id}/participants`, {
        method: "PATCH",
        body: input as unknown as BodyInit,
      });
    },
    updateResult(
      id: string,
      result: {
        homeGoals: number;
        awayGoals: number;
        homeScorers: string[];
        awayScorers: string[];
      },
    ) {
      return request<Match>(`/matches/${id}/result`, {
        method: "PATCH",
        body: result as unknown as BodyInit,
      });
    },
    remove(id: string) {
      return request<{ ok: boolean }>(`/matches/${id}`, { method: "DELETE" });
    },
  },
  predictions: {
    mine() {
      return request<Prediction[]>("/predictions/me", { method: "GET" });
    },
    upsert(matchId: string, prediction: Omit<Prediction, "matchId" | "userId" | "updatedAt">) {
      return request<Prediction>(`/predictions/match/${matchId}`, {
        method: "PUT",
        body: prediction as unknown as BodyInit,
      });
    },
  },
  specialPredictions: {
    mine() {
      return request<SpecialPrediction | null>("/special-predictions/me", { method: "GET" });
    },
    upsert(prediction: Omit<SpecialPrediction, "userId" | "updatedAt">) {
      return request<SpecialPrediction>("/special-predictions/me", {
        method: "PUT",
        body: prediction as unknown as BodyInit,
      });
    },
  },
};
