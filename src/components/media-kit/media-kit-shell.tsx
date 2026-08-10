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

      <header className="border-b border-border">
        <div className="container-gbz flex items-center justify-between gap-4 py-5">
          <Link to="/" aria-label={t.links.backToWebsite} className="flex items-center gap-3">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Logo className="h-8" />
          </Link>
          <LanguageSwitcher className="gap-3" />
        </div>
      </header>

      <main id="mediakit-conteudo" className="min-h-[70vh]">
        {children}
      </main>

      <footer className="container-gbz mt-16 flex flex-col items-center gap-3 border-t border-border py-10 text-center">
        <Logo className="h-7" />
        <p className="text-xs text-subtle">© Gamerbiz. {t.links.rights}</p>
        <Link
          to="/"
          className="font-display text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-200 hover:text-primary"
        >
          {t.links.websiteLink}
        </Link>
      </footer>
    </>
  );
}
