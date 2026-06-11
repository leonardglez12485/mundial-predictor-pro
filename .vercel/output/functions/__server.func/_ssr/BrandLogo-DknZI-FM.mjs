import { j as jsxRuntimeExports } from "./index.mjs";
import { c as cn } from "./button-D3bn8Owt.mjs";
const worldCupLogo = "/assets/world-cup-2026-mark-CoyQmIKT.png";
const sizeClasses = {
  sm: {
    gap: "gap-2",
    image: "h-10 w-10",
    title: "text-sm",
    subtitle: "text-[10px]"
  },
  md: {
    gap: "gap-3",
    image: "h-16 w-16",
    title: "text-xl",
    subtitle: "text-[11px]"
  },
  lg: {
    gap: "gap-4",
    image: "h-24 w-24",
    title: "text-3xl sm:text-4xl",
    subtitle: "text-xs"
  }
};
function BrandLogo({
  size = "md",
  framed = true,
  showWordmark = true,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  imageClassName
}) {
  const classes = sizeClasses[size];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center", classes.gap, className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: worldCupLogo,
        alt: "Logo Mundial 2026",
        className: cn(
          "shrink-0 object-contain",
          classes.image,
          framed && "shadow-[var(--shadow-elegant)]",
          imageClassName
        ),
        loading: "eager"
      }
    ),
    showWordmark && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "truncate font-black leading-none tracking-tight",
            classes.title,
            titleClassName ?? "text-primary-deep"
          ),
          children: "Balero World Cup"
        }
      ),
      subtitle ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "mt-1 font-semibold uppercase tracking-[0.26em]",
            classes.subtitle,
            subtitleClassName ?? "text-muted-foreground"
          ),
          children: subtitle
        }
      ) : null
    ] })
  ] });
}
export {
  BrandLogo as B,
  worldCupLogo as w
};
