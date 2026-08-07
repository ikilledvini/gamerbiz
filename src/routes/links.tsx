import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/i18n";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { TalentCarousel } from "@/components/ui/talent-carousel";
import { LinksProfile } from "@/components/links/links-profile";
import { PrimaryLinks } from "@/components/links/primary-links";
import { SocialLinks } from "@/components/links/social-links";
import { ShareButton } from "@/components/links/share-button";

const TITLE = "Gamerbiz — Links e Talentos";
const DESCRIPTION =
  "Acesse os canais oficiais da Gamerbiz e conheça nossos talentos e Media Kits.";
const URL = "https://idea-to-site-muse.lovable.app/links";

export const Route = createFileRoute("/links")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: LinksRoute,
});

function LinksContent() {
  const { t } = useI18n();

  return (
    <>
      <a
        href="#links-conteudo"
        className="sr-only rounded-full bg-primary px-5 py-3 font-display text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
      >
        {t.a11y.skipToContent}
      </a>

      <main
        id="links-conteudo"
        className="min-h-[100dvh] overflow-x-hidden bg-links"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)",
        }}
      >
        <section className="mx-auto w-full max-w-[720px] px-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <Link
              to="/"
              aria-label={t.links.backToWebsite}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-links text-foreground duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground active:scale-[0.96] hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>

            <div className="flex items-center gap-4">
              <LanguageSwitcher className="gap-3" />
              <ShareButton />
            </div>
          </div>

          <div className="mt-8">
            <LinksProfile />
            <PrimaryLinks />
            <SocialLinks />
          </div>
        </section>

        <section
          id="talentos"
          aria-labelledby="talentos-heading"
          className="section-gbz bg-links"
        >
          <div className="container-gbz">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="eyebrow-gbz">{t.talents.eyebrow}</p>
                <h2
                  id="talentos-heading"
                  className="title-gbz mt-4 max-w-[16ch] scroll-mt-24"
                >
                  {t.talents.title}
                </h2>
                <a
                  href="#talentos"
                  className="mt-6 inline-flex rounded-full border border-border px-7 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
                >
                  {t.talents.allButton}
                </a>
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

        <footer className="container-gbz mt-16 flex flex-col items-center gap-3 border-t border-border pt-10 text-center">
          <Logo className="h-7" />
          <p className="text-xs text-subtle">© Gamerbiz. {t.links.rights}</p>
          <Link
            to="/"
            className="font-display text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            {t.links.websiteLink}
          </Link>
        </footer>
      </main>
    </>
  );
}

function LinksRoute() {
  return (
    <I18nProvider>
      <LinksContent />
      <Toaster />
    </I18nProvider>
  );
}
