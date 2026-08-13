import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/i18n";
import { ModalProvider } from "@/components/modals/modal-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesMarquee } from "@/components/sections/services-marquee";
import { StatsSection } from "@/components/sections/stats-section";
import { AboutSection } from "@/components/sections/about-section";
import { BrandsSolutionsSection } from "@/components/sections/brands-solutions-section";
import { TeamsSolutionsSection } from "@/components/sections/teams-solutions-section";
import { ClientsMarqueeSection } from "@/components/sections/clients-marquee-section";
import { TalentMediaKitsSection } from "@/components/sections/talent-media-kits-section";
import { CasesSection } from "@/components/sections/cases-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { usePrefersReducedMotion } from "@/hooks/use-motion";

const TITLE = "Gamerbiz | É hora de subir de nível";
const DESCRIPTION =
  "Conectamos marcas, talentos e comunidades através de campanhas, ativações e parcerias dentro do ecossistema gamer.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function HomeContent() {
  const { t } = useI18n();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      if (
        reducedMotion ||
        event.defaultPrevented ||
        event.detail === 0 ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const source = event.target;
      if (!(source instanceof Element)) return;
      const anchor = source.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [reducedMotion]);

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only rounded-full bg-primary px-5 py-3 font-display text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
      >
        {t.a11y.skipToContent}
      </a>
      <Header />
      <main id="conteudo">
        <HeroSection />
        <ServicesMarquee />
        <StatsSection />
        <AboutSection />
        <BrandsSolutionsSection />
        <TeamsSolutionsSection />
        <ClientsMarqueeSection />
        <TalentMediaKitsSection />
        <CasesSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}

function Index() {
  return (
    <I18nProvider>
      <ModalProvider>
        <HomeContent />
        <Toaster />
      </ModalProvider>
    </I18nProvider>
  );
}
