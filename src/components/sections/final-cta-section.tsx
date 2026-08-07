import { GbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";
import ctaBg from "@/assets/cta-arena.jpg.asset.json";

export function FinalCtaSection() {
  const { t } = useI18n();
  const { openBrandModal } = useModals();

  return (
    <section className="relative overflow-hidden border-y border-border bg-surface py-32 md:py-44">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={ctaBg.url}
          alt=""
          className="h-full w-full scale-110 object-cover opacity-45 blur-[14px]"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[170px]" />
      </div>
      <div className="container-gbz relative flex flex-col items-center text-center">
        <p className="eyebrow-gbz">{t.finalCta.eyebrow}</p>
        <h2 className="mt-6 max-w-[16ch] font-display text-[clamp(3rem,1.4rem+7.6vw,8rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.05em]">
          {t.finalCta.title}
        </h2>
        <div className="mt-12">
          <GbzButton size="lg" onClick={() => openBrandModal()}>
            {t.finalCta.button}
          </GbzButton>
        </div>
      </div>
    </section>
  );
}
