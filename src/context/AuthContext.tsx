import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, type PublicUser, readApiError } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthActionResult = { ok: boolean; error?: string };

interface AuthState {
  user: User | null;
  users: User[];
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  updatePoints: (userId: string, points: number) => void;
  changePassword: (current: string, next: string) => Promise<AuthActionResult>;
  refreshCurrentUser: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function toUser(user: PublicUser): User {
  return {
    ...user,
    password: "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const [session, ranking] = await Promise.all([
          api.auth.refresh(),
          api.ranking.list().catch(() => []),
        ]);

        if (!active) {
          return;
        }

        setUsers(ranking.map(({ rank: _rank, ...entry }) => toUser(entry)));
        setUser(session?.user ? toUser(session.user) : null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const refreshUsers = async () => {
    const ranking = await api.ranking.list();
    setUsers(ranking.map(({ rank: _rank, ...entry }) => toUser(entry)));
  };

  const refreshCurrentUser = async () => {
    const currentUser = await api.auth.me();
    setUser(toUser(currentUser));
  };

  const login = async (emailOrUser: string, password: string) => {
    try {
      const session = await api.auth.login(emailOrUser.trim(), password);
      if (!session) {
        return { ok: false, error: "No fue posible iniciar sesión" };
      }
      setUser(toUser(session.user));
      await refreshUsers();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: readApiError(error, "No fue posible iniciar sesión") };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const session = await api.auth.register(name.trim(), email.trim(), password);
      if (!session) {
        return { ok: false, error: "No fue posible crear la cuenta" };
      }
      setUser(toUser(session.user));
      await refreshUsers();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: readApiError(error, "No fue posible crear la cuenta") };
    }
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    setUsers([]);
  };

  const updatePoints = (userId: string, points: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, points } : u));
    setUser(prev => prev && prev.id === userId ? { ...prev, points } : prev);
  };

  const changePassword = async (current: string, next: string) => {
    if (!user) {
      return { ok: false, error: "No hay sesión" };
    }

    try {
      await api.users.changePassword(current, next);
      await Promise.all([refreshCurrentUser(), refreshUsers()]);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: readApiError(error, "No fue posible actualizar la contraseña") };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        login,
        register,
        logout,
        updatePoints,
        changePassword,
        refreshCurrentUser,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
