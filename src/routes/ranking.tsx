import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { BrandLogo } from "@/components/BrandLogo";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Medal } from "lucide-react";

export const Route = createFileRoute("/ranking")({
  head: () => ({ meta: [{ title: "Ranking — Balero World Cup" }] }),
  component: RankingPage,
});

function RankingPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--gradient-soft)]">
        <Header />
        <Ranking />
      </div>
    </AuthGuard>
  );
}

function Ranking() {
  const { users, user } = useAuth();
  const ranking = [...users].sort((a, b) => b.points - a.points);
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  const podiumStyles = [
    { order: 2, height: "h-32", color: "bg-yellow-400", label: "1°" },
    { order: 1, height: "h-24", color: "bg-slate-300", label: "2°" },
    { order: 3, height: "h-20", color: "bg-amber-600", label: "3°" },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mb-6 text-center animate-fade-in sm:mb-8">
        <BrandLogo size="md" showWordmark={false} className="mb-3 justify-center" />
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Ranking Global</h1>
        <p className="mt-2 text-muted-foreground">Los mejores pronosticadores del Mundial</p>
      </div>

      {top3.length >= 3 && (
        <div className="mb-8 grid grid-cols-3 items-end gap-2 sm:mb-10 sm:gap-6 animate-slide-up">
          {top3.map((u, i) => {
            const style = podiumStyles[i];
            return (
              <div key={u.id} style={{ order: style.order }} className="flex flex-col items-center">
                <Avatar className="mb-2 h-12 w-12 border-4 border-card shadow-[var(--shadow-soft)] sm:h-20 sm:w-20">
                  <AvatarFallback className="bg-[var(--gradient-primary)] text-base font-bold text-primary-foreground sm:text-lg">
                    {u.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="mb-2 text-center">
                  <div className="line-clamp-1 text-xs font-semibold sm:text-sm">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.points} pts</div>
                </div>
                <div
                  className={`flex w-full ${style.height} items-start justify-center rounded-t-xl ${style.color} pt-3 shadow-[var(--shadow-soft)]`}
                >
                  <span className="text-xl font-black text-foreground drop-shadow sm:text-2xl">
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b bg-secondary/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-5">
          Tabla completa
        </div>
        <div className="divide-y">
          {ranking.map((u, idx) => {
            const isMe = u.id === user?.id;
            return (
              <div
                key={u.id}
                className={`flex items-center gap-3 px-3 py-3.5 transition-colors hover:bg-secondary/40 sm:gap-4 sm:px-5 ${
                  isMe ? "bg-primary/5" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    idx === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : idx === 1
                        ? "bg-slate-100 text-slate-700"
                        : idx === 2
                          ? "bg-amber-100 text-amber-700"
                          : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {idx < 3 ? <Medal className="h-4 w-4" /> : idx + 1}
                </div>
                <Avatar className="h-9 w-9 flex-shrink-0 sm:h-10 sm:w-10">
                  <AvatarFallback className="bg-[var(--gradient-primary)] text-sm font-semibold text-primary-foreground">
                    {u.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {u.name}
                    {isMe && (
                      <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary-deep">
                        Tú
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Posición #{idx + 1}</div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-base font-bold text-primary-deep tabular-nums sm:text-lg">
                    {u.points}
                  </div>
                  <div className="text-xs text-muted-foreground">pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </main>
  );
}
