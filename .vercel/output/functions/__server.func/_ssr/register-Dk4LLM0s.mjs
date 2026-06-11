import { j as jsxRuntimeExports } from "./index.mjs";
import { L as Link } from "./router-B1kSKAf9.mjs";
import { B as BrandLogo } from "./BrandLogo-DknZI-FM.mjs";
import { B as Button } from "./button-D3bn8Owt.mjs";
import { C as Card } from "./card-CaY9qWaX.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function RegisterPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-svh items-center justify-center bg-[var(--gradient-soft)] px-4 py-8 sm:py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md animate-slide-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, { size: "md", subtitle: "Predicciones del Mundial", className: "justify-center" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50 p-5 shadow-[var(--shadow-elegant)] sm:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-1 text-xl font-semibold", children: "Registro deshabilitado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-sm text-muted-foreground", children: "Solo pueden acceder las cuentas autorizadas por la administración." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground", children: "Si necesitás acceso, pedíselo al administrador." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-11 w-full bg-[var(--gradient-primary)] text-base font-semibold shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-glow)]", children: "Volver al login" }) })
      ] })
    ] })
  ] }) });
}
export {
  RegisterPage as component
};
