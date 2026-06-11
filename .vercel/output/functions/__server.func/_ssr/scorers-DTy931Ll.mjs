import { j as jsxRuntimeExports } from "./index.mjs";
import { u as usePredictions, L as Link } from "./router-cA06uPvp.mjs";
import { A as AuthGuard, c as createLucideIcon } from "./check-CUGRap4B.mjs";
import { F as Flag } from "./Flag-DpIzzjG2.mjs";
import { H as Header, U as Users, F as Flame } from "./Header-Bkt263IR.mjs";
import { a as buildTopScorers } from "./tournament-stats-CPg3V-3x.mjs";
import { C as Card } from "./card-DVycTJf1.mjs";
import { B as Button } from "./input-CBQLwIGd.mjs";
import { A as ArrowLeft } from "./arrow-left-CmbCYWhn.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./BrandLogo-_Uc-xGk_.mjs";
import "./teams-BY8U4O8V.mjs";
const __iconNode = [
  ["path", { d: "M12 13V2l8 4-8 4", key: "5wlwwj" }],
  ["path", { d: "M20.561 10.222a9 9 0 1 1-12.55-5.29", key: "1c0wjv" }],
  ["path", { d: "M8.002 9.997a5 5 0 1 0 8.9 2.02", key: "gb1g7m" }]
];
const Goal = createLucideIcon("goal", __iconNode);
function ScorersPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--gradient-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScorersView, {})
  ] }) });
}
function ScorersView() {
  const {
    matches,
    teams,
    loading
  } = usePredictions();
  const scorers = buildTopScorers(matches);
  const totalGoals = scorers.reduce((sum, scorer) => sum + scorer.goals, 0);
  const teamMap = new Map(teams.map((team) => [team.code, team]));
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-muted-foreground sm:p-10", children: "Cargando goleadores..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/teams", className: "mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Volver a grupos"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-4xl", children: "Máximos goleadores" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: "Conteo automático según los goleadores cargados por el administrador en cada resultado." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid w-full gap-3 sm:w-auto sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 sm:min-w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Jugadores" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: scorers.length })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 sm:min-w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Goal, { className: "h-5 w-5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Goles cargados" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: totalGoals })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[560px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[72px_minmax(0,1fr)_140px_92px] gap-3 border-b bg-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Puesto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Jugador" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Equipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: "Goles" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: scorers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-10 text-center text-sm text-muted-foreground", children: "Aún no hay goleadores cargados en los resultados." }) : scorers.map((scorer, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[72px_minmax(0,1fr)_140px_92px] items-center gap-3 px-5 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${index < 3 ? "bg-primary/10 text-primary-deep" : "bg-secondary text-muted-foreground"}`, children: index + 1 }),
          index === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4 text-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 truncate font-medium", children: scorer.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 items-center gap-2 text-sm text-muted-foreground", children: scorer.teamCode && teamMap.get(scorer.teamCode) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team: teamMap.get(scorer.teamCode), size: 16, className: "shadow-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: teamMap.get(scorer.teamCode).name })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Sin equipo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right text-lg font-bold text-primary-deep tabular-nums", children: scorer.goals })
      ] }, `${scorer.teamCode ?? "na"}-${scorer.name}-${index}`)) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/teams", className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full sm:w-auto", children: "Ver grupos" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/calendar", className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full sm:w-auto", children: "Ver calendario" }) })
    ] })
  ] });
}
export {
  ScorersPage as component
};
