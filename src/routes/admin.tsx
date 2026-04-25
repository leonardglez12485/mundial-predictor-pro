import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { usePredictions } from "@/context/PredictionsContext";
import type { Match } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag } from "@/components/Flag";
import { Shield, Plus, Save, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createTeamMap, groupTeams } from "@/lib/teams";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Balero World Cup" }] }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <AuthGuard>
      <AdminGate />
    </AuthGuard>
  );
}

function AdminGate() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[var(--gradient-soft)]">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <Card className="p-10">
            <Shield className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-xl font-bold">Acceso restringido</h2>
            <p className="mt-2 text-sm text-muted-foreground">Solo el administrador puede ver esta página.</p>
            <Link to="/"><Button variant="link" className="mt-4">Volver al dashboard</Button></Link>
          </Card>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[var(--gradient-soft)]">
      <Header />
      <AdminPanel />
    </div>
  );
}

function AdminPanel() {
  const { teams, matches, loading, addMatch, updateMatchResult, setMatchStatus, deleteMatch } = usePredictions();
  const groupedTeams = groupTeams(teams);
  const teamMap = createTeamMap(teams);

  const [homeCode, setHomeCode] = useState("");
  const [awayCode, setAwayCode] = useState("");
  const [kickoff, setKickoff] = useState("");
  const [group, setGroup] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeCode || !awayCode || !kickoff) return toast.error("Completá todos los campos");
    if (homeCode === awayCode) return toast.error("Los equipos deben ser distintos");
    const homeTeam = teamMap[homeCode];
    const awayTeam = teamMap[awayCode];
    if (!homeTeam || !awayTeam) return toast.error("Seleccioná equipos válidos");
    const m: Match = {
      id: `m${Date.now()}`,
      home: homeTeam,
      away: awayTeam,
      kickoff: new Date(kickoff).toISOString(),
      status: "pending",
      group: group.trim() || undefined,
    };
    await addMatch(m);
    toast.success("Partido agregado");
    setHomeCode(""); setAwayCode(""); setKickoff(""); setGroup("");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Card className="p-10 text-center text-muted-foreground">Cargando panel y calendario...</Card>
      </main>
    );
  }

  const sorted = [...matches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al dashboard
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Panel de administración</h1>
          <p className="text-sm text-muted-foreground">Crear partidos y cargar resultados</p>
        </div>
      </div>

      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold">Agregar partido al schedule</h2>
        <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Local</Label>
            <Select value={homeCode} onValueChange={setHomeCode}>
              <SelectTrigger><SelectValue placeholder="Equipo local" /></SelectTrigger>
              <SelectContent>
                {groupedTeams.map(({ group, teams: teamsInGroup }) => (
                  <SelectGroup key={group}>
                    <SelectLabel>Grupo {group}</SelectLabel>
                    {teamsInGroup.map((team) => (
                      <SelectItem key={team.code} value={team.code}>
                        <span className="inline-flex items-center gap-2"><Flag team={team} size={16} /> {team.name}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Visitante</Label>
            <Select value={awayCode} onValueChange={setAwayCode}>
              <SelectTrigger><SelectValue placeholder="Equipo visitante" /></SelectTrigger>
              <SelectContent>
                {groupedTeams.map(({ group, teams: teamsInGroup }) => (
                  <SelectGroup key={group}>
                    <SelectLabel>Grupo {group}</SelectLabel>
                    {teamsInGroup.map((team) => (
                      <SelectItem key={team.code} value={team.code}>
                        <span className="inline-flex items-center gap-2"><Flag team={team} size={16} /> {team.name}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fecha y hora</Label>
            <Input type="datetime-local" value={kickoff} onChange={e => setKickoff(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Grupo (opcional)</Label>
            <Input value={group} onChange={e => setGroup(e.target.value)} placeholder="A, B, C..." maxLength={3} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="bg-[var(--gradient-primary)]"><Plus className="mr-1 h-4 w-4" /> Agregar partido</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b bg-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Schedule completo ({matches.length})
        </div>
        <div className="divide-y">
          {sorted.map(m => (
            <AdminMatchRow key={m.id} match={m}
              onResult={async (r) => {
                await updateMatchResult(m.id, r);
                toast.success("Resultado guardado");
              }}
              onStatus={async (s) => {
                await setMatchStatus(m.id, s);
                toast.success("Estado actualizado");
              }}
              onDelete={async () => {
                if (confirm("¿Eliminar partido?")) {
                  await deleteMatch(m.id);
                  toast.success("Eliminado");
                }
              }} />
          ))}
        </div>
      </Card>
    </main>
  );
}

function AdminMatchRow({ match, onResult, onStatus, onDelete }: {
  match: Match;
  onResult: (r: { homeGoals: number; awayGoals: number; scorers: string[] }) => Promise<void>;
  onStatus: (s: Match["status"]) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [hg, setHg] = useState(match.result?.homeGoals ?? 0);
  const [ag, setAg] = useState(match.result?.awayGoals ?? 0);
  const [scorers, setScorers] = useState((match.result?.scorers ?? []).join(", "));

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <Flag team={match.home} size={22} />
        <span className="font-medium">{match.home.name}</span>
        <span className="text-muted-foreground">vs</span>
        <Flag team={match.away} size={22} />
        <span className="font-medium">{match.away.name}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {new Date(match.kickoff).toLocaleString("es-UY", { dateStyle: "short", timeStyle: "short" })}
          {match.group && ` · Grupo ${match.group}`}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Select value={match.status} onValueChange={(v) => { void onStatus(v as Match["status"]); }}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="live">En juego</SelectItem>
            <SelectItem value="finished">Finalizado</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={() => setOpen(o => !o)}>
          {match.result ? "Editar resultado" : "Cargar resultado"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { void onDelete(); }} className="ml-auto text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {open && (
        <div className="mt-3 grid gap-3 rounded-lg border bg-secondary/30 p-3 sm:grid-cols-[auto_auto_1fr_auto]">
          <Input type="number" min={0} value={hg} onChange={e => setHg(Math.max(0, parseInt(e.target.value) || 0))}
            className="h-10 w-20 text-center font-bold" />
          <Input type="number" min={0} value={ag} onChange={e => setAg(Math.max(0, parseInt(e.target.value) || 0))}
            className="h-10 w-20 text-center font-bold" />
          <Input value={scorers} onChange={e => setScorers(e.target.value)}
            placeholder="Goleadores separados por coma" className="h-10" />
          <Button size="sm" onClick={() => {
            void onResult({
              homeGoals: hg, awayGoals: ag,
              scorers: scorers.split(",").map(s => s.trim()).filter(Boolean),
            });
            setOpen(false);
          }} className="bg-[var(--gradient-primary)]">
            <Save className="mr-1 h-4 w-4" /> Guardar
          </Button>
        </div>
      )}
    </div>
  );
}
