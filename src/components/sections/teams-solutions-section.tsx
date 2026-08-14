import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { GbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function TeamsSolutionsSection() {
  const { t } = useI18n();
  const { openBrandModal } = useModals();
  const [active, setActive] = useState(0);
  const services = t.teams.services;

  return (
    <section id="times" className="section-gbz bg-surface">
      <div className="container-gbz grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow-gbz">{t.teams.eyebrow}</p>
          <h2 className="title-gbz mt-4 max-w-[16ch]">{t.teams.title}</h2>
          <p className="mt-6 max-w-[52ch] text-base text-muted-foreground">{t.teams.description}</p>
          <div className="mt-8">
            <GbzButton onClick={() => openBrandModal(t.teams.subject)}>
              {t.teams.button}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </GbzButton>
          </div>
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {services.map((service, index) => {
            const isActive = index === active;
            return (
              <li
                key={service.key}
                className={cn(
                  "relative transition-colors duration-200",
                  isActive && "bg-primary/[0.035]",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-primary transition-transform duration-200",
                    isActive && "scale-y-100",
                  )}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={`team-panel-${service.key}`}
                  onClick={() => setActive(index)}
                  className="gbz-interactive flex w-full items-start justify-between gap-6 px-5 py-6 text-left transition-transform duration-[120ms] ease-[var(--ease-out-gbz)] active:scale-[0.99] md:px-7 md:py-7"
                >
                  <span
                    className={cn(
                      "font-display text-3xl font-bold leading-none tracking-[-0.035em] transition-colors duration-[160ms] md:text-[2.65rem]",
                      isActive ? "text-primary" : "text-foreground hover:text-primary",
                    )}
                  >
                    {service.title}
                  </span>
                  <span
                    className={cn(
                      "pt-1 font-display text-xs font-bold tracking-[0.2em]",
                      isActive ? "text-primary" : "text-subtle",
                    )}
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                </button>
                <div
                  id={`team-panel-${service.key}`}
                  hidden={!isActive}
                  className="px-5 pb-7 md:px-7 md:pb-8"
                >
                  <p className="max-w-[48ch] text-base leading-relaxed text-foreground/75 md:text-lg">
                    {service.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
