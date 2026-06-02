import worldCupLogo from "@/assets/world-cup-2026-mark.png";
import { cn } from "@/lib/utils";

type BrandLogoSize = "sm" | "md" | "lg";

type BrandLogoProps = {
  size?: BrandLogoSize;
  framed?: boolean;
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  imageClassName?: string;
};

const sizeClasses: Record<
  BrandLogoSize,
  {
    gap: string;
    image: string;
    title: string;
    subtitle: string;
  }
> = {
  sm: {
    gap: "gap-2",
    image: "h-10 w-10",
    title: "text-sm",
    subtitle: "text-[10px]",
  },
  md: {
    gap: "gap-3",
    image: "h-16 w-16",
    title: "text-xl",
    subtitle: "text-[11px]",
  },
  lg: {
    gap: "gap-4",
    image: "h-24 w-24",
    title: "text-3xl sm:text-4xl",
    subtitle: "text-xs",
  },
};

export function BrandLogo({
  size = "md",
  framed = true,
  showWordmark = true,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  imageClassName,
}: BrandLogoProps) {
  const classes = sizeClasses[size];

  return (
    <div className={cn("flex items-center", classes.gap, className)}>
      <img
        src={worldCupLogo}
        alt="Logo Mundial 2026"
        className={cn(
          "shrink-0 object-contain",
          classes.image,
          framed && "shadow-[var(--shadow-elegant)]",
          imageClassName,
        )}
        loading="eager"
      />

      {showWordmark && (
        <div className="min-w-0">
          <div
            className={cn(
              "truncate font-black leading-none tracking-tight",
              classes.title,
              titleClassName ?? "text-primary-deep",
            )}
          >
            Balero World Cup
          </div>
          {subtitle ? (
            <div
              className={cn(
                "mt-1 font-semibold uppercase tracking-[0.26em]",
                classes.subtitle,
                subtitleClassName ?? "text-muted-foreground",
              )}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
