import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Gamepad2, Info, Instagram, Mail, MapPin, Music, Share2, Twitch, Twitter, User, Youtube } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/i18n";
import { MediaKitShell } from "@/components/media-kit/media-kit-shell";
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
          className="mt-8 inline-flex rounded-full border border-primary px-7 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary duration-200 hover:bg-primary hover:text-primary-foreground active:scale-[0.97]"
        >
          {t.mediakit.backToDirectory}
        </Link>
      </div>
    </section>
  );
}

function PanelTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-subtle">
        <span className="inline-block h-3 w-[3px] rounded-full bg-primary" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className="mt-1.5 font-display text-lg font-extrabold uppercase tracking-[0.04em] text-foreground">
        {title}
      </h2>
    </div>
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
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-foreground">
        <span className="shrink-0 text-muted-foreground">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-[14ch] truncate text-sm text-muted-foreground transition-colors duration-200 hover:text-primary sm:max-w-[22ch]"
        >
          {value}
        </a>
      ) : (
        <span className="max-w-[14ch] truncate text-sm text-muted-foreground sm:max-w-[22ch]">
          {value}
        </span>
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
    <div className="rounded-[24px] border border-border bg-surface p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
          {icon}
        </span>
        <p className="truncate font-display text-sm font-extrabold uppercase tracking-[0.08em] text-foreground">
          {title}
        </p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle">
              {item.label}
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
              {item.value ?? "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
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
        icon: <Instagram className="h-4 w-4" />,
      },
      {
        key: "youtube",
        url: talent.socials.youtube,
        label: t.mediakit.platforms.youtube,
        icon: <Youtube className="h-4 w-4" />,
      },
      {
        key: "tiktok",
        url: talent.socials.tiktok,
        label: t.mediakit.platforms.tiktok,
        icon: <Music className="h-4 w-4" />,
      },
      {
        key: "twitch",
        url: talent.socials.twitch,
        label: t.mediakit.platforms.twitch,
        icon: <Twitch className="h-4 w-4" />,
      },
      {
        key: "twitter",
        url: talent.socials.twitter,
        label: t.mediakit.platforms.twitter,
        icon: <Twitter className="h-4 w-4" />,
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
      icon: <Instagram className="h-5 w-5" />,
      active: Boolean(talent.socials.instagram),
      items: [
        { label: t.mediakit.followers, value: talent.stats.followers },
        { label: t.mediakit.engagement, value: talent.stats.engagement },
      ],
    },
    {
      key: "youtube",
      title: t.mediakit.platforms.youtube,
      icon: <Youtube className="h-5 w-5" />,
      active: Boolean(talent.socials.youtube),
      items: [
        { label: t.mediakit.avgViews, value: talent.stats.avgViews },
        { label: t.mediakit.audience, value: talent.stats.audience },
      ],
    },
    {
      key: "tiktok",
      title: t.mediakit.platforms.tiktok,
      icon: <Music className="h-5 w-5" />,
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
    <Tooltip.Provider delayDuration={400}>
      <section className="section-gbz">
        <div className="container-gbz">
          <nav aria-label="breadcrumb" className="text-xs text-subtle">
            <Link to="/" className="transition-colors duration-200 hover:text-primary">
              {t.mediakit.breadcrumbHome}
            </Link>
            <span aria-hidden="true"> / </span>
            <Link
              to="/mediakit"
              search={{ q: "", cat: "", page: 1 }}
              className="transition-colors duration-200 hover:text-primary"
            >
              {t.mediakit.breadcrumbCurrent}
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{talent.stageName}</span>
          </nav>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_2.1fr] lg:items-start">
            {/* Coluna esquerda */}
            <div className="flex flex-col gap-5">
              <div className="rounded-[24px] border border-border bg-surface p-6">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
                  <div className="h-[110px] w-[110px] shrink-0 overflow-hidden rounded-full border-2 border-primary bg-muted">
                    {talent.image ? (
                      <img
                        src={talent.image}
                        alt={talent.stageName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-subtle" aria-hidden="true">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate font-display text-2xl font-extrabold text-foreground">
                      {talent.stageName}
                    </h1>
                    {talent.username ? (
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        @{talent.username}
                      </p>
                    ) : null}
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Gamepad2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{talent.category}</span>
                    </p>
                    {talent.city ? (
                      <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{talent.city}</span>
                      </p>
                    ) : null}
                  </div>
                </div>

                {badge ? (
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        type="button"
                        aria-label={`${badge.label} — ${t.a11y.info}`}
                        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary-foreground"
                      >
                        {badge.label}
                        <Info className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="bottom"
                        className="z-[120] max-w-[260px] rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground shadow-card"
                      >
                        {badge.tip}
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ) : null}
              </div>

              <div className="rounded-[24px] border border-border bg-surface p-6">
                <PanelTitle eyebrow={t.mediakit.eyebrow} title={t.mediakit.socials} />
                <ul className="mt-5 flex flex-col gap-4">
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

                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={`mailto:${contactEmail}?subject=${encodeURIComponent(mailtoSubject)}`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground duration-200 hover:opacity-90 active:scale-[0.97]"
                  >
                    {t.mediakit.sendProposal}
                  </a>
                  <button
                    type="button"
                    onClick={share}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-border px-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground duration-200 hover:border-primary hover:text-primary active:scale-[0.97]"
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    {t.mediakit.share}
                  </button>
                </div>
              </div>
            </div>

            {/* Coluna direita */}
            <div className="flex flex-col gap-5">
              <div className="rounded-[24px] border border-border bg-surface p-8">
                <PanelTitle eyebrow={t.mediakit.eyebrow} title={t.mediakit.about} />
                <p className="mt-5 leading-relaxed text-muted-foreground">
                  {talent.shortDescription || t.mediakit.aboutEmpty}
                </p>
              </div>

              {metricCards.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {metricCards.map((card) => (
                    <MetricCard
                      key={card.key}
                      icon={card.icon}
                      title={card.title}
                      items={card.items}
                    />
                  ))}
                </div>
              ) : null}

              <MediaKitAnalytics analytics={talent.analytics ?? null} />


              {talent.achievements ? (
                <div className="rounded-[24px] border border-border bg-surface p-8">
                  <PanelTitle eyebrow={t.mediakit.eyebrow} title={t.mediakit.achievements} />
                  <div className="mt-5 whitespace-pre-line leading-relaxed text-muted-foreground">
                    {talent.achievements}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[24px] border border-border bg-surface p-8">
                <PanelTitle eyebrow={t.mediakit.eyebrow} title={t.mediakit.workWith} />
                <p className="mt-4 text-muted-foreground">
                  {t.mediakit.workWithText} {talent.stageName}.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${contactEmail}?subject=${encodeURIComponent(mailtoSubject)}`}
                    className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground duration-200 hover:opacity-90 active:scale-[0.97]"
                  >
                    {t.mediakit.sendProposal}
                  </a>
                  <Link
                    to="/mediakit"
                    search={{ q: "", cat: "", page: 1 }}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-border px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground duration-200 hover:border-primary hover:text-primary active:scale-[0.97]"
                  >
                    {t.mediakit.backToDirectory}
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
