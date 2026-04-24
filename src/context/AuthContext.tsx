import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { MOCK_USERS } from "@/lib/mockData";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updatePoints: (userId: string, points: number) => void;
  changePassword: (current: string, next: string) => { ok: boolean; error?: string };
}

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_USERS = "prode_users";
const STORAGE_SESSION = "prode_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window === "undefined") return MOCK_USERS;
    const stored = localStorage.getItem(STORAGE_USERS);
    return stored ? JSON.parse(stored) : MOCK_USERS;
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = localStorage.getItem(STORAGE_SESSION);
    if (session) {
      const id = JSON.parse(session);
      const found = users.find(u => u.id === id);
      if (found) setUser(found);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }, [users]);

  const persistSession = (id: string | null) => {
    if (id) localStorage.setItem(STORAGE_SESSION, JSON.stringify(id));
    else localStorage.removeItem(STORAGE_SESSION);
  };

  const login = (email: string, password: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, error: "Usuario no encontrado" };
    if (found.password !== password) return { ok: false, error: "Contraseña incorrecta" };
    setUser(found);
    persistSession(found.id);
    return { ok: true };
  };

  const register = (name: string, email: string, password: string) => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "El email ya está registrado" };
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name, email, password,
      avatar: name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase(),
      points: 0,
      role: "user",
    };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    persistSession(newUser.id);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    persistSession(null);
  };

  const updatePoints = (userId: string, points: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, points } : u));
    setUser(prev => prev && prev.id === userId ? { ...prev, points } : prev);
  };

  const changePassword = (current: string, next: string) => {
    if (!user) return { ok: false, error: "No hay sesión" };
    if (user.password !== current) return { ok: false, error: "Contraseña actual incorrecta" };
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: next } : u));
    setUser({ ...user, password: next });
    return { ok: true };
  };

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, updatePoints, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
