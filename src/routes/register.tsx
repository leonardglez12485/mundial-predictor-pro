import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Crear cuenta — Balero World Cup" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--gradient-soft)] px-4 py-8 sm:py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <BrandLogo size="md" subtitle="Predicciones del Mundial" className="justify-center" />
        </div>

        <Card className="border-border/50 p-5 shadow-[var(--shadow-elegant)] sm:p-8">
          <h2 className="mb-1 text-xl font-semibold">Registro deshabilitado</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Solo pueden acceder las cuentas autorizadas por la administración.
          </p>

          <div className="space-y-4">
            <div className="rounded-xl border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
              Si necesitás acceso, pedíselo al administrador.
            </div>
            <Link to="/login" className="block">
              <Button className="h-11 w-full bg-[var(--gradient-primary)] text-base font-semibold shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-glow)]">
                Volver al login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
