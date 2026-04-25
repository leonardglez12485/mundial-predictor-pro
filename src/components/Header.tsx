import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, LogOut, KeyRound, LayoutDashboard, Medal, Star, Shield, CalendarDays } from "lucide-react";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function Header() {
  const { user, logout, changePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pwOpen, setPwOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await changePassword(current, next);
    if (res.ok) {
      toast.success("Contraseña actualizada");
      setPwOpen(false);
      setCurrent(""); setNext("");
    } else {
      toast.error(res.error || "Error");
    }
  };

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/calendar", label: "Calendario", icon: CalendarDays },
    ...(!isAdmin ? [{ to: "/special", label: "Mi pronóstico", icon: Star } as const] : []),
    { to: "/ranking", label: "Ranking", icon: Medal },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield } as const] : []),
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary-deep to-primary bg-clip-text text-transparent">
            Balero World Cup
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-xs text-muted-foreground">Puntos</div>
            <div className="text-sm font-bold text-primary-deep">{user.points} pts</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-[var(--gradient-primary)] font-semibold text-primary-foreground">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  <span className="mt-1 text-xs font-bold text-primary">{user.points} puntos</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/"><DropdownMenuItem><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</DropdownMenuItem></Link>
              <Link to="/calendar"><DropdownMenuItem><CalendarDays className="mr-2 h-4 w-4" />Calendario</DropdownMenuItem></Link>
              {!isAdmin && <Link to="/special"><DropdownMenuItem><Star className="mr-2 h-4 w-4" />Mi pronóstico</DropdownMenuItem></Link>}
              <Link to="/ranking"><DropdownMenuItem><Medal className="mr-2 h-4 w-4" />Ranking</DropdownMenuItem></Link>
              {isAdmin && (
                <Link to="/admin"><DropdownMenuItem><Shield className="mr-2 h-4 w-4" />Panel admin</DropdownMenuItem></Link>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setPwOpen(true); }}>
                <KeyRound className="mr-2 h-4 w-4" />Cambiar contraseña
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { void handleLogout(); }} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePw} className="space-y-4">
            <div className="space-y-2">
              <Label>Contraseña actual</Label>
              <Input type="password" value={current} onChange={e => setCurrent(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Nueva contraseña</Label>
              <Input type="password" value={next} onChange={e => setNext(e.target.value)} minLength={6} required />
            </div>
            <DialogFooter>
              <Button type="submit">Actualizar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
