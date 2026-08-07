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
  const current = services[active] ?? services[0]!;

  return (
    <section id="times" className="section-gbz bg-surface">
      <div className="container-gbz grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow-gbz">{t.teams.eyebrow}</p>
          <h2 className="title-gbz mt-4 max-w-[16ch]">{t.teams.title}</h2>
          <p className="mt-6 max-w-[52ch] text-base text-muted-foreground">
            {t.teams.description}
          </p>
          <div className="mt-8">
            <GbzButton onClick={() => openBrandModal(t.teams.subject)}>
              {t.teams.button}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </GbzButton>
          </div>

          <div
            key={current.key}
            className="mt-10 hidden animate-rise rounded-3xl border border-border bg-background p-8 lg:block"
          >
            <h3 className="font-display text-xl font-bold text-primary">{current.title}</h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {current.text}
            </p>
          </div>
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {services.map((service, index) => {
            const isActive = index === active;
            return (
              <li key={service.key}>
                <button
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={`team-panel-${service.key}`}
                  onClick={() => setActive(index)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className={cn(
                      "font-display text-2xl font-bold tracking-tight transition-colors duration-200 md:text-3xl",
                      isActive ? "text-primary" : "text-foreground",
                    )}
                  >
                    {service.title}
                  </span>
                  <span
                    className={cn(
                      "font-display text-xs font-bold tracking-[0.2em]",
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
                  className="pb-6 lg:hidden"
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">
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
