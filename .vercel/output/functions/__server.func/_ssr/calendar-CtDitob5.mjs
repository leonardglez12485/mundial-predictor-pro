import { j as jsxRuntimeExports, J as reactExports } from "./index.mjs";
import { u as usePredictions, L as Link } from "./router-CcSLGoO1.mjs";
import { A as AuthGuard } from "./check-DcQEkvBF.mjs";
import { H as Header, C as CalendarDays } from "./Header-ixztRSZm.mjs";
import { A as ArrowRight, M as MatchCard } from "./MatchCard-BoivXW-n.mjs";
import { C as Card } from "./card-CZY4D_k7.mjs";
import { B as Button } from "./input-7nRw-2j6.mjs";
import { g as getLocalDateKey, f as formatMatchStage } from "./match-display-Ci13xv4D.mjs";
import { A as ArrowLeft } from "./arrow-left-DzTolANy.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./BrandLogo-CEqmXv5S.mjs";
import "./scoring-CmNvKVH9.mjs";
import "./scorer-entry-BM5_IaSg.mjs";
import "./Flag-DHT9RfW8.mjs";
function CalendarPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--gradient-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarView, {})
  ] }) });
}
function formatDateLabel(dateKey) {
  const date = /* @__PURE__ */ new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}
function CalendarView() {
  const {
    matches,
    loading
  } = usePredictions();
  const availablePhases = reactExports.useMemo(() => ["all", ...new Set(matches.map((match) => match.phase ?? "Partido"))], [matches]);
  const availableDates = reactExports.useMemo(() => [...new Set(matches.map((match) => getLocalDateKey(match.kickoff)))].sort((left, right) => left.localeCompare(right)), [matches]);
  const preferredDate = reactExports.useMemo(() => {
    const today = getLocalDateKey((/* @__PURE__ */ new Date()).toISOString());
    return availableDates.find((date) => date >= today) ?? availableDates[0] ?? "";
  }, [availableDates]);
  const [selectedDate, setSelectedDate] = reactExports.useState("");
  const [selectedPhase, setSelectedPhase] = reactExports.useState("all");
  const effectiveDate = selectedDate || preferredDate;
  const selectedIndex = availableDates.indexOf(effectiveDate);
  const dayMatches = matches.filter((match) => getLocalDateKey(match.kickoff) === effectiveDate && (selectedPhase === "all" || (match.phase ?? "Partido") === selectedPhase));
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-muted-foreground sm:p-10", children: "Cargando calendario completo..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Volver al dashboard"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-4xl", children: "Calendario por fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: "Revisa el fixture completo día por día." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-2 rounded-xl border bg-background/80 p-2 shadow-sm sm:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", disabled: selectedIndex <= 0, onClick: () => setSelectedDate(availableDates[selectedIndex - 1] ?? effectiveDate), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: effectiveDate, min: availableDates[0], max: availableDates[availableDates.length - 1], onChange: (event) => setSelectedDate(event.target.value), className: "min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm sm:flex-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", disabled: selectedIndex < 0 || selectedIndex >= availableDates.length - 1, onClick: () => setSelectedDate(availableDates[selectedIndex + 1] ?? effectiveDate), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex gap-2 overflow-x-auto pb-2", children: availablePhases.map((phase) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSelectedPhase(phase), className: `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${phase === selectedPhase ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"}`, children: phase === "all" ? "Todas las fases" : formatMatchStage({
      kickoff: (/* @__PURE__ */ new Date()).toISOString(),
      phase
    }) }, phase)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 overflow-hidden p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-5 w-5 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold capitalize", children: effectiveDate ? formatDateLabel(effectiveDate) : "Sin fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          dayMatches.length,
          " partidos",
          " ",
          selectedPhase === "all" ? "programados" : `en ${formatMatchStage({
            kickoff: (/* @__PURE__ */ new Date()).toISOString(),
            phase: selectedPhase
          })}`
        ] })
      ] })
    ] }) }),
    dayMatches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center sm:p-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "mx-auto mb-3 h-12 w-12 text-muted-foreground/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No hay partidos programados para esta fecha." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-5 md:grid-cols-2 lg:grid-cols-3", children: dayMatches.map((match, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-slide-up", style: {
      animationDelay: `${index * 70}ms`
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MatchCard, { match }) }, match.id)) })
  ] });
}
export {
  CalendarPage as component
};
