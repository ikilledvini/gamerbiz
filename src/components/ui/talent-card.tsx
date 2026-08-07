import { Info, User } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { Talent } from "@/data/talents";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function TalentCard({
  talent,
  onMediaKit,
}: {
  talent: Talent;
  onMediaKit: (talent: Talent) => void;
}) {
  const { t } = useI18n();
  const badge =
    talent.relationship === "gamerbiz-talent"
      ? { label: t.talents.badgeTalent, tip: t.talents.tooltipTalent, tone: "bg-primary" }
      : talent.relationship === "creator-parceiro"
        ? { label: t.talents.badgePartner, tip: t.talents.tooltipPartner, tone: "bg-primary-dark" }
        : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[40px] border border-border bg-surface transition-transform duration-200 ease-out hover:-translate-y-1">
      <div className="relative aspect-[9/16] w-full bg-graphite">
        {badge ? (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                aria-label={`${badge.label} — ${t.a11y.info}`}
                  className={cn(
                    "absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.12em] text-primary-foreground",
                    badge.tone,
                  )}
              >
                {badge.label}
                <Info className="h-3 w-3" aria-hidden="true" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="bottom"
                className="z-[120] max-w-[240px] rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground shadow-card"
              >
                {badge.tip}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ) : null}

        {talent.image ? (
          <img
            src={talent.image}
            alt={talent.stageName}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3 text-subtle"
            aria-hidden="true"
          >
            <User className="h-12 w-12" />
            <span className="font-display text-[0.65rem] font-bold uppercase tracking-[0.18em]">
              {t.talents.photoPlaceholder}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/70 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center p-5 pb-6 text-center">
          {talent.firstName ? (
            <p className="font-display text-xs font-bold text-white/80">{talent.firstName}</p>
          ) : null}
          <h3 className="font-display text-xl font-extrabold tracking-tight text-white">
            {talent.stageName}
          </h3>
          <p className="mt-1 font-display text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/60">
            {talent.category}
          </p>

          <button
            type="button"
            onClick={() => onMediaKit(talent)}
            className="mt-5 flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-colors duration-200 hover:bg-primary-dark"
          >
            {t.talents.card}
          </button>
        </div>
      </div>
    </article>
  );
}
