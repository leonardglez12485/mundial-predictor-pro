import { j as jsxRuntimeExports } from "./index.mjs";
import { u as usePredictions, a as useAuth, L as Link } from "./router-Dl2BH-LX.mjs";
import { A as AuthGuard, c as createLucideIcon } from "./check-DYD4yOsC.mjs";
import { B as BrandLogo } from "./BrandLogo-DfukgsYr.mjs";
import { H as Header, C as CalendarDays, S as Star } from "./Header-Ceztktm_.mjs";
import { A as ArrowRight, M as MatchCard } from "./MatchCard-DIkv4Z0n.mjs";
import { C as Card } from "./card-B7AcIgB1.mjs";
import { B as Button } from "./input-DitBMt9M.mjs";
import { i as isSpecialPredictionLocked, t as timeUntilSpecialDeadline } from "./scoring-DBMIEm6L.mjs";
import { g as getLocalDateKey } from "./match-display-Ci13xv4D.mjs";
import { T as Trophy } from "./trophy-Q6zAsmTU.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Flag-Dv8nSwM5.mjs";
import "./scorer-entry-BM5_IaSg.mjs";
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
];
const Target = createLucideIcon("target", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode);
function DashboardPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--gradient-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dashboard, {})
  ] }) });
}
function Dashboard() {
  const {
    matches,
    predictions,
    getSpecialPrediction,
    loading
  } = usePredictions();
  const {
    user,
    users
  } = useAuth();
  if (!user) return null;
  const isAdmin = user.role === "admin";
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-muted-foreground sm:p-10", children: "Cargando datos del torneo..." }) });
  }
  const today = getLocalDateKey((/* @__PURE__ */ new Date()).toISOString());
  const todayMatches = matches.filter((m) => getLocalDateKey(m.kickoff) === today);
  const userPredictions = predictions.filter((p) => p.userId === user.id);
  const ranking = [...users].sort((a, b) => b.points - a.points);
  const userRank = ranking.findIndex((u) => u.id === user.id) + 1;
  const specialPred = getSpecialPrediction(user.id);
  const specialLocked = isSpecialPredictionLocked();
  const stats = isAdmin ? [{
    label: "Partidos hoy",
    value: todayMatches.length,
    icon: CalendarDays,
    color: "bg-primary"
  }, {
    label: "Partidos totales",
    value: matches.length,
    icon: Target,
    color: "bg-primary-deep"
  }, {
    label: "Finalizados",
    value: matches.filter((match) => match.status === "finished").length,
    icon: Trophy,
    color: "bg-primary"
  }, {
    label: "En Desarrollo",
    value: matches.filter((match) => match.status === "live" || match.status === "starting").length,
    icon: TrendingUp,
    color: "bg-primary-deep"
  }] : [{
    label: "Partidos hoy",
    value: todayMatches.length,
    icon: CalendarDays,
    color: "bg-primary"
  }, {
    label: "Tus predicciones",
    value: userPredictions.length,
    icon: Target,
    color: "bg-primary-deep"
  }, {
    label: "Tus puntos",
    value: user.points,
    icon: Trophy,
    color: "bg-primary"
  }, {
    label: "Tu posición",
    value: `#${userRank}`,
    icon: TrendingUp,
    color: "bg-primary-deep"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:py-7", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stadium-hero mb-5 overflow-hidden rounded-lg border border-white/35 p-4 text-white shadow-[var(--shadow-elegant)] animate-fade-in sm:p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/82 backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, { size: "sm", framed: false, showWordmark: false, className: "mr-2", imageClassName: "h-6 w-6" }),
          "Mundial 2026"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-black tracking-tight sm:text-3xl", children: [
          "Hola, ",
          user.name.split(" ")[0]
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-2xl text-sm text-white/78", children: isAdmin ? todayMatches.length > 0 ? `Tenés ${todayMatches.length} partidos para supervisar hoy` : "No hay partidos hoy para gestionar" : todayMatches.length > 0 ? `Tenés ${todayMatches.length} partidos por predecir hoy` : "No hay partidos hoy, revisá el calendario próximo" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-right sm:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-white/18 bg-white/10 px-3 py-2 backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase text-white/65", children: "Puntos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-black", children: user.points })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-white/18 bg-white/10 px-3 py-2 backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase text-white/65", children: "Ranking" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-black", children: [
            "#",
            userRank || "-"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: stats.map((s, i) => {
      const Icon = s.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden p-3 transition-all hover:border-primary/35 hover:shadow-[var(--shadow-soft)] animate-slide-up sm:p-4", style: {
        animationDelay: `${i * 60}ms`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: s.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-2xl font-black", children: s.value })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-lg ${s.color} shadow-[var(--shadow-soft)]`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-primary-foreground" }) })
      ] }) }, s.label);
    }) }),
    !isAdmin && !specialLocked && !specialPred && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-5 overflow-hidden border-primary/30 bg-[var(--gradient-primary)] p-4 text-primary-foreground shadow-[var(--shadow-soft)] animate-slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[200px] flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: "¡Hacé tu pronóstico del Mundial!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-primary-foreground/82", children: [
          "Campeón, goleador y final. Tiempo restante: ",
          timeUntilSpecialDeadline()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/special", className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", className: "w-full font-semibold sm:w-auto", children: [
        "Predecir ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
      ] }) })
    ] }) }),
    !isAdmin && !specialLocked && specialPred && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-5 border-primary/20 bg-primary/5 p-3 animate-slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 text-sm sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Pronóstico cargado. Podés modificarlo hasta el cierre (",
        timeUntilSpecialDeadline(),
        " ",
        "restantes)."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/special", className: "text-sm font-semibold text-primary-deep hover:underline sm:ml-auto", children: "Ver / Editar" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black", children: isAdmin ? "Partidos del día" : "Calendario de hoy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: (/* @__PURE__ */ new Date()).toLocaleDateString("es-UY", {
          weekday: "long",
          day: "numeric",
          month: "long"
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/calendar", className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full sm:w-auto", children: [
        "Ver por fecha ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
      ] }) })
    ] }),
    todayMatches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center sm:p-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "mx-auto mb-3 h-12 w-12 text-muted-foreground/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: isAdmin ? "No hay partidos para gestionar hoy" : "No hay partidos programados para hoy" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: todayMatches.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-slide-up", style: {
      animationDelay: `${i * 80}ms`
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MatchCard, { match: m }) }, m.id)) })
  ] });
}
export {
  DashboardPage as component
};
