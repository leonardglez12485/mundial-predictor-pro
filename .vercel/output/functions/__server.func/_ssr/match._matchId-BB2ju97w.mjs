import { j as jsxRuntimeExports, J as reactExports } from "./index.mjs";
import { d as Route2, a as useAuth, u as usePredictions, L as Link, b as useNavigate, c as api, t as toast, r as readApiError } from "./router-B1kSKAf9.mjs";
import { A as AuthGuard, L as Label } from "./label-DWX2Ekou.mjs";
import { H as Header } from "./Header-ujJFDq-9.mjs";
import { s as splitScorerSelections, O as OWN_GOAL_SCORER_NAME, a as serializeScorerEntry, p as parseScorerEntry } from "./scorer-entry-BM5_IaSg.mjs";
import { b as isPredictionLocked, d as calculatePoints, f as formatKickoff, c as formatCountdown, L as Lock } from "./scoring-Cu5wh4ZA.mjs";
import { C as Card } from "./card-CaY9qWaX.mjs";
import { B as Button } from "./button-D3bn8Owt.mjs";
import { I as Input } from "./input-2vsokMh7.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, f as SelectItem } from "./select-B2ykR_ZH.mjs";
import { F as Flag } from "./Flag-CgwP51Nl.mjs";
import { h as hasResolvedParticipants, f as formatMatchStage } from "./match-display-Ci13xv4D.mjs";
import { A as ArrowLeft } from "./arrow-left-BvbXfRgx.mjs";
import { T as Trophy } from "./trophy-Dme_FnWV.mjs";
import { S as Save } from "./save-B4iJMk5i.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./BrandLogo-DknZI-FM.mjs";
function MatchPredictionPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--gradient-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PredictionForm, {})
  ] }) });
}
function PredictionForm() {
  const {
    matchId
  } = Route2.useParams();
  const {
    user
  } = useAuth();
  const {
    matches,
    getPrediction,
    savePrediction,
    loading
  } = usePredictions();
  const match = matches.find((m) => m.id === matchId);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-3xl px-4 py-8 sm:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-muted-foreground sm:p-10", children: "Cargando partido y predicción..." }) });
  }
  if (!match || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-3xl px-4 py-8 sm:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 text-center sm:p-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Partido no encontrado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", className: "mt-3", children: "Volver" }) })
    ] }) });
  }
  if (user.role === "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-3xl px-4 py-8 sm:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 text-center sm:p-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: "Acceso solo para gestión administrativa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "El administrador no puede crear predicciones. Cargá resultados y goleadores desde el panel admin." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-4", children: "Ir al panel admin" }) })
    ] }) });
  }
  const existing = getPrediction(match.id, user.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadedPredictionForm, { match, user, existing, savePrediction }, `${match.id}:${existing?.updatedAt ?? "new"}`);
}
function LoadedPredictionForm({
  match,
  user,
  existing,
  savePrediction
}) {
  const navigate = useNavigate();
  const [homeGoals, setHomeGoals] = reactExports.useState(existing?.homeGoals ?? 1);
  const [awayGoals, setAwayGoals] = reactExports.useState(existing?.awayGoals ?? 1);
  const initialScorers = existing ? splitScorerSelections(existing.scorers, match.home.code, match.away.code, existing.homeGoals, existing.awayGoals) : {
    homeScorers: [],
    awayScorers: []
  };
  const [homeScorers, setHomeScorers] = reactExports.useState(() => resizeScorerList(initialScorers.homeScorers, existing?.homeGoals ?? 1));
  const [awayScorers, setAwayScorers] = reactExports.useState(() => resizeScorerList(initialScorers.awayScorers, existing?.awayGoals ?? 1));
  const [homePlayers, setHomePlayers] = reactExports.useState([]);
  const [awayPlayers, setAwayPlayers] = reactExports.useState([]);
  const [playersLoading, setPlayersLoading] = reactExports.useState(true);
  const locked = isPredictionLocked(match);
  const participantsResolved = hasResolvedParticipants(match);
  const winner = homeGoals > awayGoals ? "home" : homeGoals < awayGoals ? "away" : "draw";
  const finished = match.status === "finished";
  const earnedPoints = finished && existing ? calculatePoints(existing, match) : 0;
  reactExports.useEffect(() => {
    let active = true;
    const loadPlayers = async () => {
      try {
        const [homeTeam, awayTeam] = await Promise.all([api.teams.detail(match.home.code), api.teams.detail(match.away.code)]);
        if (!active) {
          return;
        }
        setHomePlayers(homeTeam.players);
        setAwayPlayers(awayTeam.players);
      } catch (error) {
        if (active) {
          toast.error(readApiError(error, "No fue posible cargar los jugadores del partido"));
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
  }, [match]);
  const handleSave = async (e) => {
    e.preventDefault();
    if (locked) return toast.error("Las predicciones están cerradas");
    if (homeGoals < 0 || awayGoals < 0 || homeGoals > 20 || awayGoals > 20) {
      return toast.error("Marcador inválido");
    }
    const normalizedHomeScorers = homeScorers.filter(Boolean);
    const normalizedAwayScorers = awayScorers.filter(Boolean);
    if (normalizedHomeScorers.length !== homeGoals) {
      return toast.error(`Debés elegir ${homeGoals} goleador${homeGoals === 1 ? "" : "es"} para ${match.home.name}`);
    }
    if (normalizedAwayScorers.length !== awayGoals) {
      return toast.error(`Debés elegir ${awayGoals} goleador${awayGoals === 1 ? "" : "es"} para ${match.away.name}`);
    }
    await savePrediction({
      matchId: match.id,
      userId: user.id,
      winner,
      homeGoals,
      awayGoals,
      scorers: [...normalizedHomeScorers, ...normalizedAwayScorers],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    toast.success("¡Predicción guardada!");
    navigate({
      to: "/"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Volver al dashboard"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden p-4 shadow-[var(--shadow-elegant)] animate-slide-up sm:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
        formatMatchStage(match),
        " · ",
        formatKickoff(match.kickoff)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team: match.home, size: 48, className: "mb-3 sm:h-16 sm:w-16" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-full truncate text-sm font-bold sm:text-lg", children: match.home.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-muted-foreground sm:text-3xl", children: "VS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team: match.away, size: 48, className: "mb-3 sm:h-16 sm:w-16" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-full truncate text-sm font-bold sm:text-lg", children: match.away.name })
        ] })
      ] }),
      match.status === "pending" && !locked && participantsResolved && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-center text-sm", children: [
        "⏱️ ",
        formatCountdown(match.kickoff),
        " — Aún puedes predecir"
      ] }),
      !participantsResolved && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 rounded-xl border bg-secondary/40 px-4 py-3 text-center text-sm text-muted-foreground", children: "Este cruce todavía depende de clasificados previos. El calendario ya está cargado, pero la predicción quedará habilitada cuando se definan los equipos." }),
      locked && match.status !== "finished" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-destructive", children: "Predicción cerrada" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-destructive/80", children: "Solo podés predecir en estado pendiente. Una hora antes del inicio, y en cualquier otro estado, la predicción queda cerrada." })
        ] })
      ] }),
      finished && match.result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Resultado final" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-1 text-3xl font-black text-primary-deep", children: [
          match.result.homeGoals,
          " - ",
          match.result.awayGoals
        ] }),
        existing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5" }),
          " Ganaste ",
          earnedPoints,
          " puntos"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSave, className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { disabled: locked || !participantsResolved, className: "space-y-6 disabled:opacity-60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-3 block text-base font-semibold", children: "Marcador predicho" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-muted-foreground", children: match.home.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 20, value: homeGoals, onChange: (e) => {
                  const nextGoals = Math.max(0, parseInt(e.target.value) || 0);
                  setHomeGoals(nextGoals);
                  setHomeScorers((prev) => resizeScorerList(prev, nextGoals));
                }, className: "h-12 text-center text-xl font-bold sm:h-14 sm:text-2xl" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-muted-foreground sm:text-2xl", children: "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-muted-foreground", children: match.away.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 20, value: awayGoals, onChange: (e) => {
                  const nextGoals = Math.max(0, parseInt(e.target.value) || 0);
                  setAwayGoals(nextGoals);
                  setAwayScorers((prev) => resizeScorerList(prev, nextGoals));
                }, className: "h-12 text-center text-xl font-bold sm:h-14 sm:text-2xl" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-center text-sm text-muted-foreground", children: [
              "Ganador:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: winner === "draw" ? "Empate" : winner === "home" ? match.home.name : match.away.name })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-3 block text-base font-semibold", children: "Goleadores" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-3 text-xs text-muted-foreground", children: [
              "Si el gol es en contra, elegí ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: OWN_GOAL_SCORER_NAME }),
              "."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PredictionScorerSection, { team: match.home, goalCount: homeGoals, players: homePlayers, playersLoading, scorers: homeScorers, onChange: setHomeScorers }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PredictionScorerSection, { team: match.away, goalCount: awayGoals, players: awayPlayers, playersLoading, scorers: awayScorers, onChange: setAwayScorers })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "+2 puntos por cada goleador acertado" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-secondary/40 p-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 font-semibold", children: "Sistema de puntos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "✓ Acertar el ganador: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "+3 pts" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "✓ Acertar el marcador exacto:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "+5 pts adicionales" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "✓ Cada goleador correcto: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "+2 pts" })
              ] })
            ] })
          ] })
        ] }),
        !locked && participantsResolved && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "h-12 w-full bg-[var(--gradient-primary)] text-base font-semibold shadow-[var(--shadow-soft)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
          existing ? "Actualizar predicción" : "Guardar predicción"
        ] }),
        locked && participantsResolved && !finished && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", disabled: true, variant: "outline", className: "h-12 w-full text-base font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mr-2 h-4 w-4" }),
          " Cerrado"
        ] })
      ] })
    ] })
  ] });
}
function PredictionScorerSection({
  team,
  goalCount,
  players,
  playersLoading,
  scorers,
  onChange
}) {
  const playerOptions = buildPredictionPlayerOptions(team.code, players, scorers);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-background/80 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team, size: 18, className: "shadow-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: team.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          goalCount,
          " gol",
          goalCount === 1 ? "" : "es",
          " previstos"
        ] })
      ] })
    ] }),
    goalCount === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground", children: "Sin goles para este equipo." }) : playersLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground", children: "Cargando jugadores..." }) : playerOptions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-md bg-secondary/50 px-3 py-3 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "El catálogo de ",
        team.name,
        " todavía no tiene jugadores activos."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Pedile al administrador que actualice el plantel provisorio." })
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-11", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: `Seleccionar jugador de ${team.name}` }) }),
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
function buildPredictionPlayerOptions(teamCode, players, selectedScorers) {
  const ownGoalValue = serializeScorerEntry(teamCode, OWN_GOAL_SCORER_NAME);
  const activeOptionMap = new Map([[ownGoalValue, OWN_GOAL_SCORER_NAME], ...players.filter((player) => player.active).map((player) => [serializeScorerEntry(teamCode, player.name), player.name])]);
  const optionValues = Array.from(/* @__PURE__ */ new Set([...activeOptionMap.keys(), ...selectedScorers.filter(Boolean)]));
  return optionValues.map((value) => {
    const parsedScorer = parseScorerEntry(value);
    const label = activeOptionMap.has(value) ? parsedScorer.name : `${parsedScorer.name} (baja)`;
    return {
      value,
      label
    };
  }).sort((leftOption, rightOption) => leftOption.label.localeCompare(rightOption.label, "es"));
}
export {
  MatchPredictionPage as component
};
