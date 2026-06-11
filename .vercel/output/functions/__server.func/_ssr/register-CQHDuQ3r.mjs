import { J as reactExports, j as jsxRuntimeExports } from "./index.mjs";
import { a as useAuth, b as useNavigate, L as Link, t as toast } from "./router-Dl2BH-LX.mjs";
import { B as BrandLogo } from "./BrandLogo-DfukgsYr.mjs";
import { I as Input, B as Button } from "./input-DitBMt9M.mjs";
import { C as Card, L as Label } from "./card-B7AcIgB1.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function RegisterPage() {
  const {
    register
  } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener 6 caracteres mínimo");
      return;
    }
    setLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error || "No fue posible crear la cuenta");
      return;
    }
    toast.success("Cuenta creada");
    navigate({
      to: "/special"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-svh items-center justify-center bg-[var(--gradient-soft)] px-4 py-8 sm:py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md animate-slide-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, { size: "md", subtitle: "Predicciones del Mundial", className: "justify-center" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50 p-5 shadow-[var(--shadow-elegant)] sm:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-1 text-xl font-semibold", children: "Crear cuenta" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-sm text-muted-foreground", children: "Unite y comenzá a predecir" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Nombre completo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", value: name, onChange: (e) => setName(e.target.value), required: true, minLength: 2, placeholder: "Tu nombre", className: "h-11", autoComplete: "name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, placeholder: "tu@email.com", className: "h-11", autoComplete: "email" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Contraseña" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6, placeholder: "Mínimo 6 caracteres", className: "h-11", autoComplete: "new-password" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "h-11 w-full bg-[var(--gradient-primary)] text-base font-semibold shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-glow)]", children: loading ? "Creando..." : "Crear cuenta" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "¿Ya tenés cuenta?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-semibold text-primary hover:underline", children: "Iniciá sesión" })
      ] })
    ] })
  ] }) });
}
export {
  RegisterPage as component
};
