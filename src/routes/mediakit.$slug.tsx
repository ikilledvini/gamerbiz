import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaInstagram, FaYoutube, FaTiktok, FaTwitch, FaXTwitter } from "react-icons/fa6";
import { Gamepad2, Info, Mail, MapPin, Share2, User } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/i18n";
import { MediaKitShell } from "@/components/media-kit/media-kit-shell";
import { MediaKitSectionHeading } from "@/components/media-kit/media-kit-section-heading";
import { MediaKitAnalytics } from "@/components/media-kit/analytics-panel";
import { type Talent } from "@/data/talents";
import { listPublicTalents } from "@/lib/talents.functions";

const SITE = "https://idea-to-site-muse.lovable.app";
const DEFAULT_CONTACT_EMAIL = "contato@gamerbiz.com.br";

export const Route = createFileRoute("/mediakit/$slug")({
  loader: async ({ params }) => {
    const talents = await listPublicTalents();
    const talent = talents.find((item) => item.slug === params.slug);
    if (!talent) throw notFound();
    return { talent };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Media Kit — Gamerbiz" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.talent.stageName} — Media Kit | Gamerbiz`;
    const description = `${loaderData.talent.stageName} · ${loaderData.talent.category}. Media Kit oficial na plataforma de talentos da Gamerbiz.`;
    const url = `${SITE}/mediakit/${params.slug}`;
    const image = loaderData.talent.image ?? undefined;
    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: loaderData.talent.stageName,
              alternateName: loaderData.talent.username ?? undefined,
              description,
              image: loaderData.talent.image ?? undefined,
              url,
              knowsAbout: loaderData.talent.categories,
              sameAs: [
                loaderData.talent.socials.instagram,
                loaderData.talent.socials.tiktok,
                loaderData.talent.socials.youtube,
                loaderData.talent.socials.twitch,
                loaderData.talent.socials.twitter,
              ].filter(Boolean),
            },
          }),
        },
      ],
    };
  },
  component: TalentMediaKitRoute,
  errorComponent: MediaKitFallback,
  notFoundComponent: MediaKitFallback,
});

function MediaKitFallback() {
  return (
    <I18nProvider>
      <MediaKitShell>
        <FallbackContent />
      </MediaKitShell>
    </I18nProvider>
  );
}

function FallbackContent() {
  const { t } = useI18n();
  return (
    <section className="section-gbz">
      <div className="container-gbz">
        <h1 className="title-gbz">{t.mediakit.notFoundTitle}</h1>
        <p className="mt-4 text-muted-foreground">{t.mediakit.notFoundText}</p>
        <Link
          to="/mediakit"
          search={{ q: "", cat: "", page: 1 }}
          className="gbz-interactive mt-8 inline-flex min-h-12 items-center rounded-full border border-primary px-7 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary transition-[transform,background-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:bg-primary fine-hover:hover:text-primary-foreground"
        >
          {t.mediakit.backToDirectory}
        </Link>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b border-border/70 pb-4 last:border-0 last:pb-0">
      <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-foreground">
        <span className="shrink-0 text-muted-foreground">{icon}</span>
        <span>{label}</span>
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-right text-sm text-muted-foreground transition-colors duration-[160ms] ease-[var(--ease-out-gbz)] fine-hover:hover:text-primary"
        >
          {value}
        </a>
      ) : (
        <span className="break-words text-right text-sm text-muted-foreground">{value}</span>
      )}
    </li>
  );
}

function MetricCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: { label: string; value: string | null }[];
}) {
  return (
    <article className="rounded-[32px] border border-border bg-surface p-6 md:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
          {icon}
        </span>
        <p className="truncate font-display text-sm font-bold uppercase tracking-[0.08em] text-foreground">
          {title}
        </p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle">
              {item.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-foreground md:text-3xl">
              {item.value ?? "—"}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function MediaKitContent({ talent }: { talent: Talent }) {
  const { t } = useI18n();

  const badge =
    talent.relationship === "gamerbiz-talent"
      ? { label: t.talents.badgeTalent, tip: t.talents.tooltipTalent }
      : talent.relationship === "creator-parceiro"
        ? { label: t.talents.badgePartner, tip: t.talents.tooltipPartner }
        : null;

  const contactEmail = talent.contactEmail || DEFAULT_CONTACT_EMAIL;
  const mailtoSubject = `${t.mediakit.contactSubject} ${talent.stageName}`;

  const socialRows = (
    [
      {
        key: "instagram",
        url: talent.socials.instagram,
        label: t.mediakit.platforms.instagram,
        icon: <FaInstagram className="h-4 w-4 text-white" />,
      },
      {
        key: "youtube",
        url: talent.socials.youtube,
        label: t.mediakit.platforms.youtube,
        icon: <FaYoutube className="h-4 w-4 text-white" />,
      },
      {
        key: "tiktok",
        url: talent.socials.tiktok,
        label: t.mediakit.platforms.tiktok,
        icon: <FaTiktok className="h-4 w-4 text-white" />,
      },
      {
        key: "twitch",
        url: talent.socials.twitch,
        label: t.mediakit.platforms.twitch,
        icon: <FaTwitch className="h-4 w-4 text-white" />,
      },
      {
        key: "twitter",
        url: talent.socials.twitter,
        label: t.mediakit.platforms.twitter,
        icon: <FaXTwitter className="h-4 w-4 text-white" />,
      },
    ] as { key: string; url: string | null; label: string; icon: React.ReactNode }[]
  ).filter((item) => item.url);

  function handleLabel(url: string) {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.replace(/\/+$/, "").split("/").filter(Boolean).pop();
      return path ? `@${path.replace(/^@/, "")}` : parsed.hostname;
    } catch {
      return url;
    }
  }

  const metricCards = [
    {
      key: "instagram",
      title: t.mediakit.platforms.instagram,
      icon: <FaInstagram className="h-5 w-5 text-white" />,
      active: Boolean(talent.socials.instagram),
      items: [
        { label: t.mediakit.followers, value: talent.stats.followers },
        { label: t.mediakit.engagement, value: talent.stats.engagement },
      ],
    },
    {
      key: "youtube",
      title: t.mediakit.platforms.youtube,
      icon: <FaYoutube className="h-5 w-5 text-white" />,
      active: Boolean(talent.socials.youtube),
      items: [
        { label: t.mediakit.avgViews, value: talent.stats.avgViews },
        { label: t.mediakit.audience, value: talent.stats.audience },
      ],
    },
    {
      key: "tiktok",
      title: t.mediakit.platforms.tiktok,
      icon: <FaTiktok className="h-5 w-5 text-white" />,
      active: Boolean(talent.socials.tiktok),
      items: [
        { label: t.mediakit.followers, value: talent.stats.followers },
        { label: t.mediakit.avgViews, value: talent.stats.avgViews },
      ],
    },
  ].filter((card) => card.active);

  async function share() {
    const url = `${window.location.origin}/mediakit/${talent.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${talent.stageName} — Media Kit`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast(t.links.linkCopied);
    } catch {
      toast(t.links.copyError);
    }
  }

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={500}>
      <section className="section-gbz">
        <div className="container-gbz">
          <nav
            aria-label="breadcrumb"
            className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-subtle"
          >
            <Link
              to="/"
              className="transition-colors duration-[160ms] ease-[var(--ease-out-gbz)] fine-hover:hover:text-primary"
            >
              {t.mediakit.breadcrumbHome}
            </Link>
            <span aria-hidden="true"> / </span>
            <Link
              to="/mediakit"
              search={{ q: "", cat: "", page: 1 }}
              className="transition-colors duration-[160ms] ease-[var(--ease-out-gbz)] fine-hover:hover:text-primary"
            >
              {t.mediakit.breadcrumbCurrent}
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{talent.stageName}</span>
          </nav>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:items-stretch">
            <article className="overflow-hidden rounded-[40px] border border-border bg-surface p-6 md:p-10">
              <div className="grid items-center gap-8 md:grid-cols-[minmax(180px,260px)_minmax(0,1fr)]">
                <div className="mx-auto aspect-[4/5] w-full max-w-[260px] overflow-hidden rounded-[32px] border border-border bg-muted">
                  {talent.image ? (
                    <img
                      src={talent.image}
                      alt={talent.stageName}
                      className="h-full w-full object-contain object-bottom"
                    />
                  ) : (
                    <div
                      className="grid h-full w-full place-items-center text-subtle"
                      aria-hidden="true"
                    >
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="eyebrow-gbz">{t.mediakit.eyebrow}</p>
                  <h1 className="title-gbz mt-4 break-words text-foreground">{talent.stageName}</h1>
                  {talent.username ? (
                    <p className="mt-3 text-base text-muted-foreground md:text-lg">
                      @{talent.username}
                    </p>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground md:text-base">
                    <p className="flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{talent.category}</span>
                    </p>
                    {talent.city ? (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>{talent.city}</span>
                      </p>
                    ) : null}
                  </div>

                  {badge ? (
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="button"
                          aria-label={`${badge.label} — ${t.a11y.info}`}
                          className="gbz-interactive mt-7 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-transform duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97]"
                        >
                          {badge.label}
                          <Info className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="bottom"
                          className="z-[120] max-w-[260px] origin-[var(--radix-tooltip-content-transform-origin)] rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground shadow-card data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=delayed-open]:duration-[140ms]"
                        >
                          {badge.tip}
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  ) : null}
                </div>
              </div>
            </article>

            <aside className="rounded-[40px] border border-border bg-surface p-6 md:p-8">
              <MediaKitSectionHeading eyebrow={t.mediakit.eyebrow} title={t.mediakit.socials} />
              <ul className="mt-8 flex flex-col gap-4">
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label={t.mediakit.contact}
                  value={contactEmail}
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent(mailtoSubject)}`}
                />
                {socialRows.map((item) => (
                  <InfoRow
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    value={handleLabel(item.url!)}
                    href={item.url!}
                  />
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3">
                <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent(mailtoSubject)}`}
                  className="gbz-interactive inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-[transform,background-color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:bg-primary-dark"
                >
                  {t.mediakit.sendProposal}
                </a>
                <button
                  type="button"
                  onClick={share}
                  className="gbz-interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:border-primary fine-hover:hover:text-primary"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  {t.mediakit.share}
                </button>
              </div>
            </aside>
          </div>

          <div className={`mt-6 grid gap-6 ${talent.achievements ? "lg:grid-cols-2" : ""}`}>
            <section className="rounded-[40px] border border-border bg-surface p-6 md:p-10">
              <MediaKitSectionHeading eyebrow={t.mediakit.eyebrow} title={t.mediakit.about} />
              <p className="mt-6 max-w-[68ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                {talent.shortDescription || t.mediakit.aboutEmpty}
              </p>
            </section>

            {talent.achievements ? (
              <section className="rounded-[40px] border border-border bg-surface p-6 md:p-10">
                <MediaKitSectionHeading
                  eyebrow={t.mediakit.eyebrow}
                  title={t.mediakit.achievements}
                />
                <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted-foreground md:text-lg">
                  {talent.achievements}
                </div>
              </section>
            ) : null}
          </div>

          {metricCards.length > 0 ? (
            <section className="mt-6" aria-label={t.mediakit.analytics}>
              <MediaKitSectionHeading
                eyebrow={t.mediakit.eyebrow}
                title={t.mediakit.analyticsUi.summary}
              />
              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {metricCards.map((card) => (
                  <MetricCard
                    key={card.key}
                    icon={card.icon}
                    title={card.title}
                    items={card.items}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-6">
            <MediaKitAnalytics analytics={talent.analytics ?? null} />
          </div>

          <section className="mt-16 overflow-hidden rounded-[40px] bg-primary p-8 text-primary-foreground md:p-12 lg:p-16">
            <p className="flex items-center gap-3 font-display text-[0.6875rem] font-bold uppercase tracking-[0.24em] text-primary-foreground/75">
              <span
                className="inline-block h-4 w-1 rounded-full bg-primary-foreground"
                aria-hidden="true"
              />
              {t.mediakit.eyebrow}
            </p>
            <h2 className="mt-4 max-w-[18ch] font-display text-3xl font-bold leading-[1.02] tracking-[-0.04em] md:text-5xl lg:text-6xl">
              {t.mediakit.workWith}
            </h2>
            <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-primary-foreground/85 md:text-lg">
              {t.mediakit.workWithText} {talent.stageName}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent(mailtoSubject)}`}
                className="gbz-interactive inline-flex min-h-12 items-center rounded-full bg-black px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition-[transform,background-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:bg-white fine-hover:hover:text-black"
              >
                {t.mediakit.sendProposal}
              </a>
              <Link
                to="/mediakit"
                search={{ q: "", cat: "", page: 1 }}
                className="gbz-interactive inline-flex min-h-12 items-center rounded-full border border-primary-foreground/50 px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-[transform,background-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:bg-primary-foreground fine-hover:hover:text-primary"
              >
                {t.mediakit.backToDirectory}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </Tooltip.Provider>
  );
}

function TalentMediaKitRoute() {
  const { talent } = Route.useLoaderData();
  return (
    <I18nProvider>
      <MediaKitShell>
        <MediaKitContent talent={talent} />
      </MediaKitShell>
      <Toaster />
    </I18nProvider>
  );
}
