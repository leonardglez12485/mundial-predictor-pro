import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import worldCupLogo from "@/assets/world-cup-2026-mark.png";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import heroImg from "@/assets/uruguay-hero.png";
import seleccionImg from "@/assets/seleccion1.jpg";
import galleryImg from "@/assets/images.jpg";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(email, password);
    if (res.ok) {
      toast.success("¡Bienvenido!");
      navigate({ to: "/" });
    } else {
      toast.error(res.error || "Error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-svh overflow-y-auto bg-[var(--gradient-soft)] text-foreground">
      <main className="grid min-h-svh lg:grid-cols-[1.18fr_0.58fr] xl:grid-cols-[1.24fr_0.52fr]">
        <section className="stadium-hero relative hidden overflow-hidden border-r border-white/20 px-8 py-8 lg:flex lg:min-h-0 lg:px-10 xl:px-12">
          <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col justify-center gap-8 lg:gap-10">
            <div className="max-w-xl text-left">
              <BrandLogo
                size="lg"
                framed={false}
                subtitle="Mundial 2026"
                className="mb-4"
                titleClassName="text-4xl font-black leading-[0.92] text-white lg:text-5xl xl:text-6xl"
                subtitleClassName="text-white/72"
                imageClassName="h-18 w-18 sm:h-20 sm:w-20"
              />
              <p className="mt-4 max-w-md text-base leading-7 text-white/78 lg:text-lg">
                Predicciones, ranking y calendario en una experiencia compacta con una identidad
                más mundialista.
              </p>
            </div>

            <div className="relative h-[48vh] min-h-[380px] w-full max-w-[760px] lg:h-[56vh] xl:h-[60vh]">
              <div className="absolute left-0 top-[8%] z-10 w-[31%] rounded-lg border border-white/25 bg-white/15 p-2 shadow-[0_24px_60px_rgba(8,26,43,0.22)] backdrop-blur">
                <div className="overflow-hidden rounded-md bg-white/10">
                  <img
                    src={galleryImg}
                    alt="Galería de selección"
                    className="h-[190px] w-full object-cover object-center xl:h-[220px]"
                    loading="eager"
                  />
                </div>
                <div className="mt-3 h-3 w-14 rounded-full bg-primary-glow/80" />
                <div className="mt-2 h-3 w-20 rounded-full bg-white/75" />
              </div>

              <div className="absolute left-[28%] top-0 z-20 w-[48%] rounded-lg border border-white/30 bg-white/18 p-3 shadow-[0_34px_80px_rgba(8,26,43,0.24)] backdrop-blur xl:w-[50%]">
                <div className="overflow-hidden rounded-md bg-white/10">
                  <img
                    src={heroImg}
                    alt="Selección uruguaya — Balero World Cup"
                    className="h-[360px] w-full object-cover object-top lg:h-[420px] xl:h-[470px]"
                    loading="eager"
                  />
                </div>
                <div className="pointer-events-none absolute left-6 top-5 h-1.5 w-24 rounded-full bg-white/85" />
                <div className="absolute right-4 top-14 rounded-md bg-accent px-3 py-1.5 text-sm font-bold text-accent-foreground shadow-[0_12px_24px_rgba(8,26,43,0.2)]">
                  16:45
                </div>
                <div className="absolute -bottom-4 left-5 rounded-md border border-white/30 bg-white/88 px-4 py-2 text-sm font-semibold text-primary-deep shadow-[0_18px_40px_rgba(8,26,43,0.18)]">
                  Ranking en juego
                </div>
              </div>

              <div className="absolute bottom-0 left-[14%] z-30 w-[34%] rounded-lg border border-white/25 bg-white/16 p-2 shadow-[0_22px_50px_rgba(8,26,43,0.22)] backdrop-blur">
                <div className="overflow-hidden rounded-md bg-white/10">
                  <img
                    src={seleccionImg}
                    alt="Selección celebrando"
                    className="h-[205px] w-full object-cover object-center xl:h-[235px]"
                    loading="eager"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  <div className="h-3 flex-1 rounded-full bg-white/72" />
                </div>
              </div>

              <div className="absolute bottom-[12%] right-[3%] z-40 flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-[0_20px_40px_rgba(8,26,43,0.25)] xl:h-24 xl:w-24">
                <div className="h-8 w-8 rounded-full border-4 border-white/95 xl:h-10 xl:w-10" />
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-svh items-center justify-center px-[15px] py-8 lg:min-h-0">
          <div className="w-full max-w-[392px]">
            <div className="flex items-center gap-3 text-left sm:gap-4">
              <img
                src={worldCupLogo}
                alt="Logo Mundial 2026"
                className="h-16 w-auto flex-shrink-0 object-contain sm:h-20"
                loading="eager"
              />
              <div className="min-w-0">
                <h2 className="text-[1.8rem] font-black text-foreground sm:text-[2rem]">
                  Iniciar sesión
                </h2>
                <p className="mt-1 max-w-[28ch] text-sm leading-5 text-muted-foreground sm:text-[15px]">
                  Accedé para seguir cargando tus predicciones del Mundial.
                </p>
              </div>
            </div>

            <Card className="mt-6 rounded-3xl px-4 py-5 sm:px-5 sm:py-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email o usuario"
                  className="h-11 rounded-md bg-background/80 px-4 text-[15px]"
                  autoComplete="username"
                />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Contraseña"
                  className="h-11 rounded-md bg-background/80 px-4 text-[15px]"
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-md text-base font-bold"
                >
                  {loading ? "Ingresando..." : "Iniciar sesión"}
                </Button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    className="text-sm font-medium text-primary-deep transition-colors hover:text-foreground hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="my-1 h-px bg-border" />

                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-md text-base font-bold"
                >
                  <Link to="/register">Crear cuenta nueva</Link>
                </Button>
              </form>
            </Card>

            <p className="mt-4 text-left text-sm text-muted-foreground">
              <strong className="font-extrabold text-foreground">Creá una cuenta</strong> para
              predecir partidos del Mundial.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
