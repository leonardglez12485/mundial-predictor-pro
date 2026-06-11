import { c as createLucideIcon } from "./check-DYD4yOsC.mjs";
import { j as jsxRuntimeExports } from "./index.mjs";
import { C as Card } from "./card-B7AcIgB1.mjs";
import { B as Button, c as cn, a as cva } from "./input-DitBMt9M.mjs";
import { a as useAuth, u as usePredictions, L as Link } from "./router-Dl2BH-LX.mjs";
import { a as isPredictionLocked, f as formatKickoff, b as formatCountdown, L as Lock } from "./scoring-DBMIEm6L.mjs";
import { F as Flag } from "./Flag-Dv8nSwM5.mjs";
import { h as hasResolvedParticipants, f as formatMatchStage } from "./match-display-Ci13xv4D.mjs";
const __iconNode$4 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode$4);
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$3);
const __iconNode$2 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }]
];
const Clock = createLucideIcon("clock", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M16.247 7.761a6 6 0 0 1 0 8.478", key: "1fwjs5" }],
  ["path", { d: "M19.075 4.933a10 10 0 0 1 0 14.134", key: "ehdyv1" }],
  ["path", { d: "M4.925 19.067a10 10 0 0 1 0-14.134", key: "1q22gi" }],
  ["path", { d: "M7.753 16.239a6 6 0 0 1 0-8.478", key: "r2q7qm" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
];
const Radio = createLucideIcon("radio", __iconNode$1);
const __iconNode = [
  ["path", { d: "M10 2h4", key: "n1abiw" }],
  ["path", { d: "M12 14v-4", key: "1evpnu" }],
  ["path", { d: "M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6", key: "1ts96g" }],
  ["path", { d: "M9 17H4v5", key: "8t5av" }]
];
const TimerReset = createLucideIcon("timer-reset", __iconNode);
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const statusConfig = {
  pending: { label: "Pendiente", color: "bg-secondary text-secondary-foreground", icon: Clock },
  starting: {
    label: "Iniciando",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: TimerReset
  },
  live: {
    label: "En Desarrollo",
    color: "bg-destructive/10 text-destructive border-destructive/30",
    icon: Radio
  },
  delayed: {
    label: "Atrasado",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Clock
  },
  finished: { label: "Finalizado", color: "bg-muted text-muted-foreground", icon: CircleCheck }
};
function MatchCard({ match }) {
  const { user } = useAuth();
  const { getPrediction } = usePredictions();
  const isAdmin = user?.role === "admin";
  const prediction = user ? getPrediction(match.id, user.id) : void 0;
  const locked = isPredictionLocked(match);
  const participantsResolved = hasResolvedParticipants(match);
  const status = statusConfig[match.status];
  const StatusIcon = status.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "group relative overflow-hidden rounded-2xl p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[var(--shadow-elegant)] sm:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-0.5 bg-[var(--gradient-primary)] opacity-70 transition-opacity group-hover:opacity-100" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Badge,
        {
          variant: "outline",
          className: `${status.color} gap-1.5 rounded-md px-2 py-0.5 font-semibold`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "h-3 w-3" }),
            status.label
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: formatMatchStage(match) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col items-center text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team: match.home, size: 30, className: "mb-1.5 sm:h-8 sm:w-12" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-full truncate text-xs font-semibold sm:text-sm", children: match.home.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-[66px] flex-col items-center rounded-lg bg-secondary/55 px-2 py-1.5", children: [
        match.result ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-black tabular-nums sm:text-xl", children: [
          match.result.homeGoals,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "-" }),
          " ",
          match.result.awayGoals
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-black text-muted-foreground sm:text-lg", children: "VS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-center text-[11px] text-muted-foreground sm:text-xs", children: formatKickoff(match.kickoff) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col items-center text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { team: match.away, size: 30, className: "mb-1.5 sm:h-8 sm:w-12" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-full truncate text-xs font-semibold sm:text-sm", children: match.away.name })
      ] })
    ] }),
    match.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
      formatCountdown(match.kickoff)
    ] }),
    !participantsResolved && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 rounded-lg border border-border bg-secondary/40 p-3 text-center text-xs text-muted-foreground", children: "Cruce pendiente de clasificación" }),
    prediction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-lg border border-primary/20 bg-primary/10 p-2.5 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Tu predicción" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-primary-deep", children: [
        prediction.homeGoals,
        " - ",
        prediction.awayGoals
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: isAdmin ? "/admin" : "/match/$matchId",
        params: isAdmin ? void 0 : { matchId: match.id },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: locked ? "outline" : "default",
            className: "w-full",
            disabled: isAdmin ? false : locked || !participantsResolved,
            children: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Gestionar partido" }) : !participantsResolved ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Esperando clasificados" }) : locked ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mr-2 h-4 w-4" }),
              " Cerrado"
            ] }) : prediction ? "Editar predicción" : "Hacer predicción"
          }
        )
      }
    )
  ] });
}
export {
  ArrowRight as A,
  MatchCard as M
};
