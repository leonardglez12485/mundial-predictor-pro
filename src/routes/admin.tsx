import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { usePredictions } from "@/context/PredictionsContext";
import { api, readApiError } from "@/lib/api";
import type { Match, Player } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flag } from "@/components/Flag";
import { Shield, Plus, Save, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createTeamMap, groupTeams } from "@/lib/teams";
import { hasPenaltyShootout, hasResolvedParticipants, isKnockoutMatch } from "@/lib/match-display";
import { OWN_GOAL_SCORER_NAME } from "@/lib/scorer-entry";

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
        <main className="mx-auto max-w-2xl px-4 py-10 text-center sm:py-16">
          <Card className="p-6 sm:p-10">
            <Shield className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-xl font-bold">Acceso restringido</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Solo el administrador puede ver esta página.
            </p>
            <Link to="/">
              <Button variant="link" className="mt-4">
                Volver al dashboard
              </Button>
            </Link>
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
  const {
    teams,
    matches,
    loading,
    addMatch,
    updateMatchResult,
    setMatchStatus,
    resolveMatchParticipants,
    deleteMatch,
  } = usePredictions();
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
    setHomeCode("");
    setAwayCode("");
    setKickoff("");
    setGroup("");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Card className="p-6 text-center text-muted-foreground sm:p-10">
          Cargando panel y calendario...
        </Card>
      </main>
    );
  }

  const sorted = [...matches].sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al dashboard
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)] sm:h-12 sm:w-12">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold sm:text-2xl">Panel de administración</h1>
          <p className="text-sm text-muted-foreground">Crear partidos y cargar resultados</p>
        </div>
      </div>

      <Card className="mb-8 p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Agregar partido al schedule</h2>
        <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Local</Label>
            <Select value={homeCode} onValueChange={setHomeCode}>
              <SelectTrigger>
                <SelectValue placeholder="Equipo local" />
              </SelectTrigger>
              <SelectContent>
                {groupedTeams.map(({ group, teams: teamsInGroup }) => (
                  <SelectGroup key={group}>
                    <SelectLabel>Grupo {group}</SelectLabel>
                    {teamsInGroup.map((team) => (
                      <SelectItem key={team.code} value={team.code}>
                        <span className="inline-flex items-center gap-2">
                          <Flag team={team} size={16} /> {team.name}
                        </span>
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
              <SelectTrigger>
                <SelectValue placeholder="Equipo visitante" />
              </SelectTrigger>
              <SelectContent>
                {groupedTeams.map(({ group, teams: teamsInGroup }) => (
                  <SelectGroup key={group}>
                    <SelectLabel>Grupo {group}</SelectLabel>
                    {teamsInGroup.map((team) => (
                      <SelectItem key={team.code} value={team.code}>
                        <span className="inline-flex items-center gap-2">
                          <Flag team={team} size={16} /> {team.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fecha y hora</Label>
            <Input
              type="datetime-local"
              value={kickoff}
              onChange={(e) => setKickoff(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Grupo (opcional)</Label>
            <Input
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="A, B, C..."
              maxLength={3}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full bg-[var(--gradient-primary)] sm:w-auto">
              <Plus className="mr-1 h-4 w-4" /> Agregar partido
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b bg-secondary/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-5">
          Schedule completo ({matches.length})
        </div>
        <div className="divide-y">
          {sorted.map((m) => (
            <AdminMatchRow
              key={m.id}
              match={m}
              teams={teams}
              onResult={async (r) => {
                await updateMatchResult(m.id, r);
                toast.success("Resultado guardado");
              }}
              onStatus={async (s) => {
                await setMatchStatus(m.id, s);
                toast.success("Estado actualizado");
              }}
              onParticipants={async (input) => {
                await resolveMatchParticipants(m.id, input);
                toast.success("Participantes definidos");
              }}
              onDelete={async () => {
                if (confirm("¿Eliminar partido?")) {
                  await deleteMatch(m.id);
                  toast.success("Eliminado");
                }
              }}
            />
          ))}
        </div>
      </Card>
    </main>
  );
}

function AdminMatchRow({
  match,
  teams,
  onResult,
  onStatus,
  onParticipants,
  onDelete,
}: {
  match: Match;
  teams: Match["home"][];
  onResult: (r: {
    homeGoals: number;
    awayGoals: number;
    homePenaltyGoals?: number;
    awayPenaltyGoals?: number;
    homeScorers: string[];
    awayScorers: string[];
  }) => Promise<void>;
  onStatus: (s: Match["status"]) => Promise<void>;
  onParticipants: (input: { homeTeamCode: string; awayTeamCode: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [hg, setHg] = useState(match.result?.homeGoals ?? 0);
  const [ag, setAg] = useState(match.result?.awayGoals ?? 0);
  const [hpg, setHpg] = useState(match.result?.homePenaltyGoals ?? 0);
  const [apg, setApg] = useState(match.result?.awayPenaltyGoals ?? 0);
  const [homeScorers, setHomeScorers] = useState(() =>
    resizeScorerList(match.result?.homeScorers ?? [], match.result?.homeGoals ?? 0),
  );
  const [awayScorers, setAwayScorers] = useState(() =>
    resizeScorerList(match.result?.awayScorers ?? [], match.result?.awayGoals ?? 0),
  );
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [homeParticipantCode, setHomeParticipantCode] = useState("");
  const [awayParticipantCode, setAwayParticipantCode] = useState("");
  const participantsResolved = hasResolvedParticipants(match);
  const knockout = isKnockoutMatch(match);
  const tiedScore = hg === ag;
  const needsPenalties = tiedScore;

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;

    const loadPlayers = async () => {
      if (!participantsResolved) {
        setHomePlayers([]);
        setAwayPlayers([]);
        setPlayersLoading(false);
        return;
      }

      setPlayersLoading(true);
      try {
        const [homeTeam, awayTeam] = await Promise.all([
          api.teams.detail(match.home.code),
          api.teams.detail(match.away.code),
        ]);

        if (!active) {
          return;
        }

        setHomePlayers(homeTeam.players);
        setAwayPlayers(awayTeam.players);
      } catch (error) {
        if (active) {
          toast.error(readApiError(error, "No fue posible cargar el catálogo de jugadores"));
        }
      } finally {
        if (active) {
          setPlayersLoading(false);
        }
      }
    };

    void loadPlayers();

    return () => {
      active = false;
    };
  }, [open, match.away.code, match.home.code, participantsResolved]);

  const saveResult = () => {
    const normalizedHomeScorers = homeScorers.map((scorer) => scorer.trim()).filter(Boolean);
    const normalizedAwayScorers = awayScorers.map((scorer) => scorer.trim()).filter(Boolean);

    if (normalizedHomeScorers.length !== hg) {
      return toast.error(`El local debe tener ${hg} goleador${hg === 1 ? "" : "es"}`);
    }

    if (normalizedAwayScorers.length !== ag) {
      return toast.error(`El visitante debe tener ${ag} goleador${ag === 1 ? "" : "es"}`);
    }

    if (needsPenalties && hpg === apg) {
      return toast.error("En penales tiene que haber un ganador");
    }

    void onResult({
      homeGoals: hg,
      awayGoals: ag,
      homePenaltyGoals: needsPenalties ? hpg : undefined,
      awayPenaltyGoals: needsPenalties ? apg : undefined,
      homeScorers: normalizedHomeScorers,
      awayScorers: normalizedAwayScorers,
    });
    setOpen(false);
  };

  const saveParticipants = async () => {
    if (!homeParticipantCode || !awayParticipantCode) {
      toast.error("Seleccioná ambos participantes");
      return;
    }

    if (homeParticipantCode === awayParticipantCode) {
      toast.error("Los equipos deben ser distintos");
      return;
    }

    await onParticipants({ homeTeamCode: homeParticipantCode, awayTeamCode: awayParticipantCode });
  };

  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <Flag team={match.home} size={22} className="flex-shrink-0" />
        <span className="min-w-0 truncate font-medium">{match.home.name}</span>
        <span className="flex-shrink-0 text-muted-foreground">vs</span>
        <Flag team={match.away} size={22} className="flex-shrink-0" />
        <span className="min-w-0 truncate font-medium">{match.away.name}</span>
        {match.result && hasPenaltyShootout(match) && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            Pen. {match.result.homePenaltyGoals}-{match.result.awayPenaltyGoals}
          </span>
        )}
        <span className="w-full text-xs text-muted-foreground sm:ml-auto sm:w-auto">
          {new Date(match.kickoff).toLocaleString("es-UY", {
            dateStyle: "short",
            timeStyle: "short",
          })}
          {match.group && ` · Grupo ${match.group}`}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Select
          value={match.status}
          onValueChange={(v) => {
            void onStatus(v as Match["status"]);
          }}
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="starting">Iniciando</SelectItem>
            <SelectItem value="live">En Desarrollo</SelectItem>
            <SelectItem value="delayed">Atrasado</SelectItem>
            <SelectItem value="finished">Finalizado</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          {match.result ? "Editar resultado" : "Cargar resultado"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            void onDelete();
          }}
          className="ml-auto text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {!participantsResolved && (
        <div className="mt-3 grid gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Participante local
            </Label>
            <Select value={homeParticipantCode} onValueChange={setHomeParticipantCode}>
              <SelectTrigger>
                <SelectValue placeholder={match.home.name} />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.code} value={team.code}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Participante visitante
            </Label>
            <Select value={awayParticipantCode} onValueChange={setAwayParticipantCode}>
              <SelectTrigger>
                <SelectValue placeholder={match.away.name} />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.code} value={team.code}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            onClick={() => {
              void saveParticipants();
            }}
            className="w-full sm:w-auto"
          >
            Definir cruce
          </Button>
        </div>
      )}

      {open && (
        <div className="mt-3 space-y-4 rounded-lg border bg-secondary/30 p-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[auto_auto] sm:items-end">
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                Goles local
              </Label>
              <Input
                type="number"
                min={0}
                value={hg}
                onChange={(e) => {
                  const nextGoals = Math.max(0, parseInt(e.target.value) || 0);
                  setHg(nextGoals);
                  setHomeScorers((prev) => resizeScorerList(prev, nextGoals));
                }}
                className="h-10 w-full text-center font-bold sm:w-24"
              />
            </div>
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                Goles visitante
              </Label>
              <Input
                type="number"
                min={0}
                value={ag}
                onChange={(e) => {
                  const nextGoals = Math.max(0, parseInt(e.target.value) || 0);
                  setAg(nextGoals);
                  setAwayScorers((prev) => resizeScorerList(prev, nextGoals));
                }}
                className="h-10 w-full text-center font-bold sm:w-24"
              />
            </div>
          </div>

          {(knockout || tiedScore) && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Definición por penales
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-[auto_auto] sm:items-end">
                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                    Penales local
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={hpg}
                    onChange={(e) => setHpg(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 w-full text-center font-bold sm:w-24"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                    Penales visitante
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={apg}
                    onChange={(e) => setApg(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 w-full text-center font-bold sm:w-24"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {needsPenalties
                  ? "La tanda define quién avanza, pero no suma goleadores."
                  : "Solo se usa si el partido termina empatado."}
              </p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <ScorerTeamSection
              team={match.home}
              goalCount={hg}
              players={homePlayers}
              playersLoading={playersLoading}
              scorers={homeScorers}
              onChange={setHomeScorers}
            />
            <ScorerTeamSection
              team={match.away}
              goalCount={ag}
              players={awayPlayers}
              playersLoading={playersLoading}
              scorers={awayScorers}
              onChange={setAwayScorers}
            />
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={saveResult}
              className="w-full bg-[var(--gradient-primary)] sm:w-auto"
            >
              <Save className="mr-1 h-4 w-4" /> Guardar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScorerTeamSection({
  team,
  goalCount,
  players,
  playersLoading,
  scorers,
  onChange,
}: {
  team: Match["home"];
  goalCount: number;
  players: Player[];
  playersLoading: boolean;
  scorers: string[];
  onChange: (scorers: string[]) => void;
}) {
  const playerOptions = buildAdminPlayerOptions(players, scorers);

  return (
    <div className="rounded-lg border bg-background/80 p-3">
      <div className="mb-3 flex items-center gap-2">
        <Flag team={team} size={18} className="shadow-none" />
        <div>
          <div className="text-sm font-semibold">{team.name}</div>
          <div className="text-xs text-muted-foreground">
            {goalCount} gol{goalCount === 1 ? "" : "es"} cargado{goalCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {goalCount === 0 ? (
        <div className="rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
          Sin goles para este equipo.
        </div>
      ) : playersLoading ? (
        <div className="rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
          Cargando jugadores...
        </div>
      ) : playerOptions.length === 0 ? (
        <div className="space-y-2 rounded-md bg-secondary/50 px-3 py-3 text-sm text-muted-foreground">
          <div>No hay jugadores activos cargados para esta selección.</div>
          <Link
            to="/teams/$teamCode"
            params={{ teamCode: team.code }}
            className="font-medium text-primary hover:underline"
          >
            Ir al plantel de {team.name}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {Array.from({ length: goalCount }, (_, index) => (
            <div key={`${team.code}-${index}`} className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Goleador {index + 1}
              </Label>
              <Select
                value={scorers[index] || undefined}
                onValueChange={(value) => {
                  const nextScorers = [...scorers];
                  nextScorers[index] = value;
                  onChange(nextScorers);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue
                    placeholder={`Seleccionar jugador o ${OWN_GOAL_SCORER_NAME.toLowerCase()} de ${team.name}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {playerOptions.map((playerOption) => (
                    <SelectItem key={playerOption.value} value={playerOption.value}>
                      {playerOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function resizeScorerList(scorers: string[], goalCount: number) {
  const nextScorers = scorers.slice(0, goalCount);
  while (nextScorers.length < goalCount) {
    nextScorers.push("");
  }
  return nextScorers;
}

function buildAdminPlayerOptions(players: Player[], selectedScorers: string[]) {
  const activeNames = new Set([
    OWN_GOAL_SCORER_NAME,
    ...players.filter((player) => player.active).map((player) => player.name),
  ]);
  const optionNames = Array.from(
    new Set([
      OWN_GOAL_SCORER_NAME,
      ...players.filter((player) => player.active).map((player) => player.name),
      ...selectedScorers.filter(Boolean),
    ]),
  ).sort((leftName, rightName) => leftName.localeCompare(rightName, "es"));

  return optionNames.map((name) => ({
    value: name,
    label: activeNames.has(name) ? name : `${name} (baja)`,
  }));
}
