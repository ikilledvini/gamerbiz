import { ArrowRight, BarChart3, Palette, Search, TrendingUp } from "lucide-react";
import { GbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";

const serviceIcons = [TrendingUp, Search, BarChart3, Palette];

export function TeamsSolutionsSection() {
  const { t } = useI18n();
  const { openBrandModal } = useModals();
  const services = t.teams.services;

  return (
    <section id="times" className="section-gbz bg-surface">
      <div className="container-gbz grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <div className="lg:pt-2">
          <h2 className="max-w-[13ch] font-display text-[clamp(3rem,5vw,5.5rem)] font-normal leading-[0.92] tracking-[-0.045em]">
            {t.teams.titleLead && t.teams.titleBrand && t.teams.titleAccent ? (
              <>
                <span className="block">{t.teams.titleLead}</span>
                <strong className="block font-bold">{t.teams.titleBrand}</strong>
                <span className="block text-primary">{t.teams.titleAccent}</span>
              </>
            ) : (
              t.teams.title
            )}
          </h2>
          <p className="mt-8 max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
            {t.teams.description}
          </p>
          <div className="mt-10">
            <GbzButton variant="outline" onClick={() => openBrandModal(t.teams.subject)}>
              {t.teams.button}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </GbzButton>
          </div>
        </div>

        <ul className="grid gap-px overflow-hidden border border-primary/10 bg-primary/10 sm:grid-cols-2">
          {services.map((service, index) => {
            const Icon = serviceIcons[index] ?? TrendingUp;
            return (
              <li key={service.key} className="flex min-h-64 flex-col bg-surface p-7 md:p-9">
                <span className="flex h-12 w-12 items-center justify-center border border-border text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-base font-bold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.text}</p>
                <span className="mt-auto border-b border-border pt-5" aria-hidden="true" />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
