import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import { cases, type CaseStudy } from "@/data/cases";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

function CaseCard({
  item,
  featured,
  onOpen,
}: {
  item: CaseStudy;
  featured: boolean;
  onOpen: (item: CaseStudy) => void;
}) {
  const { t } = useI18n();
  const content = t.cases.items[item.id]!;

  return (
    <article
      className={cn(
        "flex flex-col justify-between rounded-3xl border border-border bg-surface p-8 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/70",
        featured && "lg:p-10",
      )}
    >
      <div>
        <ul className="flex flex-wrap gap-2">
          {content.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
        <h3
          className={cn(
            "mt-6 font-display font-extrabold tracking-tight",
            featured ? "text-[clamp(1.8rem,1.2rem+2vw,3rem)]" : "text-2xl",
          )}
        >
          {content.title}
        </h3>
        <p className="mt-5 font-display text-[clamp(2rem,1.4rem+2vw,3.4rem)] font-extrabold leading-none text-primary">
          {item.resultValue}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{content.resultLabel}</p>
      </div>

      <button
        type="button"
        onClick={() => onOpen(item)}
        className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-border px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
      >
        {t.cases.action}
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}

export function CasesSection() {
  const { t } = useI18n();
  const [openCase, setOpenCase] = useState<CaseStudy | null>(null);
  const featured = cases.find((item) => item.featured)!;
  const others = cases.filter((item) => !item.featured);
  const detail = openCase ? t.cases.items[openCase.id] : null;

  return (
    <section id="cases" className="section-gbz">
      <div className="container-gbz">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow-gbz">{t.cases.eyebrow}</p>
            <h2 className="title-gbz mt-4 max-w-[14ch]">{t.cases.title}</h2>
          </div>
          <p className="max-w-[52ch] text-base text-muted-foreground">{t.cases.description}</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <CaseCard item={featured} featured onOpen={setOpenCase} />
          <div className="grid gap-6">
            {others.map((item) => (
              <CaseCard key={item.id} item={item} featured={false} onOpen={setOpenCase} />
            ))}
          </div>
        </div>
      </div>

      <Dialog.Root open={Boolean(openCase)} onOpenChange={(open) => !open && setOpenCase(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] max-h-[90dvh] w-[calc(100vw-24px)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border bg-surface p-8 shadow-glow md:p-10">
            <Dialog.Close
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
              aria-label={t.actions.close}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
            <p className="eyebrow-gbz">{t.cases.eyebrow}</p>
            <Dialog.Title className="mt-3 font-display text-3xl font-extrabold">
              {detail?.title}
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm text-muted-foreground">
              {t.cases.description}
            </Dialog.Description>
            <ul className="mt-6 flex flex-wrap gap-2">
              {detail?.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-primary/40 bg-primary/10 p-6">
              <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {t.cases.result}
              </p>
              <p className="mt-2 font-display text-4xl font-extrabold text-primary">
                {openCase?.resultValue}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{detail?.resultLabel}</p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
