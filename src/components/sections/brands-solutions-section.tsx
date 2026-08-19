import { useState } from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function BrandsSolutionsSection() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const services = t.brands.services;

  return (
    <section id="marcas" className="section-gbz">
      <div className="container-gbz">
        <div>
          <p className="eyebrow-gbz">{t.brands.eyebrow}</p>
          <h2 className="title-gbz mt-4 max-w-[22ch]">{t.brands.title}</h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Lista interativa / accordion */}
          <div className="order-2 lg:order-1">
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
                      aria-controls={`brand-panel-${service.key}`}
                      onClick={() => setActive(index)}
                      className="gbz-interactive group flex w-full items-start justify-between gap-6 px-5 py-6 text-left active:scale-[0.99] md:px-7 md:py-7"
                    >
                      <span
                        className={cn(
                          "font-display text-3xl font-bold leading-none tracking-[-0.035em] transition-colors duration-[160ms] md:text-[2.65rem]",
                          isActive
                            ? "text-primary"
                            : "text-foreground fine-hover:group-hover:text-primary",
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
                      id={`brand-panel-${service.key}`}
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

          {/* Painel visual */}
          <div className="order-1 lg:order-2">
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
          </div>
        </div>
      </div>
    </section>
  );
}
