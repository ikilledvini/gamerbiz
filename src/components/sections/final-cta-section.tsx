import { GbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";

export function FinalCtaSection() {
  const { t } = useI18n();
  const { openBrandModal } = useModals();

  return (
    <section id="contato" className="relative overflow-hidden border-y border-border bg-surface py-28 md:py-36">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[170px]" />
      </div>
      <div className="container-gbz relative flex flex-col items-center text-center">
        <p className="eyebrow-gbz">{t.finalCta.eyebrow}</p>
        <h2 className="mt-5 max-w-[20ch] font-display text-[clamp(2.2rem,1.2rem+4.4vw,4.6rem)] font-extrabold uppercase leading-[0.96] tracking-[-0.04em] whitespace-pre-line">
          {t.finalCta.title}
        </h2>
        <div className="mt-10">
          <GbzButton size="lg" onClick={() => openBrandModal()}>
            {t.finalCta.button}
          </GbzButton>
        </div>
      </div>
    </section>
  );
}
