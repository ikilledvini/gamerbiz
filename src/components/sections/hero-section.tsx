import { ChevronDown } from "lucide-react";
import { GbzButton, gbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";
import heroBg from "@/assets/hero-arena.jpg.asset.json";

export function HeroSection() {
  const { t } = useI18n();
  const { openBrandModal } = useModals();

  return (
    <section
      id="inicio"
      className="relative flex min-h-[92vh] items-center overflow-hidden pb-28 pt-[132px]"
    >
      <div className="absolute inset-0 z-0 [clip-path:inset(0)]" aria-hidden="true">
        <div className="absolute inset-0 bg-surface" />
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg.url})` }}
        />
        <div className="fixed inset-0 bg-background/60" />
        <div className="fixed inset-0 bg-gradient-to-r from-background/70 via-background/45 to-background/25" />
        <div className="absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <div className="container-gbz relative z-10 flex flex-col gap-12">
        <div className="animate-rise">
          <p className="eyebrow-gbz max-w-[40ch] leading-relaxed whitespace-pre-line">{t.hero.eyebrow}</p>
          <h1 className="mt-6 max-w-[14ch] font-display text-[clamp(3.2rem,1.4rem+8vw,8.5rem)] uppercase leading-[0.86] tracking-[-0.05em]">
            <span className="block font-medium">{t.hero.title}</span>
            <span className="block font-extrabold text-primary">{t.hero.titleAccent}</span>
          </h1>
          <p className="mt-8 max-w-[52ch] text-base text-muted-foreground md:text-lg">
            {t.hero.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <GbzButton size="lg" onClick={() => openBrandModal()}>
              {t.hero.ctaPrimary}
            </GbzButton>
            <a href="#talentos" className={gbzButton({ variant: "outline", size: "lg" })}>
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </div>

      <a
        href="#numeros"
        className="container-gbz absolute inset-x-0 bottom-6 z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-subtle transition-colors duration-[160ms] fine-hover:hover:text-primary"
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
        {t.hero.scroll}
      </a>
    </section>
  );
}
