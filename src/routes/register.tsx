import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Crear cuenta — Balero World Cup" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("La contraseña debe tener 6 caracteres mínimo");
    setLoading(true);

    const res = await register(name.trim(), email.trim(), password);
    if (res.ok) {
      toast.success("¡Cuenta creada!");
      navigate({ to: "/special" });
    } else {
      toast.error(res.error || "Error");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gradient-soft)] px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary-deep to-primary bg-clip-text text-transparent">
            Balero World Cup
          </h1>
        </div>

        <Card className="border-border/50 p-8 shadow-[var(--shadow-elegant)]">
          <h2 className="mb-1 text-xl font-semibold">Crear cuenta</h2>
          <p className="mb-6 text-sm text-muted-foreground">Únete y comienza a predecir</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)}
                required minLength={2} placeholder="Tu nombre" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="tu@email.com" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} placeholder="Mínimo 6 caracteres" className="h-11" />
            </div>

            <Button type="submit" disabled={loading}
              className="h-11 w-full bg-[var(--gradient-primary)] text-base font-semibold shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-glow)]">
              {loading ? "Creando..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">Inicia sesión</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
