import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal } from "lucide-react";

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
    { order: 2, height: "h-32", color: "from-yellow-400 to-yellow-500", label: "1°" },
    { order: 1, height: "h-24", color: "from-slate-300 to-slate-400", label: "2°" },
    { order: 3, height: "h-20", color: "from-amber-600 to-amber-700", label: "3°" },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8 text-center animate-fade-in">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
          <Trophy className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ranking Global</h1>
        <p className="mt-2 text-muted-foreground">Los mejores pronosticadores del Mundial</p>
      </div>

      {top3.length >= 3 && (
        <div className="mb-10 grid grid-cols-3 items-end gap-3 sm:gap-6 animate-slide-up">
          {top3.map((u, i) => {
            const style = podiumStyles[i];
            return (
              <div key={u.id} style={{ order: style.order }} className="flex flex-col items-center">
                <Avatar className="mb-2 h-16 w-16 border-4 border-card shadow-[var(--shadow-soft)] sm:h-20 sm:w-20">
                  <AvatarFallback className="bg-[var(--gradient-primary)] text-lg font-bold text-primary-foreground">
                    {u.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="mb-2 text-center">
                  <div className="line-clamp-1 text-sm font-semibold">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.points} pts</div>
                </div>
                <div className={`flex w-full ${style.height} items-start justify-center rounded-t-xl bg-gradient-to-b ${style.color} pt-3 shadow-[var(--shadow-soft)]`}>
                  <span className="text-2xl font-black text-white drop-shadow">{style.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b bg-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tabla completa
        </div>
        <div className="divide-y">
          {ranking.map((u, idx) => {
            const isMe = u.id === user?.id;
            return (
              <div key={u.id}
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/40 ${
                  isMe ? "bg-primary/5" : ""
                }`}>
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  idx === 0 ? "bg-yellow-100 text-yellow-700" :
                  idx === 1 ? "bg-slate-100 text-slate-700" :
                  idx === 2 ? "bg-amber-100 text-amber-700" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {idx < 3 ? <Medal className="h-4 w-4" /> : idx + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[var(--gradient-primary)] text-sm font-semibold text-primary-foreground">
                    {u.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {u.name}
                    {isMe && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary-deep">Tú</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">Posición #{idx + 1}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-deep tabular-nums">{u.points}</div>
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
