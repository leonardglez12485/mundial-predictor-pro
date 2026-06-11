import { j as jsxRuntimeExports, J as reactExports } from "./index.mjs";
import { a as useAuth, L as Link, u as usePredictions, t as toast, c as api, r as readApiError } from "./router-B1kSKAf9.mjs";
import { A as AuthGuard, L as Label, c as createLucideIcon } from "./label-DWX2Ekou.mjs";
import { H as Header, b as Shield } from "./Header-ujJFDq-9.mjs";
import { C as Card } from "./card-CaY9qWaX.mjs";
import { B as Button } from "./button-D3bn8Owt.mjs";
import { I as Input } from "./input-2vsokMh7.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectGroup, e as SelectLabel, f as SelectItem } from "./select-B2ykR_ZH.mjs";
import { F as Flag } from "./Flag-CgwP51Nl.mjs";
import { g as groupTeams, c as createTeamMap } from "./teams-BY8U4O8V.mjs";
import { h as hasResolvedParticipants } from "./match-display-Ci13xv4D.mjs";
import { O as OWN_GOAL_SCORER_NAME } from "./scorer-entry-BM5_IaSg.mjs";
import { A as ArrowLeft } from "./arrow-left-BvbXfRgx.mjs";
import { S as Save } from "./save-B4iJMk5i.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./BrandLogo-DknZI-FM.mjs";
const __iconNode$1 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$1);
const __iconNode = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode);
function AdminPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, {}) });
}
function AdminGate() {
  const {
    user
  } = useAuth();
  if (!user) return null;
  if (user.role !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--gradient-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-2xl px-4 py-10 text-center sm:py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 sm:p-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "mx-auto mb-3 h-12 w-12 text-muted-foreground/50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Acceso restringido" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Solo el administrador puede ver esta página." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", className: "mt-4", children: "Volver al dashboard" }) })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--gradient-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanel, {})
  ] });
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
    deleteMatch
  } = usePredictions();
  const groupedTeams = groupTeams(teams);
  const teamMap = createTeamMap(teams);
  const [homeCode, setHomeCode] = reactExports.useState("");
  const [awayCode, setAwayCode] = reactExports.useState("");
  const [kickoff, setKickoff] = reactExports.useState("");
  const [group, setGroup] = reactExports.useState("");
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!homeCode || !awayCode || !kickoff) return toast.error("Completá todos los campos");
    if (homeCode === awayCode) return toast.error("Los equipos deben ser distintos");
    const homeTeam = teamMap[homeCode];
    const awayTeam = teamMap[awayCode];
    if (!homeTeam || !awayTeam) return toast.error("Seleccioná equipos válidos");
    const m = {
      id: `m${Date.now()}`,
      home: homeTeam,
      away: awayTeam,
      kickoff: new Date(kickoff).toISOString(),
      status: "pending",
      group: group.trim() || void 0
    };
    await addMatch(m);
    toast.success("Partido agregado");
    setHomeCode("");
    setAwayCode("");
    setKickoff("");
    setGroup("");
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-muted-foreground sm:p-10", children: "Cargando panel y calendario..." }) });
  }
  const sorted = [...matches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Volver al dashboard"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)] sm:h-12 sm:w-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-6 w-6 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold sm:text-2xl", children: "Panel de administración" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Crear partidos y cargar resultados" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-8 p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-lg font-semibold", children: "Agregar partido al schedule" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAdd, className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Local" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: homeCode, onValueChange: setHomeCode, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Equipo local" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: groupedTeams.map(({
              group: group2,
              teams: teamsInGroup
            }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectLabel, { children: [
                "Grupo ",
                group2
              ] }),
              teamsInGroup.map((team) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: team.code, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team, size: 16 }),
                " ",
                team.name
              ] }) }, team.code))
            ] }, group2)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Visitante" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: awayCode, onValueChange: setAwayCode, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Equipo visitante" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: groupedTeams.map(({
              group: group2,
              teams: teamsInGroup
            }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectLabel, { children: [
                "Grupo ",
                group2
              ] }),
              teamsInGroup.map((team) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: team.code, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team, size: 16 }),
                " ",
                team.name
              ] }) }, team.code))
            ] }, group2)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha y hora" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: kickoff, onChange: (e) => setKickoff(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Grupo (opcional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: group, onChange: (e) => setGroup(e.target.value), placeholder: "A, B, C...", maxLength: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full bg-[var(--gradient-primary)] sm:w-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Agregar partido"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b bg-secondary/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-5", children: [
        "Schedule completo (",
        matches.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: sorted.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminMatchRow, { match: m, teams, onResult: async (r) => {
        await updateMatchResult(m.id, r);
        toast.success("Resultado guardado");
      }, onStatus: async (s) => {
        await setMatchStatus(m.id, s);
        toast.success("Estado actualizado");
      }, onParticipants: async (input) => {
        await resolveMatchParticipants(m.id, input);
        toast.success("Participantes definidos");
      }, onDelete: async () => {
        if (confirm("¿Eliminar partido?")) {
          await deleteMatch(m.id);
          toast.success("Eliminado");
        }
      } }, m.id)) })
    ] })
  ] });
}
function AdminMatchRow({
  match,
  teams,
  onResult,
  onStatus,
  onParticipants,
  onDelete
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [hg, setHg] = reactExports.useState(match.result?.homeGoals ?? 0);
  const [ag, setAg] = reactExports.useState(match.result?.awayGoals ?? 0);
  const [homeScorers, setHomeScorers] = reactExports.useState(() => resizeScorerList(match.result?.homeScorers ?? [], match.result?.homeGoals ?? 0));
  const [awayScorers, setAwayScorers] = reactExports.useState(() => resizeScorerList(match.result?.awayScorers ?? [], match.result?.awayGoals ?? 0));
  const [homePlayers, setHomePlayers] = reactExports.useState([]);
  const [awayPlayers, setAwayPlayers] = reactExports.useState([]);
  const [playersLoading, setPlayersLoading] = reactExports.useState(false);
  const [homeParticipantCode, setHomeParticipantCode] = reactExports.useState("");
  const [awayParticipantCode, setAwayParticipantCode] = reactExports.useState("");
  const participantsResolved = hasResolvedParticipants(match);
  reactExports.useEffect(() => {
    if (!open) {
      return;
    }
    let active = true;
    const loadPlayers = async () => {
      setPlayersLoading(true);
      try {
        const [homeTeam, awayTeam] = await Promise.all([api.teams.detail(match.home.code), api.teams.detail(match.away.code)]);
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
  }, [open, match.away.code, match.home.code]);
  const saveResult = () => {
    const normalizedHomeScorers = homeScorers.map((scorer) => scorer.trim()).filter(Boolean);
    const normalizedAwayScorers = awayScorers.map((scorer) => scorer.trim()).filter(Boolean);
    if (normalizedHomeScorers.length !== hg) {
      return toast.error(`El local debe tener ${hg} goleador${hg === 1 ? "" : "es"}`);
    }
    if (normalizedAwayScorers.length !== ag) {
      return toast.error(`El visitante debe tener ${ag} goleador${ag === 1 ? "" : "es"}`);
    }
    void onResult({
      homeGoals: hg,
      awayGoals: ag,
      homeScorers: normalizedHomeScorers,
      awayScorers: normalizedAwayScorers
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
    await onParticipants({
      homeTeamCode: homeParticipantCode,
      awayTeamCode: awayParticipantCode
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-4 sm:px-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team: match.home, size: 22, className: "flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 truncate font-medium", children: match.home.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 text-muted-foreground", children: "vs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team: match.away, size: 22, className: "flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 truncate font-medium", children: match.away.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-full text-xs text-muted-foreground sm:ml-auto sm:w-auto", children: [
        new Date(match.kickoff).toLocaleString("es-UY", {
          dateStyle: "short",
          timeStyle: "short"
        }),
        match.group && ` · Grupo ${match.group}`
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: match.status, onValueChange: (v) => {
        void onStatus(v);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-32 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pendiente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "starting", children: "Iniciando" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live", children: "En Desarrollo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "delayed", children: "Atrasado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "finished", children: "Finalizado" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setOpen((o) => !o), children: match.result ? "Editar resultado" : "Cargar resultado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
        void onDelete();
      }, className: "ml-auto text-destructive hover:bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }),
    !participantsResolved && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Participante local" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: homeParticipantCode, onValueChange: setHomeParticipantCode, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: match.home.name }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: teams.map((team) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: team.code, children: team.name }, team.code)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Participante visitante" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: awayParticipantCode, onValueChange: setAwayParticipantCode, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: match.away.name }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: teams.map((team) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: team.code, children: team.name }, team.code)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
        void saveParticipants();
      }, className: "w-full sm:w-auto", children: "Definir cruce" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-4 rounded-lg border bg-secondary/30 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-[auto_auto] sm:items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block text-xs uppercase tracking-wider text-muted-foreground", children: "Goles local" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: hg, onChange: (e) => {
            const nextGoals = Math.max(0, parseInt(e.target.value) || 0);
            setHg(nextGoals);
            setHomeScorers((prev) => resizeScorerList(prev, nextGoals));
          }, className: "h-10 w-full text-center font-bold sm:w-24" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block text-xs uppercase tracking-wider text-muted-foreground", children: "Goles visitante" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: ag, onChange: (e) => {
            const nextGoals = Math.max(0, parseInt(e.target.value) || 0);
            setAg(nextGoals);
            setAwayScorers((prev) => resizeScorerList(prev, nextGoals));
          }, className: "h-10 w-full text-center font-bold sm:w-24" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScorerTeamSection, { team: match.home, goalCount: hg, players: homePlayers, playersLoading, scorers: homeScorers, onChange: setHomeScorers }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScorerTeamSection, { team: match.away, goalCount: ag, players: awayPlayers, playersLoading, scorers: awayScorers, onChange: setAwayScorers })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: saveResult, className: "w-full bg-[var(--gradient-primary)] sm:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
        " Guardar"
      ] }) })
    ] })
  ] });
}
function ScorerTeamSection({
  team,
  goalCount,
  players,
  playersLoading,
  scorers,
  onChange
}) {
  const playerOptions = buildAdminPlayerOptions(players, scorers);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-background/80 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team, size: 18, className: "shadow-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: team.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          goalCount,
          " gol",
          goalCount === 1 ? "" : "es",
          " cargado",
          goalCount === 1 ? "" : "s"
        ] })
      ] })
    ] }),
    goalCount === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground", children: "Sin goles para este equipo." }) : playersLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground", children: "Cargando jugadores..." }) : playerOptions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-md bg-secondary/50 px-3 py-3 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "No hay jugadores activos cargados para esta selección." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/teams/$teamCode", params: {
        teamCode: team.code
      }, className: "font-medium text-primary hover:underline", children: [
        "Ir al plantel de ",
        team.name
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Array.from({
      length: goalCount
    }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: [
        "Goleador ",
        index + 1
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: scorers[index] || void 0, onValueChange: (value) => {
        const nextScorers = [...scorers];
        nextScorers[index] = value;
        onChange(nextScorers);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: `Seleccionar jugador o ${OWN_GOAL_SCORER_NAME.toLowerCase()} de ${team.name}` }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: playerOptions.map((playerOption) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: playerOption.value, children: playerOption.label }, playerOption.value)) })
      ] })
    ] }, `${team.code}-${index}`)) })
  ] });
}
function resizeScorerList(scorers, goalCount) {
  const nextScorers = scorers.slice(0, goalCount);
  while (nextScorers.length < goalCount) {
    nextScorers.push("");
  }
  return nextScorers;
}
function buildAdminPlayerOptions(players, selectedScorers) {
  const activeNames = /* @__PURE__ */ new Set([OWN_GOAL_SCORER_NAME, ...players.filter((player) => player.active).map((player) => player.name)]);
  const optionNames = Array.from(/* @__PURE__ */ new Set([OWN_GOAL_SCORER_NAME, ...players.filter((player) => player.active).map((player) => player.name), ...selectedScorers.filter(Boolean)])).sort((leftName, rightName) => leftName.localeCompare(rightName, "es"));
  return optionNames.map((name) => ({
    value: name,
    label: activeNames.has(name) ? name : `${name} (baja)`
  }));
}
export {
  AdminPage as component
};
