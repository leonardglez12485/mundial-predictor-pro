import { useEffect, useState } from "react";
import type { Team } from "@/lib/types";

interface FlagProps {
  team: Team;
  size?: number;        // px height
  className?: string;
  rounded?: boolean;
}

/** Bandera de país en miniatura (PNG SVG via flagcdn).
 *  team.code puede ser "uy", "ar", "gb-eng", etc. */
export function Flag({ team, size = 24, className = "", rounded = true }: FlagProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [team.code]);

  const code = team.code.toLowerCase();
  // flagcdn supports w20, w40, w80, w160, w320
  const w = size <= 20 ? 40 : size <= 40 ? 80 : size <= 80 ? 160 : 320;
  const src = `https://flagcdn.com/w${w}/${code}.png`;
  const srcSet = `https://flagcdn.com/w${w * 2}/${code}.png 2x`;

  if (team.code.startsWith("slot-") || hasError) {
    return (
      <div
        aria-label={`Identificador ${team.name}`}
        className={`inline-flex items-center justify-center border border-border bg-secondary text-[10px] font-bold uppercase text-secondary-foreground shadow-sm ring-1 ring-black/5 ${rounded ? "rounded-md" : ""} ${className}`}
        style={{ height: size, width: size * 1.5 }}
      >
        <span className="px-1 text-center leading-none">{team.flag || team.name.slice(0, 3)}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      srcSet={srcSet}
      onError={() => setHasError(true)}
      alt={`Bandera ${team.name}`}
      width={size * 1.5}
      height={size}
      loading="lazy"
      className={`inline-block object-cover shadow-sm ring-1 ring-black/5 ${rounded ? "rounded-md" : ""} ${className}`}
      style={{ height: size, width: size * 1.5 }}
    />
  );
}
