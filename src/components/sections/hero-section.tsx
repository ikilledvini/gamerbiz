import { ChevronDown, Play } from "lucide-react";
import { GbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";

export function HeroSection() {
  const { t } = useI18n();
  const { openBrandModal } = useModals();

  return (
    <section
      id="inicio"
      className="relative flex min-h-[92vh] items-center overflow-hidden pb-16 pt-[112px]"
    >
      {/* Fundo: vídeo institucional. TODO: adicionar public/assets/hero-video.mp4 e hero-poster.webp */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-surface" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(oklch(1_0_0/0.4)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/0.4)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[160px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
      </div>

      <div className="container-gbz relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-rise">
          <p className="eyebrow-gbz max-w-[40ch] leading-relaxed">{t.hero.eyebrow}</p>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,1.2rem+5.6vw,5.4rem)] font-extrabold uppercase leading-[0.94] tracking-[-0.04em]">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-[52ch] text-base text-muted-foreground md:text-lg">
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

        <div className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border bg-graphite sm:aspect-video lg:aspect-[4/5]">
            {/*
              Quando o arquivo hero-video.mp4 for anexado, basta descomentar o vídeo abaixo:
              <video className="h-full w-full object-cover" autoPlay muted loop playsInline
                poster="/assets/hero-poster.webp" src="/assets/hero-video.mp4" />
            */}
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/60 bg-primary/10">
                <Play className="h-6 w-6 text-primary" aria-hidden="true" />
              </span>
              <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {t.hero.videoPlaceholder}
              </p>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden="true" />
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
