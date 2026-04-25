import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, UserPlus } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { Flag } from "@/components/Flag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api, readApiError } from "@/lib/api";
import type { Player, PlayerPosition, TeamDetail } from "@/lib/types";

const PLAYER_POSITIONS: PlayerPosition[] = ["P", "DEF", "MED", "DEL"];
const PLAYER_POSITION_ORDER: Record<PlayerPosition, number> = { P: 0, DEF: 1, MED: 2, DEL: 3 };

export const Route = createFileRoute("/teams/$teamCode")({
  head: () => ({ meta: [{ title: "Plantel de selección — Balero World Cup" }] }),
  component: TeamDetailPage,
});

function TeamDetailPage() {
  return (
    <AuthGuard>
      <TeamDetailView />
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
  const [newPlayerPosition, setNewPlayerPosition] = useState<PlayerPosition>("MED");
  const [playerDrafts, setPlayerDrafts] = useState<Record<string, { name: string; position: PlayerPosition }>>({});

  useEffect(() => {
    let active = true;

    const loadTeam = async () => {
      try {
        const nextTeam = await api.teams.detail(teamCode);
        if (active) {
          const sortedTeam = sortTeamPlayers(nextTeam);
          setTeam(sortedTeam);
          setPlayerDrafts(createDraftMap(sortedTeam.players));
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
      const player = await api.teams.createPlayer(teamCode, { name: trimmedName, position: newPlayerPosition });
      setTeam((currentTeam) => {
        if (!currentTeam) {
          return currentTeam;
        }

        const nextTeam = sortTeamPlayers({ ...currentTeam, players: [...currentTeam.players, player] });
        setPlayerDrafts(createDraftMap(nextTeam.players));
        return nextTeam;
      });
      setNewPlayerName("");
      setNewPlayerPosition("MED");
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
      setTeam((currentTeam) => {
        if (!currentTeam) {
          return currentTeam;
        }

        const nextTeam = sortTeamPlayers({
          ...currentTeam,
          players: currentTeam.players.map((currentPlayer) => currentPlayer.id === updatedPlayer.id ? updatedPlayer : currentPlayer),
        });
        setPlayerDrafts(createDraftMap(nextTeam.players));
        return nextTeam;
      });
      toast.success(updatedPlayer.active ? "Jugador dado de alta" : "Jugador dado de baja");
    } catch (error) {
      toast.error(readApiError(error, "No fue posible actualizar el estado del jugador"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePlayer = async (player: Player) => {
    const draft = playerDrafts[player.id];
    if (!draft) {
      return;
    }

    const trimmedName = draft.name.trim();
    if (!trimmedName) {
      toast.error("El nombre del jugador es obligatorio");
      return;
    }

    if (trimmedName === player.name && draft.position === player.position) {
      return;
    }

    setSubmitting(true);
    try {
      const updatedPlayer = await api.teams.updatePlayer(teamCode, player.id, {
        name: trimmedName,
        position: draft.position,
      });

      setTeam((currentTeam) => {
        if (!currentTeam) {
          return currentTeam;
        }

        const nextTeam = sortTeamPlayers({
          ...currentTeam,
          players: currentTeam.players.map((currentPlayer) => currentPlayer.id === updatedPlayer.id ? updatedPlayer : currentPlayer),
        });
        setPlayerDrafts(createDraftMap(nextTeam.players));
        return nextTeam;
      });
      toast.success("Jugador actualizado");
    } catch (error) {
      toast.error(readApiError(error, "No fue posible actualizar el jugador"));
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
            <div className="flex-1">
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Nombre</Label>
              <Input
                value={newPlayerName}
                onChange={(event) => setNewPlayerName(event.target.value)}
                placeholder="Agregar nuevo jugador"
                className="h-11"
                disabled={submitting}
              />
            </div>
            <div className="sm:w-40">
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Posición</Label>
              <Select value={newPlayerPosition} onValueChange={(value) => setNewPlayerPosition(value as PlayerPosition)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAYER_POSITIONS.map((position) => (
                    <SelectItem key={position} value={position}>{positionLabel(position)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting} className="h-11 w-40 justify-center bg-[var(--gradient-primary)]">
              <UserPlus className="mr-2 h-4 w-4" /> Agregar jugador
            </Button>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="border-b bg-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Plantel de la selección
        </div>
        <div>
          {team.players.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Todavía no hay jugadores cargados para esta selección.
            </div>
          ) : (
            PLAYER_POSITIONS.map((position) => {
              const playersInPosition = team.players.filter((player) => player.position === position);

              if (playersInPosition.length === 0) {
                return null;
              }

              return (
                <section key={position} className="border-t first:border-t-0">
                  <div className="divide-y">
                    {playersInPosition.map((player, index) => {
                      const draft = playerDrafts[player.id] ?? { name: player.name, position: player.position };
                      const playerNumber = team.players.findIndex((currentPlayer) => currentPlayer.id === player.id) + 1;

                      return (
                        <div key={player.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-muted-foreground">
                            {playerNumber}
                          </div>
                          <div className="min-w-0 flex-1">
                            {isAdmin ? (
                              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_110px]">
                                <Input
                                  value={draft.name}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    setPlayerDrafts((currentDrafts) => ({
                                      ...currentDrafts,
                                      [player.id]: { ...draft, name: value },
                                    }));
                                  }}
                                  disabled={submitting}
                                  className="h-10"
                                />
                                <Select
                                  value={draft.position}
                                  onValueChange={(value) => {
                                    setPlayerDrafts((currentDrafts) => ({
                                      ...currentDrafts,
                                      [player.id]: { ...draft, position: value as PlayerPosition },
                                    }));
                                  }}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PLAYER_POSITIONS.map((positionOption) => (
                                      <SelectItem key={positionOption} value={positionOption}>{positionLabel(positionOption)}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <div className="truncate font-medium text-foreground">{player.name}</div>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge className={positionBadgeClass(player.position)}>{positionLabel(player.position)}</Badge>
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="h-10 w-40 justify-center"
                                disabled={submitting}
                                onClick={() => { void handleSavePlayer(player); }}
                              >
                                Guardar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-10 w-40 justify-center"
                                disabled={submitting}
                                onClick={() => { void handleTogglePlayer(player); }}
                              >
                                {player.active ? "Dar de baja" : "Dar de alta"}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
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
      const positionDifference = PLAYER_POSITION_ORDER[leftPlayer.position] - PLAYER_POSITION_ORDER[rightPlayer.position];
      if (positionDifference !== 0) {
        return positionDifference;
      }

      return leftPlayer.name.localeCompare(rightPlayer.name, "es");
    }),
  };
}

function createDraftMap(players: Player[]) {
  return Object.fromEntries(
    players.map((player) => [player.id, { name: player.name, position: player.position }]),
  );
}

function positionBadgeClass(position: PlayerPosition) {
  switch (position) {
    case "DEL":
      return "border-transparent bg-red-600 text-white hover:bg-red-600";
    case "MED":
      return "border-transparent bg-blue-600 text-white hover:bg-blue-600";
    case "DEF":
      return "border-transparent bg-green-600 text-white hover:bg-green-600";
    case "P":
      return "border-transparent bg-amber-900 text-white hover:bg-amber-900";
    default:
      return "border border-border bg-secondary text-secondary-foreground";
  }
}

function positionLabel(position: PlayerPosition) {
  return position === "P" ? "POR" : position;
}