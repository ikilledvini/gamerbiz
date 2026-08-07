import { usePrefersReducedMotion } from "@/hooks/use-motion";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function ServicesMarquee() {
  const { t } = useI18n();
  const reduced = usePrefersReducedMotion();
  const items = t.marquee;

  return (
    <section aria-label={items[0]} className="border-y border-border bg-primary py-4">
      <div className={cn("overflow-hidden", reduced && "overflow-x-auto")}>
        <div
          style={{ ["--marquee-duration" as string]: "38s" }}
          className={cn("flex w-max items-center", !reduced && "animate-marquee")}
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 ? "true" : undefined}
              className="flex items-center"
            >
              {items.map((item) => (
                <li
                  key={`${copy}-${item}`}
                  className="flex items-center whitespace-nowrap px-6 font-display text-sm font-extrabold uppercase tracking-[0.12em] text-primary-foreground md:text-base"
                >
                  {item}
                  <span className="ml-6 text-primary-foreground/50" aria-hidden="true">
                    •
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
