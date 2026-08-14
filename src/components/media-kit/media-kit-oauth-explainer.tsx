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
      className="relative mt-14 overflow-hidden rounded-[40px] border border-primary/30 bg-surface px-6 py-12 md:px-10 md:py-16 lg:px-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-20 -top-24 h-64 w-64 rotate-12 rounded-[48px] border-[28px] border-primary/15" />
        <div className="absolute -bottom-24 -left-20 h-56 w-56 -rotate-12 rounded-[48px] border-[24px] border-primary/10" />
        <div className="absolute left-1/2 top-0 h-52 w-[38rem] -translate-x-1/2 bg-primary/10 blur-[150px]" />
      </div>

      <div className="relative">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 font-display text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary">
            <Link2 className="h-4 w-4" aria-hidden="true" />
            {content.eyebrow}
          </p>

          <h2
            id="mediakit-oauth-title"
            className="mt-7 max-w-[18ch] font-display text-[clamp(2.25rem,1.3rem+4vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.045em]"
          >
            <span className="block">{content.title}</span>
            <span className="block text-primary">{content.titleAccent}</span>
          </h2>

          <p className="mt-7 max-w-[66ch] text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.description}
          </p>
        </div>

        <ol className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
          {content.steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? ShieldCheck;

            return (
              <li
                key={step.title}
                className="rounded-[28px] border border-border bg-background/75 p-6 backdrop-blur-sm md:p-7"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span
                    className="font-display text-xs font-bold tracking-[0.18em] text-subtle"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            );
          })}
        </ol>

        <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center text-center">
          <p className="max-w-[60ch] text-sm leading-relaxed text-subtle">{content.note}</p>
          <nav
            aria-label={content.legalLabel}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            <Link
              to={legalPath("privacy", lang)}
              className="gbz-interactive font-display text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground transition-[transform,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:text-primary"
            >
              {content.privacy}
            </Link>
            <Link
              to={legalPath("tos", lang)}
              className="gbz-interactive font-display text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground transition-[transform,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:text-primary"
            >
              {content.terms}
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
