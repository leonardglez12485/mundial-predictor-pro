import { J as reactExports, j as jsxRuntimeExports } from "./index.mjs";
function Flag({ team, size = 24, className = "", rounded = true }) {
  const [hasError, setHasError] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setHasError(false);
  }, [team.code]);
  const code = team.code.toLowerCase();
  const w = size <= 20 ? 40 : size <= 40 ? 80 : size <= 80 ? 160 : 320;
  const src = `https://flagcdn.com/w${w}/${code}.png`;
  const srcSet = `https://flagcdn.com/w${w * 2}/${code}.png 2x`;
  if (team.code.startsWith("slot-") || hasError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "aria-label": `Identificador ${team.name}`,
        className: `inline-flex items-center justify-center border border-border bg-secondary text-[10px] font-bold uppercase text-secondary-foreground shadow-sm ring-1 ring-black/5 ${rounded ? "rounded-md" : ""} ${className}`,
        style: { height: size, width: size * 1.5 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1 text-center leading-none", children: team.flag || team.name.slice(0, 3) })
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "img",
    {
      src,
      srcSet,
      onError: () => setHasError(true),
      alt: `Bandera ${team.name}`,
      width: size * 1.5,
      height: size,
      loading: "lazy",
      className: `inline-block object-cover shadow-sm ring-1 ring-black/5 ${rounded ? "rounded-md" : ""} ${className}`,
      style: { height: size, width: size * 1.5 }
    }
  );
}
export {
  Flag as F
};
