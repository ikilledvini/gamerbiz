import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function PortalShell({
  eyebrow,
  title,
  description,
  userLabel,
  onSignOut,
  workspace = false,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  userLabel?: string | null | undefined;
  onSignOut: () => void;
  workspace?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="container-gbz flex min-h-20 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/"
              className="gbz-interactive flex shrink-0 items-center"
              aria-label="Ir para a página inicial da Gamerbiz"
            >
              <Logo className="h-8" />
            </Link>
            <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
            <p className="truncate font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-subtle">
              {eyebrow}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="gbz-interactive hidden min-h-10 items-center gap-2 rounded-full border border-border px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary sm:inline-flex"
            >
              Ver site
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="gbz-interactive inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className={`container-gbz ${workspace ? "py-5 md:py-6" : "py-8 md:py-12"}`}>
        {!workspace ? (
          <div className="max-w-4xl">
            <p className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-primary">
              {userLabel || eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-foreground md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-[66ch] text-sm leading-relaxed text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
        ) : null}

        <div className={workspace ? "" : "mt-8"}>{children}</div>
      </div>
    </main>
  );
}
