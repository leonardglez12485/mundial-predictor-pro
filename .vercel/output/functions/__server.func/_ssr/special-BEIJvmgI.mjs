import { j as jsxRuntimeExports, J as reactExports } from "./index.mjs";
import { a as useAuth, u as usePredictions, L as Link, b as useNavigate, t as toast } from "./router-CcSLGoO1.mjs";
import { A as AuthGuard } from "./check-DcQEkvBF.mjs";
import { H as Header, S as Star } from "./Header-ixztRSZm.mjs";
import { i as isSpecialPredictionLocked, t as timeUntilSpecialDeadline, L as Lock } from "./scoring-CmNvKVH9.mjs";
import { C as Card, L as Label } from "./card-CZY4D_k7.mjs";
import { I as Input, B as Button } from "./input-7nRw-2j6.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectGroup, e as SelectLabel, f as SelectItem } from "./select-XHUJQEHL.mjs";
import { F as Flag } from "./Flag-DHT9RfW8.mjs";
import { g as groupTeams, c as createTeamMap } from "./teams-BY8U4O8V.mjs";
import { A as ArrowLeft } from "./arrow-left-DzTolANy.mjs";
import { S as Save } from "./save-BOYXv3VC.mjs";
import { T as Trophy } from "./trophy-DkFsPQBf.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./BrandLogo-CEqmXv5S.mjs";
import "./scorer-entry-BM5_IaSg.mjs";
function SpecialPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--gradient-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpecialForm, {})
  ] }) });
}
function SpecialForm() {
  const {
    user
  } = useAuth();
  const {
    teams,
    getSpecialPrediction,
    saveSpecialPrediction,
    loading
  } = usePredictions();
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-muted-foreground sm:p-10", children: "Cargando tu pronóstico actual..." }) });
  }
  if (!user) return null;
  if (user.role === "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin", className: "mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Volver al panel admin"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 text-center sm:p-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold sm:text-2xl", children: "Pronóstico no disponible para administradores" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Esta cuenta solo gestiona partidos, resultados y goleadores." })
      ] })
    ] });
  }
  const existing = getSpecialPrediction(user.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadedSpecialForm, { user, teams, existing, saveSpecialPrediction }, existing?.updatedAt ?? "new");
}
function LoadedSpecialForm({
  user,
  teams,
  existing,
  saveSpecialPrediction
}) {
  const navigate = useNavigate();
  const locked = isSpecialPredictionLocked();
  const groupedTeams = groupTeams(teams);
  const teamMap = createTeamMap(teams);
  const [championCode, setChampionCode] = reactExports.useState(existing?.championCode ?? "");
  const [topScorer, setTopScorer] = reactExports.useState(existing?.topScorer ?? "");
  const [finalHomeCode, setFinalHomeCode] = reactExports.useState(existing?.finalHomeCode ?? "");
  const [finalAwayCode, setFinalAwayCode] = reactExports.useState(existing?.finalAwayCode ?? "");
  const [finalHomeGoals, setFinalHomeGoals] = reactExports.useState(existing?.finalHomeGoals ?? 1);
  const [finalAwayGoals, setFinalAwayGoals] = reactExports.useState(existing?.finalAwayGoals ?? 0);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked) return toast.error("El plazo ya cerró");
    if (!championCode || !topScorer.trim() || !finalHomeCode || !finalAwayCode) {
      return toast.error("Completá todos los campos");
    }
    if (finalHomeCode === finalAwayCode) {
      return toast.error("Los dos finalistas deben ser distintos");
    }
    await saveSpecialPrediction({
      userId: user.id,
      championCode,
      topScorer: topScorer.trim(),
      finalHomeCode,
      finalAwayCode,
      finalHomeGoals,
      finalAwayGoals,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    toast.success(existing ? "Pronóstico actualizado" : "¡Pronóstico guardado!");
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)] sm:h-12 sm:w-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-6 w-6 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold sm:text-2xl", children: "Mi pronóstico del Mundial" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Campeón, goleador y final. Editable hasta el 1 de julio." })
        ] })
      ] }),
      !locked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm", children: [
        "⏱️ Tiempo restante para modificar:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-primary-deep", children: timeUntilSpecialDeadline() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: "Cierre: 1 de julio de 2026" })
      ] }),
      locked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-destructive", children: "Pronóstico bloqueado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-destructive/80", children: "El plazo para modificar ya cerró." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { disabled: locked, className: "space-y-6 disabled:opacity-60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base font-semibold", children: "🏆 Campeón del Mundial" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: championCode, onValueChange: setChampionCode, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Elegí una selección..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: groupedTeams.map(({
                group,
                teams: teamsInGroup
              }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectLabel, { children: [
                  "Grupo ",
                  group
                ] }),
                teamsInGroup.map((team) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: team.code, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team, size: 18 }),
                  team.name
                ] }) }, team.code))
              ] }, group)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base font-semibold", children: "⚽ Goleador del torneo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: topScorer, onChange: (e) => setTopScorer(e.target.value), placeholder: "Nombre del jugador...", className: "h-12" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-secondary/30 p-4 sm:p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-3 block text-base font-semibold", children: "🥇 Partido final" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: finalHomeCode, onValueChange: setFinalHomeCode, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-11", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Finalista 1" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: groupedTeams.map(({
                  group,
                  teams: teamsInGroup
                }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectLabel, { children: [
                    "Grupo ",
                    group
                  ] }),
                  teamsInGroup.map((team) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: team.code, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team, size: 16 }),
                    " ",
                    team.name
                  ] }) }, team.code))
                ] }, group)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: finalAwayCode, onValueChange: setFinalAwayCode, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-11", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Finalista 2" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: groupedTeams.map(({
                  group,
                  teams: teamsInGroup
                }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectLabel, { children: [
                    "Grupo ",
                    group
                  ] }),
                  teamsInGroup.map((team) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: team.code, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team, size: 16 }),
                    " ",
                    team.name
                  ] }) }, team.code))
                ] }, group)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 sm:gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-1 block truncate text-xs text-muted-foreground", children: [
                  "Goles ",
                  finalHomeCode ? teamMap[finalHomeCode]?.name : "Equipo 1"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 20, value: finalHomeGoals, onChange: (e) => setFinalHomeGoals(Math.max(0, parseInt(e.target.value) || 0)), className: "h-12 text-center text-xl font-bold sm:h-14 sm:text-2xl" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pb-3 text-xl font-bold text-muted-foreground sm:pb-4 sm:text-2xl", children: "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-1 block truncate text-xs text-muted-foreground", children: [
                  "Goles ",
                  finalAwayCode ? teamMap[finalAwayCode]?.name : "Equipo 2"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 20, value: finalAwayGoals, onChange: (e) => setFinalAwayGoals(Math.max(0, parseInt(e.target.value) || 0)), className: "h-12 text-center text-xl font-bold sm:h-14 sm:text-2xl" })
              ] })
            ] })
          ] })
        ] }),
        !locked && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "h-12 w-full bg-[var(--gradient-primary)] text-base font-semibold shadow-[var(--shadow-soft)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
          existing ? "Actualizar pronóstico" : "Guardar pronóstico"
        ] }),
        existing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-primary" }),
            " Tu pronóstico actual"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Campeón:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: teamMap[existing.championCode]?.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Goleador: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: existing.topScorer })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Final:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "break-words text-foreground", children: [
                teamMap[existing.finalHomeCode]?.name,
                " ",
                existing.finalHomeGoals,
                " -",
                " ",
                existing.finalAwayGoals,
                " ",
                teamMap[existing.finalAwayCode]?.name
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  SpecialPage as component
};
