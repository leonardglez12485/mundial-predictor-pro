import { j as jsxRuntimeExports, V as Outlet } from "./index.mjs";
import { u as usePredictions, L as Link } from "./router-B1kSKAf9.mjs";
import { u as useLocation, H as Header, U as Users, F as Flame } from "./Header-ujJFDq-9.mjs";
import { A as AuthGuard, c as createLucideIcon } from "./label-DWX2Ekou.mjs";
import { F as Flag } from "./Flag-CgwP51Nl.mjs";
import { b as buildGroupTables } from "./tournament-stats-CPg3V-3x.mjs";
import { C as Card } from "./card-CaY9qWaX.mjs";
import { B as Button } from "./button-D3bn8Owt.mjs";
import { A as ArrowLeft } from "./arrow-left-BvbXfRgx.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./BrandLogo-DknZI-FM.mjs";
import "./input-2vsokMh7.mjs";
import "./teams-BY8U4O8V.mjs";
const __iconNode = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
];
const Layers = createLucideIcon("layers", __iconNode);
function TeamsPage() {
  const location = useLocation();
  const showingList = location.pathname === "/teams";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--gradient-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    showingList ? /* @__PURE__ */ jsxRuntimeExports.jsx(TeamsView, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] }) });
}
function TeamsView() {
  const {
    teams,
    matches,
    loading
  } = usePredictions();
  const groupTables = buildGroupTables(teams, matches);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-muted-foreground sm:p-10", children: "Cargando equipos del Mundial..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Volver al dashboard"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-4xl", children: "Equipos del Mundial" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: "Visualiza las 48 selecciones organizadas por grupo." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid w-full gap-3 sm:w-auto sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 sm:min-w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Selecciones" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: teams.length })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 sm:min-w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-5 w-5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Grupos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: groupTables.length })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: groupTables.map(({
      group,
      rows
    }, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden animate-slide-up", style: {
      animationDelay: `${index * 45}ms`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b bg-secondary/40 px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-bold", children: [
        "Grupo ",
        group
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[420px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1.95fr)_repeat(6,minmax(0,0.5fr))] gap-2 border-b px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Equipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: "PJ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: "V" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: "E" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: "D" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: "DG" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: "P" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: rows.map((row, rowIndex) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1.95fr)_repeat(6,minmax(0,0.5fr))] items-center gap-2 px-1 py-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/teams/${encodeURIComponent(row.team.code)}`, className: "flex min-w-0 items-center gap-2.5 rounded-md px-1 py-1 transition-colors hover:bg-secondary/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 flex-shrink-0 text-[10px] font-bold text-muted-foreground", children: rowIndex + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team: row.team, size: 18, className: "shadow-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[12px] font-semibold leading-tight", children: row.team.name }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { value: row.played }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { value: row.won }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { value: row.drawn }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { value: row.lost }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { value: formatGoalDifference(row.goalDifference) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCell, { value: row.points, strong: true })
        ] }, row.team.code)) })
      ] }) })
    ] }, group)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/scorers", className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full sm:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "mr-2 h-4 w-4" }),
        "Ver máximos goleadores"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/calendar", className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full sm:w-auto", children: "Ver calendario" }) })
    ] })
  ] });
}
function StatCell({
  value,
  strong = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-center tabular-nums ${strong ? "font-bold text-primary-deep" : "text-foreground"}`, children: value });
}
function formatGoalDifference(value) {
  return value > 0 ? `+${value}` : `${value}`;
}
export {
  TeamsPage as component
};
