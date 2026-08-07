import { ChevronDown } from "lucide-react";
import { GbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";
import heroBg from "@/assets/hero-arena.jpg.asset.json";

export function HeroSection() {
  const { t } = useI18n();
  const { openBrandModal } = useModals();

  return (
    <section
      id="inicio"
      className="relative flex min-h-[88vh] items-center overflow-hidden pb-20 pt-[132px]"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-surface" />
        <img
          src={heroBg.url}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-[14px]"
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[160px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
      </div>

      <div className="container-gbz relative flex flex-col gap-12">
        <div className="animate-rise">
          <p className="eyebrow-gbz max-w-[40ch] leading-relaxed">{t.hero.eyebrow}</p>
          <h1 className="mt-6 max-w-[14ch] font-display text-[clamp(3.2rem,1.4rem+8vw,8.5rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.05em]">
            {t.hero.title}
          </h1>
          <p className="mt-8 max-w-[52ch] text-base text-muted-foreground md:text-lg">
            {t.hero.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <GbzButton size="lg" onClick={() => openBrandModal()}>
              {t.hero.ctaPrimary}
            </GbzButton>
            <a href="#talentos" className="contents">
              <GbzButton variant="outline" size="lg" type="button">
                {t.hero.ctaSecondary}
              </GbzButton>
            </a>
          </div>
        </div>
      </div>

      <a
        href="#numeros"
        className="container-gbz absolute inset-x-0 bottom-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-subtle transition-colors duration-200 hover:text-primary"
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
        {t.hero.scroll}
      </a>
    </section>
  );
}
