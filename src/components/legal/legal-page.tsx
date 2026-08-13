import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ModalProvider } from "@/components/modals/modal-provider";
import { Toaster } from "@/components/ui/sonner";
import { LEGAL_CONTENT, type LegalDocument } from "@/data/legal-content";
import { I18nProvider, useI18n, type LangCode } from "@/i18n";
import { legalPath, type LegalRouteKind } from "@/lib/legal-routes";

export type LegalDocumentKind = "privacy" | "terms";

function LegalContent({ kind }: { kind: LegalDocumentKind }) {
  const { lang, t } = useI18n();
  const legal = LEGAL_CONTENT[lang];
  const document: LegalDocument = legal[kind];
  const privacyHref = legalPath("privacy", lang);
  const termsHref = legalPath("tos", lang);

  return (
    <>
      <a
        href="#legal-content"
        className="sr-only rounded-full bg-primary px-5 py-3 font-display text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
      >
        {t.a11y.skipToContent}
      </a>
      <Header homeHrefPrefix="/" />
      <main id="legal-content" className="min-h-screen pb-24 pt-32 md:pt-40">
        <div className="container-gbz">
          <nav
            aria-label={legal.navigationLabel}
            className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-surface/80 p-1.5 sm:w-fit"
          >
            <a
              href={privacyHref}
              aria-current={kind === "privacy" ? "page" : undefined}
              className={`gbz-interactive rounded-full px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-[160ms] ${
                kind === "privacy"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground fine-hover:hover:text-foreground"
              }`}
            >
              {legal.privacyLabel}
            </a>
            <a
              href={termsHref}
              aria-current={kind === "terms" ? "page" : undefined}
              className={`gbz-interactive rounded-full px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-[160ms] ${
                kind === "terms"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground fine-hover:hover:text-foreground"
              }`}
            >
              {legal.termsLabel}
            </a>
          </nav>

          <header className="mt-10 max-w-4xl">
            <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
              {document.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-5xl font-extrabold tracking-[-0.05em] text-foreground sm:text-6xl lg:text-7xl">
              {document.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {document.description}
            </p>
            <p className="mt-5 font-display text-xs font-bold uppercase tracking-[0.14em] text-subtle">
              {document.effectiveDateLabel}: {document.effectiveDate}
            </p>
          </header>

          <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
            <article className="rounded-[32px] border border-border bg-surface p-6 sm:p-9 lg:p-12">
              <div className="space-y-11">
                {document.sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-foreground md:text-3xl">
                      {section.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-base leading-8 text-muted-foreground">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {section.items ? (
                        <ul className="space-y-3 pl-1">
                          {section.items.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span
                                className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>
            </article>

            <aside className="rounded-[28px] border border-border bg-surface p-6 lg:sticky lg:top-28">
              <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-subtle">
                {legal.navigationLabel}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <a
                  href={privacyHref}
                  className="text-sm font-semibold text-muted-foreground fine-hover:hover:text-primary"
                >
                  {legal.privacyLabel}
                </a>
                <a
                  href={termsHref}
                  className="text-sm font-semibold text-muted-foreground fine-hover:hover:text-primary"
                >
                  {legal.termsLabel}
                </a>
                <a
                  href="/"
                  className="mt-3 inline-flex items-center gap-2 border-t border-border pt-5 text-sm font-bold text-foreground fine-hover:hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {legal.backHome}
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer homeHrefPrefix="/" />
    </>
  );
}

export function LegalPage({
  kind,
  initialLang,
  routeKind = kind === "privacy" ? "privacy" : "tos",
}: {
  kind: LegalDocumentKind;
  initialLang?: LangCode;
  routeKind?: LegalRouteKind;
}) {
  const handleLanguageChange = (lang: LangCode) => {
    window.history.replaceState(null, "", legalPath(routeKind, lang));
  };

  return (
    <I18nProvider initialLang={initialLang} onLangChange={handleLanguageChange}>
      <ModalProvider>
        <LegalContent kind={kind} />
        <Toaster />
      </ModalProvider>
    </I18nProvider>
  );
}
