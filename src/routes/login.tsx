import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import heroImg from "@/assets/uruguay-hero.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión — Balero World Cup" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-soft)]">
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        {/* Left: brand + image */}
        <section className="text-center lg:text-left">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-primary-deep to-primary bg-clip-text text-transparent">
            Balero World Cup
          </h1>
          <p className="mt-3 text-lg text-foreground/80 sm:text-xl">
            Predecí los partidos del Mundial, sumá puntos y subí en el ranking. Cree en grande.
          </p>

          <div className="mt-8 overflow-hidden rounded-3xl shadow-[var(--shadow-elegant)] ring-1 ring-primary/20 animate-slide-up">
            <img
              src={heroImg}
              alt="Selección uruguaya — Balero World Cup"
              className="h-auto w-full object-cover"
              loading="eager"
            />
          </div>
        </section>

        {/* Right: login card */}
        <section className="mx-auto w-full max-w-md lg:mx-0">
          <Card className="border-border/50 p-6 shadow-[var(--shadow-elegant)]">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Email o usuario"
                className="h-14 text-base"
                autoComplete="username"
              />
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Contraseña"
                className="h-14 text-base"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-[var(--gradient-primary)] text-base font-bold shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-glow)]"
              >
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </Button>

              <div className="text-center">
                <button type="button" className="text-sm text-primary-deep hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="my-3 h-px bg-border" />

              <Link to="/register">
                <Button type="button" className="h-12 w-full bg-success text-base font-bold text-success-foreground hover:opacity-90">
                  Crear cuenta nueva
                </Button>
              </Link>
            </form>
          </Card>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            <strong>Crea una cuenta</strong> para predecir partidos del Mundial.
          </p>
        </section>
      </main>
    </div>
  );
}
