import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function BrandsSolutionsSection() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const services = t.brands.services;
  const current = services[active] ?? services[0]!;

  return (
    <section id="marcas" className="section-gbz">
      <div className="container-gbz">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow-gbz">{t.brands.eyebrow}</p>
            <h2 className="title-gbz mt-4 max-w-[18ch]">{t.brands.title}</h2>
          </div>
          <p className="max-w-[52ch] text-base text-muted-foreground">{t.brands.description}</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Lista interativa / accordion */}
          <div className="order-2 lg:order-1">
            <ul className="divide-y divide-border border-y border-border">
              {services.map((service, index) => {
                const isActive = index === active;
                return (
                  <li key={service.key}>
                    <button
                      type="button"
                      aria-expanded={isActive}
                      aria-controls={`brand-panel-${service.key}`}
                      onClick={() => setActive(index)}
                      className="gbz-interactive flex w-full items-center justify-between gap-6 py-6 text-left transition-transform duration-[120ms] ease-[var(--ease-out-gbz)] active:scale-[0.99]"
                    >
                      <span
                        className={cn(
                          "font-display text-2xl font-bold tracking-tight transition-colors duration-[160ms] md:text-3xl",
                          isActive ? "text-primary" : "text-foreground",
                        )}
                      >
                        {service.title}
                      </span>
                      {isActive ? (
                        <Minus className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      ) : (
                        <Plus className="h-5 w-5 shrink-0 text-subtle" aria-hidden="true" />
                      )}
                    </button>
                    <div
                      id={`brand-panel-${service.key}`}
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

          {/* Painel visual */}
          <div className="order-1 flex flex-col gap-6 lg:order-2">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-graphite p-8 md:p-10">
              <p className="font-display text-sm font-extrabold uppercase tracking-[0.3em] text-primary">
                {t.brands.phrase.top}
              </p>
              <p className="mt-4 font-display text-[clamp(1.8rem,1rem+3vw,3rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]">
                {t.brands.phrase.mid}
                <br />
                <span className="text-primary">{t.brands.phrase.bottom}</span>
              </p>
              <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
                {/* TODO: vídeo institucional em /assets/hero-video.mp4 */}
                <p className="text-sm font-semibold text-muted-foreground">{t.brands.video}</p>
              </div>
            </div>

            <div className="hidden rounded-3xl border border-border bg-surface p-8 lg:block">
              <h3 className="font-display text-xl font-bold text-primary">{current.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{current.text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
