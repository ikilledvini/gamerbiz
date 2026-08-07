import { LogoMarquee } from "@/components/ui/logo-marquee";
import { brandLogos, teamLogos } from "@/data/clients";
import { useI18n } from "@/i18n";

export function ClientsMarqueeSection() {
  const { t } = useI18n();

  return (
    <section id="clientes" className="section-gbz">
      <div className="container-gbz">
        <p className="eyebrow-gbz">{t.clients.eyebrow}</p>
        <h2 className="title-gbz mt-4 max-w-[20ch]">{t.clients.title}</h2>
      </div>

      <div className="mt-14 space-y-12">
        <div>
          <p className="container-gbz font-display text-xs font-bold uppercase tracking-[0.28em] text-subtle">
            /// {t.clients.groupBrands}
          </p>
          <div className="mt-6">
            <LogoMarquee
              items={brandLogos}
              label={t.clients.groupBrands}
            />
          </div>
        </div>

        <div>
          <p className="container-gbz font-display text-xs font-bold uppercase tracking-[0.28em] text-subtle">
            /// {t.clients.groupTeams}
          </p>
          <div className="mt-6">
            <LogoMarquee
              items={teamLogos}
              label={t.clients.groupTeams}
              reverse
            />
          </div>
        </div>
      </div>
    </section>
  );
}
