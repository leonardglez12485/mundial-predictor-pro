import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión — Prode Mundial" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("diego@uy.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (res.ok) {
        toast.success("¡Bienvenido!");
        navigate({ to: "/" });
      } else {
        toast.error(res.error || "Error");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gradient-soft)] px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary-deep to-primary bg-clip-text text-transparent">
            Prode Mundial
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Predicciones del Mundial de Fútbol</p>
        </div>

        <Card className="border-border/50 p-8 shadow-[var(--shadow-elegant)]">
          <h2 className="mb-1 text-xl font-semibold">Iniciar sesión</h2>
          <p className="mb-6 text-sm text-muted-foreground">Bienvenido de vuelta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="tu@email.com" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" className="h-11" />
            </div>

            <Button type="submit" disabled={loading}
              className="h-11 w-full bg-[var(--gradient-primary)] text-base font-semibold shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-glow)]">
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">o</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Link to="/register">
            <Button variant="outline" className="h-11 w-full font-semibold">
              Crear cuenta nueva
            </Button>
          </Link>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo: <code className="rounded bg-secondary px-1.5 py-0.5">diego@uy.com</code> / <code className="rounded bg-secondary px-1.5 py-0.5">demo1234</code>
        </p>
      </div>
    </div>
  );
}
