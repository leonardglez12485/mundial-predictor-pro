import { j as jsxRuntimeExports, J as reactExports } from "./index.mjs";
import { R as Route$1, a as useAuth, L as Link, c as api, t as toast, r as readApiError } from "./router-CcSLGoO1.mjs";
import { A as AuthGuard, c as createLucideIcon } from "./check-DcQEkvBF.mjs";
import { F as Flag } from "./Flag-DHT9RfW8.mjs";
import { I as Input, B as Button } from "./input-7nRw-2j6.mjs";
import { C as Card, L as Label } from "./card-CZY4D_k7.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, f as SelectItem } from "./select-XHUJQEHL.mjs";
import { A as ArrowLeft } from "./arrow-left-DzTolANy.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
const PLAYER_POSITIONS = ["P", "DEF", "MED", "DEL"];
const PLAYER_POSITION_ORDER = {
  P: 0,
  DEF: 1,
  MED: 2,
  DEL: 3
};
function TeamDetailPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TeamDetailView, {}) });
}
function TeamDetailView() {
  const {
    teamCode
  } = Route$1.useParams();
  const {
    user
  } = useAuth();
  const [team, setTeam] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [newPlayerName, setNewPlayerName] = reactExports.useState("");
  const [newPlayerPosition, setNewPlayerPosition] = reactExports.useState("MED");
  const [newPlayerShirtNumber, setNewPlayerShirtNumber] = reactExports.useState("");
  const [newPlayerClub, setNewPlayerClub] = reactExports.useState("");
  const [playerDrafts, setPlayerDrafts] = reactExports.useState({});
  reactExports.useEffect(() => {
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
  const handleCreatePlayer = async (event) => {
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
        ...shirtNumber !== null ? {
          shirtNumber
        } : {},
        ...trimmedClub ? {
          club: trimmedClub
        } : {}
      });
      setTeam((currentTeam) => {
        if (!currentTeam) {
          return currentTeam;
        }
        const nextTeam = sortTeamPlayers({
          ...currentTeam,
          players: [...currentTeam.players, player]
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
  const handleTogglePlayer = async (player) => {
    setSubmitting(true);
    try {
      const updatedPlayer = await api.teams.updatePlayer(teamCode, player.id, {
        active: !player.active
      });
      setTeam((currentTeam) => {
        if (!currentTeam) {
          return currentTeam;
        }
        const nextTeam = sortTeamPlayers({
          ...currentTeam,
          players: currentTeam.players.map((currentPlayer) => currentPlayer.id === updatedPlayer.id ? updatedPlayer : currentPlayer)
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
  const handleSavePlayer = async (player) => {
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
    if (trimmedName === player.name && draft.position === player.position && shirtNumber === (player.shirtNumber ?? null) && trimmedClub === currentClub) {
      return;
    }
    setSubmitting(true);
    try {
      const updatedPlayer = await api.teams.updatePlayer(teamCode, player.id, {
        name: trimmedName,
        position: draft.position,
        shirtNumber,
        club: trimmedClub || null
      });
      setTeam((currentTeam) => {
        if (!currentTeam) {
          return currentTeam;
        }
        const nextTeam = sortTeamPlayers({
          ...currentTeam,
          players: currentTeam.players.map((currentPlayer) => currentPlayer.id === updatedPlayer.id ? updatedPlayer : currentPlayer)
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-muted-foreground sm:p-10", children: "Cargando plantel..." }) });
  }
  if (!team) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-muted-foreground sm:p-10", children: "No se encontró la selección." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6 lg:py-7", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/teams", className: "mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Volver a equipos"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 flex flex-wrap items-start justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-start gap-3 sm:gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team, size: 44, className: "flex-shrink-0 sm:h-12 sm:w-[72px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
          "Grupo ",
          team.group
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black tracking-tight sm:text-3xl", children: team.name })
      ] })
    ] }) }),
    isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-4 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm font-semibold text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 text-primary" }),
        " Administrar plantel provisorio"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreatePlayer, className: "grid gap-3 md:grid-cols-[minmax(0,1.4fr)_120px_110px_minmax(0,1fr)_140px] md:items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block text-xs uppercase tracking-wider text-muted-foreground", children: "Nombre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newPlayerName, onChange: (event) => setNewPlayerName(event.target.value), placeholder: "Agregar nuevo jugador", className: "h-9", disabled: submitting })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block text-xs uppercase tracking-wider text-muted-foreground", children: "Posición" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: newPlayerPosition, onValueChange: (value) => setNewPlayerPosition(value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PLAYER_POSITIONS.map((position) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: position, children: positionLabel(position) }, position)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block text-xs uppercase tracking-wider text-muted-foreground", children: "Dorsal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newPlayerShirtNumber, onChange: (event) => setNewPlayerShirtNumber(event.target.value), placeholder: "-", inputMode: "numeric", className: "h-9", disabled: submitting })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block text-xs uppercase tracking-wider text-muted-foreground", children: "Club" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newPlayerClub, onChange: (event) => setNewPlayerClub(event.target.value), placeholder: "Club actual", className: "h-9", disabled: submitting })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: submitting, className: "h-9 w-full justify-center bg-[var(--gradient-primary)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-2 h-4 w-4" }),
          " Agregar jugador"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: team.players.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-10 text-center text-sm text-muted-foreground", children: "Todavía no hay jugadores cargados para esta selección." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[56px_minmax(0,1fr)_minmax(0,150px)] items-center gap-3 border-b bg-background/45 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground sm:px-4 sm:text-[10px] sm:tracking-[0.12em]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-center", children: "Dorsal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap", children: "Nombre" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap", children: "Club" })
      ] }),
      PLAYER_POSITIONS.map((position) => {
        const playersInPosition = team.players.filter((player) => player.position === position);
        if (playersInPosition.length === 0) {
          return null;
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-t first:border-t-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: playersInPosition.map((player) => {
          const draft = playerDrafts[player.id] ?? createPlayerDraft(player);
          const shirtNumber = formatShirtNumber(player.shirtNumber);
          const club = formatPlayerClub(player.club);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[56px_minmax(0,1fr)_minmax(0,150px)] items-center gap-3 px-3 py-1.5 sm:px-4", children: [
            isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.shirtNumber, onChange: (event) => {
              const value = event.target.value;
              setPlayerDrafts((currentDrafts) => ({
                ...currentDrafts,
                [player.id]: {
                  ...draft,
                  shirtNumber: value
                }
              }));
            }, disabled: submitting, inputMode: "numeric", placeholder: "-", className: "h-8 text-center font-mono text-xs" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-secondary/55 font-mono text-[11px] font-semibold text-foreground", children: shirtNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1 md:grid-cols-[minmax(0,1fr)_88px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.name, onChange: (event) => {
                const value = event.target.value;
                setPlayerDrafts((currentDrafts) => ({
                  ...currentDrafts,
                  [player.id]: {
                    ...draft,
                    name: value
                  }
                }));
              }, disabled: submitting, className: "h-8 text-xs" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.position, onValueChange: (value) => {
                setPlayerDrafts((currentDrafts) => ({
                  ...currentDrafts,
                  [player.id]: {
                    ...draft,
                    position: value
                  }
                }));
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PLAYER_POSITIONS.map((positionOption) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: positionOption, children: positionLabel(positionOption) }, positionOption)) })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col items-start gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[11px] font-semibold text-foreground sm:text-xs", children: player.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex h-4 items-center rounded px-1.5 text-[9px] font-bold ${positionBadgeClass(player.position)}`, children: positionLabel(player.position) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.club, onChange: (event) => {
              const value = event.target.value;
              setPlayerDrafts((currentDrafts) => ({
                ...currentDrafts,
                [player.id]: {
                  ...draft,
                  club: value
                }
              }));
            }, disabled: submitting, placeholder: "Club actual", className: "h-8 text-xs" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] font-semibold text-foreground sm:text-xs", children: club }) }),
            isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 flex flex-wrap items-center justify-end gap-2 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "h-7 px-2 text-[11px]", disabled: submitting, onClick: () => {
                void handleSavePlayer(player);
              }, children: "Guardar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "h-7 px-2 text-[11px]", disabled: submitting, onClick: () => {
                void handleTogglePlayer(player);
              }, children: player.active ? "Dar de baja" : "Dar de alta" })
            ] })
          ] }, player.id);
        }) }) }, position);
      })
    ] }) }) })
  ] });
}
function sortTeamPlayers(team) {
  return {
    ...team,
    players: [...team.players].sort((leftPlayer, rightPlayer) => {
      if (leftPlayer.active !== rightPlayer.active) {
        return leftPlayer.active ? -1 : 1;
      }
      const positionDifference = PLAYER_POSITION_ORDER[leftPlayer.position] - PLAYER_POSITION_ORDER[rightPlayer.position];
      if (positionDifference !== 0) {
        return positionDifference;
      }
      const leftShirtNumber = leftPlayer.shirtNumber ?? Number.MAX_SAFE_INTEGER;
      const rightShirtNumber = rightPlayer.shirtNumber ?? Number.MAX_SAFE_INTEGER;
      if (leftShirtNumber !== rightShirtNumber) {
        return leftShirtNumber - rightShirtNumber;
      }
      return leftPlayer.name.localeCompare(rightPlayer.name, "es");
    })
  };
}
function createDraftMap(players) {
  return Object.fromEntries(players.map((player) => [player.id, createPlayerDraft(player)]));
}
function createPlayerDraft(player) {
  return {
    name: player.name,
    position: player.position,
    shirtNumber: player.shirtNumber?.toString() ?? "",
    club: player.club ?? ""
  };
}
function parseOptionalShirtNumber(value) {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
  }
  if (!/^\d+$/.test(normalizedValue)) {
    return "invalid";
  }
  return Number(normalizedValue);
}
function formatShirtNumber(shirtNumber) {
  return shirtNumber?.toString() ?? "-";
}
function formatPlayerClub(club) {
  const normalized = club?.trim();
  return normalized && normalized.length > 0 ? normalized : "-";
}
function positionBadgeClass(position) {
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
function positionLabel(position) {
  return position === "P" ? "POR" : position;
}
export {
  TeamDetailPage as component
};
