import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { GbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";
import aboutVideo from "@/assets/gamerbiz-hero.mp4.asset.json";
import aboutPoster from "@/assets/gamerbiz-hero-poster.jpg.asset.json";

export function AboutSection() {
  const { t } = useI18n();
  const { openBrandModal } = useModals();
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section id="sobre" className="section-gbz bg-surface">
      <div className="container-gbz">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow-gbz">{t.nav.about}</p>
            <h2 className="title-gbz mt-4 max-w-[16ch] uppercase">{t.about.title}</h2>
            <p className="mt-6 max-w-[58ch] text-base text-muted-foreground md:text-lg">
              {t.about.text}
            </p>
            <div className="mt-8">
              <GbzButton onClick={() => openBrandModal()}>{t.about.button}</GbzButton>
            </div>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-3xl border border-border bg-graphite">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              poster={aboutPoster.url}
              src={aboutVideo.url}
              aria-label={t.about.mediaPlaceholder}
            />
            <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className="gbz-interactive absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-sm transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.96] fine-hover:hover:border-primary fine-hover:hover:text-primary"
              aria-label={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {t.about.pillars.map((pillar) => (
            <article
              key={pillar.key}
              className="motion-lift-gbz rounded-3xl border border-border bg-background p-8 transition-[transform,border-color] duration-[180ms] ease-[var(--ease-out-gbz)] fine-hover:hover:-translate-y-1 fine-hover:hover:border-primary/60"
            >
              <h3 className="font-display text-xl font-bold">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pillar.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
