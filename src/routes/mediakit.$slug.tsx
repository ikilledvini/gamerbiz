import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Info, Instagram, Music, Share2, Twitch, Twitter, User, Youtube } from "lucide-react";
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

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-foreground duration-200 hover:border-primary hover:text-primary"
    >
      {icon}
    </a>
  );
}

function StatCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-display text-2xl font-extrabold text-foreground">{value ?? "—"}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-subtle">{label}</p>
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

  const activeSocials = (
    [
      { key: "instagram", url: talent.socials.instagram, label: t.mediakit.platforms.instagram, icon: <Instagram className="h-5 w-5" /> },
      { key: "tiktok", url: talent.socials.tiktok, label: t.mediakit.platforms.tiktok, icon: <Music className="h-5 w-5" /> },
      { key: "youtube", url: talent.socials.youtube, label: t.mediakit.platforms.youtube, icon: <Youtube className="h-5 w-5" /> },
      { key: "twitch", url: talent.socials.twitch, label: t.mediakit.platforms.twitch, icon: <Twitch className="h-5 w-5" /> },
      { key: "twitter", url: talent.socials.twitter, label: t.mediakit.platforms.twitter, icon: <Twitter className="h-5 w-5" /> },
    ] as { key: string; url: string; label: string; icon: React.ReactNode }[]
  ).filter((item) => item.url);

  const stats = [
    { key: "followers", label: t.mediakit.followers, value: talent.stats.followers },
    { key: "avgViews", label: t.mediakit.avgViews, value: talent.stats.avgViews },
    { key: "engagement", label: t.mediakit.engagement, value: talent.stats.engagement },
    { key: "audience", label: t.mediakit.audience, value: talent.stats.audience },
  ].filter((item) => item.value);

  const contactEmail = talent.contactEmail || DEFAULT_CONTACT_EMAIL;
  const mailtoSubject = `${t.mediakit.contactSubject} ${talent.stageName}`;

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

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[40px] border border-border bg-muted">
              {talent.image ? (
                <img
                  src={talent.image}
                  alt={talent.stageName}
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
            </div>

            <div>
              <p className="eyebrow-gbz">{t.mediakit.eyebrow}</p>
              <h1 className="title-gbz mt-4">{talent.stageName}</h1>
              {talent.username ? (
                <p className="mt-2 text-muted-foreground">@{talent.username}</p>
              ) : null}
              <p className="mt-3 font-display text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {talent.category}
              </p>
              {talent.city ? (
                <p className="mt-2 text-sm text-muted-foreground">{talent.city}</p>
              ) : null}

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

              {activeSocials.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {activeSocials.map((item) => (
                    <SocialLink
                      key={item.key}
                      href={item.url}
                      label={item.label}
                      icon={item.icon}
                    />
                  ))}
                </div>
              ) : null}

              {stats.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {stats.map((item) => (
                    <StatCard key={item.key} label={item.label} value={item.value} />
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent(mailtoSubject)}`}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground duration-200 hover:opacity-90 active:scale-[0.97]"
                >
                  {t.mediakit.sendProposal}
                </a>
                <button
                  type="button"
                  onClick={share}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground duration-200 hover:border-primary hover:text-primary active:scale-[0.97]"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  {t.mediakit.share}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            <section>
              <h2 className="font-display text-2xl font-extrabold">{t.mediakit.about}</h2>
              <p className="mt-4 max-w-[60ch] leading-relaxed text-muted-foreground">
                {talent.shortDescription || t.mediakit.aboutEmpty}
              </p>
            </section>

            {talent.achievements ? (
              <section>
                <h2 className="font-display text-2xl font-extrabold">{t.mediakit.achievements}</h2>
                <div className="mt-4 max-w-[60ch] leading-relaxed text-muted-foreground whitespace-pre-line">
                  {talent.achievements}
                </div>
              </section>
            ) : (
              <section>
                <h2 className="font-display text-2xl font-extrabold">{t.mediakit.analytics}</h2>
                <p className="mt-4 max-w-[60ch] leading-relaxed text-muted-foreground">
                  {t.mediakit.analyticsEmpty}
                </p>
              </section>
            )}
          </div>

          <section className="mt-16 rounded-[32px] border border-border bg-surface p-8">
            <h2 className="font-display text-2xl font-extrabold">{t.mediakit.workWith}</h2>
            <p className="mt-3 text-muted-foreground">
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
