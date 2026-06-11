import { j as jsxRuntimeExports } from "./index.mjs";
import { A as AuthGuard } from "./check-CUGRap4B.mjs";
import { B as BrandLogo } from "./BrandLogo-_Uc-xGk_.mjs";
import { H as Header, A as Avatar, a as AvatarFallback, M as Medal } from "./Header-Bkt263IR.mjs";
import { a as useAuth } from "./router-cA06uPvp.mjs";
import { C as Card } from "./card-DVycTJf1.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./input-CBQLwIGd.mjs";
function RankingPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--gradient-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Ranking, {})
  ] }) });
}
function Ranking() {
  const {
    users,
    user
  } = useAuth();
  const ranking = [...users].sort((a, b) => b.points - a.points);
  const top3 = ranking.slice(0, 3);
  const podiumStyles = [{
    order: 2,
    height: "h-32",
    color: "bg-yellow-400",
    label: "1°"
  }, {
    order: 1,
    height: "h-24",
    color: "bg-slate-300",
    label: "2°"
  }, {
    order: 3,
    height: "h-20",
    color: "bg-amber-600",
    label: "3°"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center animate-fade-in sm:mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, { size: "md", showWordmark: false, className: "mb-3 justify-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-4xl", children: "Ranking Global" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Los mejores pronosticadores del Mundial" })
    ] }),
    top3.length >= 3 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 grid grid-cols-3 items-end gap-2 sm:mb-10 sm:gap-6 animate-slide-up", children: top3.map((u, i) => {
      const style = podiumStyles[i];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        order: style.order
      }, className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "mb-2 h-12 w-12 border-4 border-card shadow-[var(--shadow-soft)] sm:h-20 sm:w-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-[var(--gradient-primary)] text-base font-bold text-primary-foreground sm:text-lg", children: u.avatar }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-1 text-xs font-semibold sm:text-sm", children: u.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            u.points,
            " pts"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex w-full ${style.height} items-start justify-center rounded-t-xl ${style.color} pt-3 shadow-[var(--shadow-soft)]`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-black text-foreground drop-shadow sm:text-2xl", children: style.label }) })
      ] }, u.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b bg-secondary/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-5", children: "Tabla completa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: ranking.map((u, idx) => {
        const isMe = u.id === user?.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 px-3 py-3.5 transition-colors hover:bg-secondary/40 sm:gap-4 sm:px-5 ${isMe ? "bg-primary/5" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-slate-100 text-slate-700" : idx === 2 ? "bg-amber-100 text-amber-700" : "bg-secondary text-muted-foreground"}`, children: idx < 3 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "h-4 w-4" }) : idx + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-9 w-9 flex-shrink-0 sm:h-10 sm:w-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-[var(--gradient-primary)] text-sm font-semibold text-primary-foreground", children: u.avatar }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate font-medium", children: [
              u.name,
              isMe && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary-deep", children: "Tú" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Posición #",
              idx + 1
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-primary-deep tabular-nums sm:text-lg", children: u.points }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "pts" })
          ] })
        ] }, u.id);
      }) })
    ] })
  ] });
}
export {
  RankingPage as component
};
