import { Link } from "@tanstack/react-router";
import { TalentCarousel } from "@/components/ui/talent-carousel";
import { useI18n } from "@/i18n";

export function TalentMediaKitsSection() {
  const { t } = useI18n();

  return (
    <section id="talentos" className="section-gbz bg-surface">
      <div className="container-gbz">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow-gbz">{t.talents.eyebrow}</p>
            <h2 className="title-gbz mt-4 max-w-[16ch]">{t.talents.title}</h2>
            <Link
              to="/mediakit"
              className="mt-6 inline-flex rounded-full border border-border px-7 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
            >
              {t.mediakit.ctaHome}
            </Link>
          </div>
          <div>
            <p className="max-w-[48ch] text-lg leading-relaxed text-muted-foreground">
              {t.talents.description}
            </p>
          </div>
        </div>

        <TalentCarousel />
      </div>
    </section>
  );
}
