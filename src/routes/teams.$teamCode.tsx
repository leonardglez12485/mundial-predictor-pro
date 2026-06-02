import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, UserPlus } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { Flag } from "@/components/Flag";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api, readApiError } from "@/lib/api";
import type { Player, PlayerPosition, TeamDetail } from "@/lib/types";

const PLAYER_POSITIONS: PlayerPosition[] = ["P", "DEF", "MED", "DEL"];
const PLAYER_POSITION_ORDER: Record<PlayerPosition, number> = { P: 0, DEF: 1, MED: 2, DEL: 3 };
type PlayerDraft = {
  name: string;
  position: PlayerPosition;
  shirtNumber: string;
  club: string;
};

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
  const [newPlayerShirtNumber, setNewPlayerShirtNumber] = useState("");
  const [newPlayerClub, setNewPlayerClub] = useState("");
  const [playerDrafts, setPlayerDrafts] = useState<Record<string, PlayerDraft>>({});

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
    const shirtNumber = parseOptionalShirtNumber(newPlayerShirtNumber);
    const trimmedClub = newPlayerClub.trim();

    if (!trimmedName) {
      return toast.error("Ingresá el nombre del jugador");
    }

    if (shirtNumber === "invalid") {
      return toast.error("Ingresá un dorsal válido");
    }

    setSubmitting(true);
    try {
      const player = await api.teams.createPlayer(teamCode, {
        name: trimmedName,
        position: newPlayerPosition,
        ...(shirtNumber !== null ? { shirtNumber } : {}),
        ...(trimmedClub ? { club: trimmedClub } : {}),
      });
      setTeam((currentTeam) => {
        if (!currentTeam) {
          return currentTeam;
        }

        const nextTeam = sortTeamPlayers({
          ...currentTeam,
          players: [...currentTeam.players, player],
        });
        setPlayerDrafts(createDraftMap(nextTeam.players));
        return nextTeam;
      });
      setNewPlayerName("");
      setNewPlayerPosition("MED");
      setNewPlayerShirtNumber("");
      setNewPlayerClub("");
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
      const updatedPlayer = await api.teams.updatePlayer(teamCode, player.id, {
        active: !player.active,
      });
      setTeam((currentTeam) => {
        if (!currentTeam) {
          return currentTeam;
        }

        const nextTeam = sortTeamPlayers({
          ...currentTeam,
          players: currentTeam.players.map((currentPlayer) =>
            currentPlayer.id === updatedPlayer.id ? updatedPlayer : currentPlayer,
          ),
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
    const shirtNumber = parseOptionalShirtNumber(draft.shirtNumber);
    const trimmedClub = draft.club.trim();
    const currentClub = player.club?.trim() ?? "";

    if (!trimmedName) {
      toast.error("El nombre del jugador es obligatorio");
      return;
    }

    if (shirtNumber === "invalid") {
      toast.error("Ingresá un dorsal válido");
      return;
    }

    if (
      trimmedName === player.name &&
      draft.position === player.position &&
      shirtNumber === (player.shirtNumber ?? null) &&
      trimmedClub === currentClub
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const updatedPlayer = await api.teams.updatePlayer(teamCode, player.id, {
        name: trimmedName,
        position: draft.position,
        shirtNumber,
        club: trimmedClub || null,
      });

      setTeam((currentTeam) => {
        if (!currentTeam) {
          return currentTeam;
        }

        const nextTeam = sortTeamPlayers({
          ...currentTeam,
          players: currentTeam.players.map((currentPlayer) =>
            currentPlayer.id === updatedPlayer.id ? updatedPlayer : currentPlayer,
          ),
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
        <Card className="p-6 text-center text-muted-foreground sm:p-10">Cargando plantel...</Card>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <Card className="p-6 text-center text-muted-foreground sm:p-10">
          No se encontró la selección.
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6 lg:py-7">
      <Link
        to="/teams"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a equipos
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <Flag team={team} size={44} className="flex-shrink-0 sm:h-12 sm:w-[72px]" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Grupo {team.group}
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{team.name}</h1>
          </div>
        </div>
      </div>

      {isAdmin && (
        <Card className="mb-4 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserPlus className="h-4 w-4 text-primary" /> Administrar plantel provisorio
          </div>
          <form onSubmit={handleCreatePlayer} className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_120px_110px_minmax(0,1fr)_140px] md:items-end">
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                Nombre
              </Label>
              <Input
                value={newPlayerName}
                onChange={(event) => setNewPlayerName(event.target.value)}
                placeholder="Agregar nuevo jugador"
                className="h-9"
                disabled={submitting}
              />
            </div>
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                Posición
              </Label>
              <Select
                value={newPlayerPosition}
                onValueChange={(value) => setNewPlayerPosition(value as PlayerPosition)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAYER_POSITIONS.map((position) => (
                    <SelectItem key={position} value={position}>
                      {positionLabel(position)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                Dorsal
              </Label>
              <Input
                value={newPlayerShirtNumber}
                onChange={(event) => setNewPlayerShirtNumber(event.target.value)}
                placeholder="-"
                inputMode="numeric"
                className="h-9"
                disabled={submitting}
              />
            </div>
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                Club
              </Label>
              <Input
                value={newPlayerClub}
                onChange={(event) => setNewPlayerClub(event.target.value)}
                placeholder="Club actual"
                className="h-9"
                disabled={submitting}
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 w-full justify-center bg-[var(--gradient-primary)]"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Agregar jugador
            </Button>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div>
          {team.players.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Todavía no hay jugadores cargados para esta selección.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[56px_minmax(0,1fr)_minmax(0,150px)] items-center gap-3 border-b bg-background/45 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground sm:px-4 sm:text-[10px] sm:tracking-[0.12em]">
                <span className="whitespace-nowrap text-center">Dorsal</span>
                <span className="whitespace-nowrap">Nombre</span>
                <span className="whitespace-nowrap">Club</span>
              </div>
              {PLAYER_POSITIONS.map((position) => {
                const playersInPosition = team.players.filter(
                  (player) => player.position === position,
                );

                if (playersInPosition.length === 0) {
                  return null;
                }

                return (
                  <section key={position} className="border-t first:border-t-0">
                    <div className="divide-y">
                      {playersInPosition.map((player) => {
                      const draft = playerDrafts[player.id] ?? createPlayerDraft(player);
                      const shirtNumber = formatShirtNumber(player.shirtNumber);
                      const club = formatPlayerClub(player.club);

                      return (
                        <div
                          key={player.id}
                          className="grid grid-cols-[56px_minmax(0,1fr)_minmax(0,150px)] items-center gap-3 px-3 py-1.5 sm:px-4"
                        >
                          {isAdmin ? (
                            <Input
                              value={draft.shirtNumber}
                              onChange={(event) => {
                                const value = event.target.value;
                                setPlayerDrafts((currentDrafts) => ({
                                  ...currentDrafts,
                                  [player.id]: { ...draft, shirtNumber: value },
                                }));
                              }}
                              disabled={submitting}
                              inputMode="numeric"
                              placeholder="-"
                              className="h-8 text-center font-mono text-xs"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-secondary/55 font-mono text-[11px] font-semibold text-foreground">
                              {shirtNumber}
                            </div>
                          )}
                          <div className="min-w-0">
                            {isAdmin ? (
                              <div className="grid gap-1 md:grid-cols-[minmax(0,1fr)_88px]">
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
                                  className="h-8 text-xs"
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
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PLAYER_POSITIONS.map((positionOption) => (
                                      <SelectItem key={positionOption} value={positionOption}>
                                        {positionLabel(positionOption)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <div className="flex min-w-0 flex-col items-start gap-1">
                                <span className="truncate text-[11px] font-semibold text-foreground sm:text-xs">
                                  {player.name}
                                </span>
                                <span className={`inline-flex h-4 items-center rounded px-1.5 text-[9px] font-bold ${positionBadgeClass(player.position)}`}>
                                  {positionLabel(player.position)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            {isAdmin ? (
                              <Input
                                value={draft.club}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setPlayerDrafts((currentDrafts) => ({
                                    ...currentDrafts,
                                    [player.id]: { ...draft, club: value },
                                  }));
                                }}
                                disabled={submitting}
                                placeholder="Club actual"
                                className="h-8 text-xs"
                              />
                            ) : (
                              <div className="truncate text-[11px] font-semibold text-foreground sm:text-xs">
                                {club}
                              </div>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="col-span-3 flex flex-wrap items-center justify-end gap-2 pt-1">
                              <Button
                                type="button"
                                variant="outline"
                                className="h-7 px-2 text-[11px]"
                                disabled={submitting}
                                onClick={() => {
                                  void handleSavePlayer(player);
                                }}
                              >
                                Guardar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-7 px-2 text-[11px]"
                                disabled={submitting}
                                onClick={() => {
                                  void handleTogglePlayer(player);
                                }}
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
              })}
            </>
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

      const positionDifference =
        PLAYER_POSITION_ORDER[leftPlayer.position] - PLAYER_POSITION_ORDER[rightPlayer.position];
      if (positionDifference !== 0) {
        return positionDifference;
      }

      const leftShirtNumber = leftPlayer.shirtNumber ?? Number.MAX_SAFE_INTEGER;
      const rightShirtNumber = rightPlayer.shirtNumber ?? Number.MAX_SAFE_INTEGER;
      if (leftShirtNumber !== rightShirtNumber) {
        return leftShirtNumber - rightShirtNumber;
      }

      return leftPlayer.name.localeCompare(rightPlayer.name, "es");
    }),
  };
}

function createDraftMap(players: Player[]) {
  return Object.fromEntries(players.map((player) => [player.id, createPlayerDraft(player)]));
}

function createPlayerDraft(player: Player): PlayerDraft {
  return {
    name: player.name,
    position: player.position,
    shirtNumber: player.shirtNumber?.toString() ?? "",
    club: player.club ?? "",
  };
}

function parseOptionalShirtNumber(value: string): number | null | "invalid" {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (!/^\d+$/.test(normalizedValue)) {
    return "invalid";
  }

  return Number(normalizedValue);
}

function formatShirtNumber(shirtNumber?: number) {
  return shirtNumber?.toString() ?? "-";
}

function formatPlayerClub(club?: string) {
  const normalized = club?.trim();
  return normalized && normalized.length > 0 ? normalized : "-";
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
