import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useI18n } from "@/i18n";

/** Casca compartilhada das páginas públicas de Media Kit. */
export function MediaKitShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <>
      <a
        href="#mediakit-conteudo"
        className="sr-only rounded-full bg-primary px-5 py-3 font-display text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
      >
        {t.a11y.skipToContent}
      </a>

      <header className="sticky top-0 z-[100] border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container-gbz flex min-h-20 items-center justify-between gap-4 py-3">
          <Link
            to="/"
            aria-label={t.links.backToWebsite}
            className="gbz-interactive group inline-flex min-h-12 items-center gap-3 rounded-full pr-3 font-display text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition-[transform,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:text-primary"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-border transition-[border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] fine-hover:group-hover:border-primary fine-hover:group-hover:text-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </span>
            <Logo className="h-9 w-auto md:h-10" />
            <span className="hidden lg:inline">{t.links.backToWebsite}</span>
          </Link>
          <LanguageSwitcher className="gap-3" />
        </div>
      </header>

      <main id="mediakit-conteudo" className="min-h-[70svh]">
        {children}
      </main>

      <footer className="border-t border-border">
        <div className="container-gbz flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between md:py-16">
          <div>
            <Logo className="h-9 w-auto" />
            <p className="mt-4 font-display text-lg font-bold tracking-[-0.02em] text-foreground">
              {t.links.tagline}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <Link
              to="/"
              className="gbz-interactive font-display text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition-[transform,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:text-primary"
            >
              {t.links.websiteLink}
            </Link>
            <p className="text-xs text-subtle">© Gamerbiz. {t.links.rights}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
