import { Link } from "@tanstack/react-router";
import { TalentCarousel } from "@/components/ui/talent-carousel";
import { useI18n } from "@/i18n";

export function TalentMediaKitsSection() {
  const { t } = useI18n();

  return (
    <section id="talentos" className="section-gbz bg-surface">
      <div className="container-gbz">
        <div>
          <div>
            <p className="eyebrow-gbz">{t.talents.eyebrow}</p>
            <h2 className="title-gbz mt-4 max-w-[16ch]">
              <span className="block font-medium">{t.talents.title}</span>
              <span className="block font-extrabold text-primary">{t.talents.titleAccent}</span>
            </h2>
            <Link
              to="/mediakit"
              search={{ q: "", cat: "", page: 1 }}
              className="gbz-interactive mt-6 inline-flex rounded-full border border-border px-7 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:border-primary fine-hover:hover:text-primary"
            >
              {t.mediakit.ctaHome}
            </Link>
          </div>
        </div>

        <TalentCarousel />
      </div>
    </section>
  );
}
