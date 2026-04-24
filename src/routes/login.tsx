import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
    <div className="h-svh overflow-hidden bg-[#cfefff] text-[#081a2b]">
      <main className="grid h-full md:grid-cols-[0.98fr_0.82fr]">
        <section className="relative hidden overflow-hidden border-r border-[#8fc9eb] px-8 py-8 md:flex md:min-h-0 lg:px-10 xl:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(124,196,232,0.32),_transparent_42%),linear-gradient(180deg,_rgba(233,248,255,0.96),_rgba(201,238,255,0.94))]" />
          <div className="relative mx-auto flex h-full w-full max-w-3xl flex-col justify-center gap-8 lg:gap-10">
            <div className="max-w-lg text-left">
              <h1 className="text-4xl font-black leading-[0.92] tracking-[-0.06em] text-[#081a2b] lg:text-5xl xl:text-6xl">
                Balero World Cup
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-[#12304a]/86 lg:text-lg">
                Predecí los partidos del Mundial, sumá puntos y subí en el ranking. Cree en grande.
              </p>
            </div>

            <div className="relative h-[44vh] min-h-[340px] w-full max-w-[620px] lg:h-[48vh] xl:h-[52vh]">
              <div className="absolute left-0 top-[8%] z-10 w-[31%] rounded-[2rem] border border-white/80 bg-white/82 p-3 shadow-[0_24px_60px_rgba(8,26,43,0.14)] backdrop-blur">
                <div className="overflow-hidden rounded-[1.5rem] bg-[#e8f7ff]">
                  <img
                    src={galleryImg}
                    alt="Galería de selección"
                    className="h-[170px] w-full object-cover object-center xl:h-[190px]"
                    loading="eager"
                  />
                </div>
                <div className="mt-3 h-3 w-14 rounded-full bg-[#a9d6ef]" />
                <div className="mt-2 h-3 w-20 rounded-full bg-[#d7edf9]" />
              </div>

              <div className="absolute left-[28%] top-0 z-20 w-[48%] rounded-[2.4rem] border border-white/85 bg-white/76 p-4 shadow-[0_34px_80px_rgba(8,26,43,0.16)] backdrop-blur xl:w-[50%]">
                <div className="overflow-hidden rounded-[2rem] bg-[#d7effc]">
                  <img
                    src={heroImg}
                    alt="Selección uruguaya — Balero World Cup"
                    className="h-[320px] w-full object-cover object-top lg:h-[350px] xl:h-[390px]"
                    loading="eager"
                  />
                </div>
                <div className="pointer-events-none absolute left-6 top-5 h-1.5 w-24 rounded-full bg-white/85" />
                <div className="absolute right-4 top-14 rounded-2xl bg-[#4f8fb7] px-4 py-2 text-sm font-bold text-white shadow-[0_12px_24px_rgba(8,26,43,0.16)]">
                  16:45
                </div>
                <div className="absolute -bottom-5 left-7 rounded-[1.5rem] border border-white/80 bg-white/92 px-5 py-3 text-sm font-semibold text-[#12304a] shadow-[0_18px_40px_rgba(8,26,43,0.14)]">
                  Ranking en juego
                </div>
              </div>

              <div className="absolute bottom-0 left-[14%] z-30 w-[34%] rounded-[2rem] border border-white/80 bg-white/84 p-3 shadow-[0_22px_50px_rgba(8,26,43,0.14)] backdrop-blur">
                <div className="overflow-hidden rounded-[1.5rem] bg-[#e3f5ff]">
                  <img
                    src={seleccionImg}
                    alt="Selección celebrando"
                    className="h-[180px] w-full object-cover object-center xl:h-[210px]"
                    loading="eager"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#38aaf0]" />
                  <div className="h-3 flex-1 rounded-full bg-[#d7edf9]" />
                </div>
              </div>

              <div className="absolute bottom-[12%] right-[3%] z-40 flex h-20 w-20 items-center justify-center rounded-full bg-[#38aaf0] shadow-[0_20px_40px_rgba(8,26,43,0.2)] xl:h-24 xl:w-24">
                <div className="h-8 w-8 rounded-full border-4 border-white/95 xl:h-10 xl:w-10" />
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-0 items-center justify-center px-5 py-6 sm:px-8 md:px-8 lg:px-10">
          <div className="w-full max-w-[380px]">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black tracking-[-0.04em] text-[#081a2b] sm:text-[2rem]">
                Iniciar sesión
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#12304a]/78 sm:text-base">
                Accedé para seguir cargando tus predicciones del Mundial.
              </p>
            </div>

            <Card className="mt-6 border-[#7abde4]/70 bg-white/92 p-5 shadow-[0_24px_60px_rgba(8,26,43,0.12)] backdrop-blur sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Email o usuario"
                  className="h-13 rounded-2xl border-[#8ec8e8] bg-[#f4fbff] px-4 text-[15px] text-[#081a2b] placeholder:text-[#51708a] focus-visible:ring-[#2d86bb]"
                  autoComplete="username"
                />
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Contraseña"
                  className="h-13 rounded-2xl border-[#8ec8e8] bg-[#f4fbff] px-4 text-[15px] text-[#081a2b] placeholder:text-[#51708a] focus-visible:ring-[#2d86bb]"
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-2xl bg-[#2386c8] text-base font-bold text-white shadow-[0_20px_40px_rgba(35,134,200,0.28)] transition-all hover:bg-[#1d76b0]"
                >
                  {loading ? "Ingresando..." : "Iniciar sesión"}
                </Button>

                <div className="pt-1 text-center">
                  <button type="button" className="text-sm font-medium text-[#12304a] transition-colors hover:text-[#0b2640] hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="my-1 h-px bg-[#b8ddf1]" />

                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-[#2386c8] bg-[#eaf7ff] text-base font-bold text-[#0d2b47] shadow-none hover:bg-[#d9f0ff] hover:text-[#0b2640]"
                >
                  <Link to="/register">Crear cuenta nueva</Link>
                </Button>
              </form>
            </Card>

            <p className="mt-4 text-center text-sm text-[#12304a]/78 md:text-left">
              <strong className="font-extrabold text-[#081a2b]">Crea una cuenta</strong> para predecir partidos del Mundial.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
