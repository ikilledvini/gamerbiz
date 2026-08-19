import { Link } from "@tanstack/react-router";
import { Link2, RefreshCw, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n";
import { legalPath } from "@/lib/legal-routes";

const STEP_ICONS = [Link2, RefreshCw, ShieldCheck] as const;

export function MediaKitOAuthExplainer() {
  const { lang, t } = useI18n();
  const content = t.mediakit.oauthExplainer;

  return (
    <section
      id="como-funciona"
      aria-labelledby="mediakit-oauth-title"
      className="relative mt-10 overflow-hidden rounded-[32px] border border-border bg-surface/60 px-5 py-8 md:px-8 md:py-10"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-20 -top-24 h-56 w-56 rotate-12 rounded-[48px] border-[24px] border-primary/[0.06]" />
        <div className="absolute left-1/3 top-0 h-32 w-80 bg-primary/[0.04] blur-[110px]" />
      </div>

      <div className="relative">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 font-display text-[0.625rem] font-bold uppercase tracking-[0.18em] text-primary">
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              {content.eyebrow}
            </p>

            <h2
              id="mediakit-oauth-title"
              className="mt-4 max-w-[20ch] font-display text-[clamp(1.75rem,1.25rem+2vw,3rem)] font-bold leading-[1.02] tracking-[-0.04em]"
            >
              {content.title} <span className="text-primary">{content.titleAccent}</span>
            </h2>
          </div>

          <p className="max-w-[66ch] text-sm leading-relaxed text-muted-foreground md:text-base">
            {content.description}
          </p>
        </div>

        <ol className="mt-8 grid gap-3 md:grid-cols-3">
          {content.steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? ShieldCheck;

            return (
              <li
                key={step.title}
                className="rounded-2xl border border-border/80 bg-background/50 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span
                    className="font-display text-[0.625rem] font-bold tracking-[0.16em] text-subtle"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-col gap-4 border-t border-border/70 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[70ch] text-xs leading-relaxed text-subtle">{content.note}</p>
          <nav
            aria-label={content.legalLabel}
            className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2"
          >
            <Link
              to={legalPath("privacy", lang)}
              className="gbz-interactive font-display text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-[transform,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:text-primary"
            >
              {content.privacy}
            </Link>
            <Link
              to={legalPath("tos", lang)}
              className="gbz-interactive font-display text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-[transform,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:text-primary"
            >
              {content.terms}
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
