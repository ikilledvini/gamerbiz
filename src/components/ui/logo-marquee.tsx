import { useState } from "react";
import type { ClientLogo } from "@/data/clients";
import { usePrefersReducedMotion } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";

type LogoMarqueeProps = {
  items: ClientLogo[];
  label: string;
  reverse?: boolean;
  durationSeconds?: number;
};

function LogoItem({ item, duplicate }: { item: ClientLogo; duplicate: boolean }) {
  const [failed, setFailed] = useState(false);

  return (
    <li
      className="shrink-0"
      aria-hidden={duplicate ? "true" : undefined}
      role={duplicate ? "presentation" : undefined}
    >
      <div
        tabIndex={duplicate ? -1 : 0}
        className="group flex h-16 min-w-[150px] items-center justify-center px-6 md:h-20 md:min-w-[190px]"
      >
        {item.logo && !failed ? (
          <img
            src={item.logo}
            alt={duplicate ? "" : item.alt}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-10 w-auto max-w-[150px] object-contain opacity-55 brightness-0 invert transition-all duration-[220ms] ease-out group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0 group-focus-visible:opacity-100 group-focus-visible:brightness-100 group-focus-visible:invert-0 md:h-12"
          />
        ) : (
          <span className="whitespace-nowrap font-display text-base font-bold uppercase tracking-[0.06em] text-foreground opacity-45 transition-opacity duration-[220ms] group-hover:opacity-100 md:text-lg">
            {item.name}
          </span>
        )}
      </div>
    </li>
  );
}


export function LogoMarquee({
  items,
  label,
  reverse = false,
  durationSeconds = 60,
}: LogoMarqueeProps) {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={cn(
          "flex",
          reduced && "overflow-x-auto [scrollbar-width:thin]",
        )}
      >
        <ul
          aria-label={label}
          style={{ ["--marquee-duration" as string]: `${durationSeconds}s` }}
          className={cn(
            "flex w-max items-center",
            !reduced && (reverse ? "animate-marquee-reverse" : "animate-marquee"),
            paused && "[animation-play-state:paused]",
          )}
        >
          {items.map((item) => (
            <LogoItem key={item.slug} item={item} duplicate={false} />
          ))}
          {!reduced &&
            items.map((item) => (
              <LogoItem key={`dup-${item.slug}`} item={item} duplicate />
            ))}
        </ul>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent md:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent md:w-28" />
    </div>
  );
}
