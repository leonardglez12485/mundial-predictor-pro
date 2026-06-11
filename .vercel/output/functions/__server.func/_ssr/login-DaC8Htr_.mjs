import { J as reactExports, j as jsxRuntimeExports } from "./index.mjs";
import { a as useAuth, b as useNavigate, L as Link, t as toast } from "./router-CcSLGoO1.mjs";
import { B as BrandLogo, w as worldCupLogo } from "./BrandLogo-CEqmXv5S.mjs";
import { I as Input, B as Button } from "./input-7nRw-2j6.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const heroImg = "/assets/uruguay-hero-LR7nu3-Q.png";
const seleccionImg = "/assets/seleccion1-DhHPDpIS.jpg";
const galleryImg = "/assets/images-CSwirwBA.jpg";
function LoginPage() {
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    if (res.ok) {
      toast.success("¡Bienvenido!");
      navigate({
        to: "/"
      });
    } else {
      toast.error(res.error || "Error");
    }
    setLoading(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-svh overflow-y-auto bg-[var(--gradient-soft)] text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "grid min-h-svh lg:grid-cols-[1.18fr_0.58fr] xl:grid-cols-[1.24fr_0.52fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "stadium-hero relative hidden overflow-hidden border-r border-white/20 px-8 py-8 lg:flex lg:min-h-0 lg:px-10 xl:px-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex h-full w-full max-w-4xl flex-col justify-center gap-8 lg:gap-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, { size: "lg", framed: false, subtitle: "Mundial 2026", className: "mb-4", titleClassName: "text-4xl font-black leading-[0.92] text-white lg:text-5xl xl:text-6xl", subtitleClassName: "text-white/72", imageClassName: "h-18 w-18 sm:h-20 sm:w-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-md text-base leading-7 text-white/78 lg:text-lg", children: "Predicciones, ranking y calendario en una experiencia compacta con una identidad más mundialista." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[48vh] min-h-[380px] w-full max-w-[760px] lg:h-[56vh] xl:h-[60vh]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-0 top-[8%] z-10 w-[31%] rounded-lg border border-white/25 bg-white/15 p-2 shadow-[0_24px_60px_rgba(8,26,43,0.22)] backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: galleryImg, alt: "Galería de selección", className: "h-[190px] w-full object-cover object-center xl:h-[220px]", loading: "eager" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-3 w-14 rounded-full bg-primary-glow/80" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-3 w-20 rounded-full bg-white/75" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-[28%] top-0 z-20 w-[48%] rounded-lg border border-white/30 bg-white/18 p-3 shadow-[0_34px_80px_rgba(8,26,43,0.24)] backdrop-blur xl:w-[50%]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroImg, alt: "Selección uruguaya — Balero World Cup", className: "h-[360px] w-full object-cover object-top lg:h-[420px] xl:h-[470px]", loading: "eager" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-6 top-5 h-1.5 w-24 rounded-full bg-white/85" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-4 top-14 rounded-md bg-accent px-3 py-1.5 text-sm font-bold text-accent-foreground shadow-[0_12px_24px_rgba(8,26,43,0.2)]", children: "16:45" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-4 left-5 rounded-md border border-white/30 bg-white/88 px-4 py-2 text-sm font-semibold text-primary-deep shadow-[0_18px_40px_rgba(8,26,43,0.18)]", children: "Ranking en juego" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-[14%] z-30 w-[34%] rounded-lg border border-white/25 bg-white/16 p-2 shadow-[0_22px_50px_rgba(8,26,43,0.22)] backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: seleccionImg, alt: "Selección celebrando", className: "h-[205px] w-full object-cover object-center xl:h-[235px]", loading: "eager" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 flex-1 rounded-full bg-white/72" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-[12%] right-[3%] z-40 flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-[0_20px_40px_rgba(8,26,43,0.25)] xl:h-24 xl:w-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full border-4 border-white/95 xl:h-10 xl:w-10" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "flex min-h-svh items-center justify-center px-[15px] py-8 lg:min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-[392px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-left sm:gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: worldCupLogo, alt: "Logo Mundial 2026", className: "h-16 w-auto flex-shrink-0 object-contain sm:h-20", loading: "eager" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-[1.8rem] font-black text-foreground sm:text-[2rem]", children: "Iniciar sesión" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-[28ch] text-sm leading-5 text-muted-foreground sm:text-[15px]", children: "Accedé para seguir cargando tus predicciones del Mundial." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-3 px-4 py-5 sm:px-5 sm:py-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", value: email, onChange: (e) => setEmail(e.target.value), required: true, placeholder: "Email o usuario", className: " rounded-none border-x-0 border-t-0 border-b-[1.5px] border-primary/30 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0 focus-visible:border-primary", autoComplete: "username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, placeholder: "Contraseña", className: "rounded-none border-x-0 border-t-0 border-b-[1.5px] border-primary/30 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0 focus-visible:border-primary", autoComplete: "current-password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "mt-[40px] h-11 w-full rounded-2xl text-base font-bold", children: loading ? "Ingresando..." : "Iniciar sesión" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-1 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-sm font-medium text-primary-deep transition-colors hover:text-foreground hover:underline", children: "¿Olvidaste tu contraseña?" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-1 h-px bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pt-1 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", className: "font-semibold text-primary-deep transition-colors hover:text-foreground hover:underline", children: "Crear cuenta nueva" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-left text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-extrabold text-foreground", children: "Creá una cuenta" }),
        " para predecir partidos del Mundial."
      ] })
    ] }) })
  ] }) });
}
export {
  LoginPage as component
};
