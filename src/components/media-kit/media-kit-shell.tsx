import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { ModalProvider } from "@/components/modals/modal-provider";
import { Logo } from "@/components/ui/logo";
import { useI18n } from "@/i18n";

/** Casca compartilhada das páginas públicas de Media Kit. */
export function MediaKitShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <ModalProvider>
      <a
        href="#mediakit-conteudo"
        className="sr-only rounded-full bg-primary px-5 py-3 font-display text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
      >
        {t.a11y.skipToContent}
      </a>

      <Header homeHrefPrefix="/" />

      <main id="mediakit-conteudo" className="min-h-[70svh] pt-20 md:pt-0">
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
    </ModalProvider>
  );
}
