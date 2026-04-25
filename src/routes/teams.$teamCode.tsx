import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, UserPlus, UserX } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { Flag } from "@/components/Flag";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { api, readApiError } from "@/lib/api";
import type { Player, TeamDetail } from "@/lib/types";

export const Route = createFileRoute("/teams/$teamCode")({
  head: () => ({ meta: [{ title: "Plantel de selección — Balero World Cup" }] }),
  component: TeamDetailPage,
});

function TeamDetailPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--gradient-soft)]">
        <Header />
        <TeamDetailView />
      </div>
    </AuthGuard>
  );
}

function TeamDetailView() {
  const { teamCode } = Route.useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");

  useEffect(() => {
    let active = true;

    const loadTeam = async () => {
      try {
        const nextTeam = await api.teams.detail(teamCode);
        if (active) {
          setTeam(nextTeam);
        }
      } catch (error) {
        if (active) {
          toast.error(readApiError(error, "No fue posible cargar el plantel"));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadTeam();

    return () => {
      active = false;
    };
  }, [teamCode]);

  const isAdmin = user?.role === "admin";

  const handleCreatePlayer = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) {
      return toast.error("Ingresá el nombre del jugador");
    }

    setSubmitting(true);
    try {
      const player = await api.teams.createPlayer(teamCode, trimmedName);
      setTeam((currentTeam) => currentTeam ? sortTeamPlayers({ ...currentTeam, players: [...currentTeam.players, player] }) : currentTeam);
      setNewPlayerName("");
      toast.success("Jugador agregado al catálogo provisorio");
    } catch (error) {
      toast.error(readApiError(error, "No fue posible agregar el jugador"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePlayer = async (player: Player) => {
    setSubmitting(true);
    try {
      const updatedPlayer = await api.teams.updatePlayer(teamCode, player.id, { active: !player.active });
      setTeam((currentTeam) => currentTeam
        ? sortTeamPlayers({
            ...currentTeam,
            players: currentTeam.players.map((currentPlayer) => currentPlayer.id === updatedPlayer.id ? updatedPlayer : currentPlayer),
          })
        : currentTeam);
      toast.success(updatedPlayer.active ? "Jugador dado de alta" : "Jugador dado de baja");
    } catch (error) {
      toast.error(readApiError(error, "No fue posible actualizar el estado del jugador"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <Card className="p-10 text-center text-muted-foreground">Cargando plantel...</Card>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <Card className="p-10 text-center text-muted-foreground">No se encontró la selección.</Card>
      </main>
    );
  }

  const activePlayers = team.players.filter((player) => player.active);
  const inactivePlayers = team.players.filter((player) => !player.active);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <Link to="/teams" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a equipos
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Flag team={team} size={64} />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grupo {team.group}</div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{team.name}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Catálogo provisorio de jugadores hasta que se definan las listas finales. El admin puede dar altas y bajas para mantenerlo actualizado.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="min-w-[180px] p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Activos</div>
            <div className="mt-1 text-2xl font-bold">{activePlayers.length}</div>
          </Card>
          <Card className="min-w-[180px] p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">En baja</div>
            <div className="mt-1 text-2xl font-bold">{inactivePlayers.length}</div>
          </Card>
        </div>
      </div>

      {isAdmin && (
        <Card className="mb-6 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserPlus className="h-4 w-4 text-primary" /> Administrar plantel provisorio
          </div>
          <form onSubmit={handleCreatePlayer} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={newPlayerName}
              onChange={(event) => setNewPlayerName(event.target.value)}
              placeholder="Agregar nuevo jugador"
              className="h-11"
              disabled={submitting}
            />
            <Button type="submit" disabled={submitting} className="h-11 bg-[var(--gradient-primary)]">
              <UserPlus className="mr-2 h-4 w-4" /> Agregar jugador
            </Button>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="border-b bg-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Plantel de la selección
        </div>
        <div className="divide-y">
          {team.players.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Todavía no hay jugadores cargados para esta selección.
            </div>
          ) : (
            team.players.map((player, index) => (
              <div key={player.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">{player.name}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={player.active ? "default" : "secondary"} className="gap-1.5">
                      {player.active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                      {player.active ? "Activo" : "Baja"}
                    </Badge>
                  </div>
                </div>
                {isAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => { void handleTogglePlayer(player); }}
                  >
                    {player.active ? "Dar de baja" : "Dar de alta"}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </main>
  );
}

function sortTeamPlayers(team: TeamDetail): TeamDetail {
  return {
    ...team,
    players: [...team.players].sort((leftPlayer, rightPlayer) => {
      if (leftPlayer.active !== rightPlayer.active) {
        return leftPlayer.active ? -1 : 1;
      }

      return leftPlayer.name.localeCompare(rightPlayer.name, "es");
    }),
  };
}