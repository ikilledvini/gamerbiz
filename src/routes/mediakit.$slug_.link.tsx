import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FaInstagram, FaYoutube, FaTiktok, FaTwitch, FaXTwitter } from "react-icons/fa6";
import { SiKick } from "react-icons/si";
import { ArrowLeft, ExternalLink, Share2, User } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/i18n";
import { Logo } from "@/components/ui/logo";
import { type Talent } from "@/data/talents";
import { listPublicTalents } from "@/lib/talents.functions";
import { socialEntries } from "@/lib/talent-socials";

const SITE = "https://idea-to-site-muse.lovable.app";

export const Route = createFileRoute("/mediakit/$slug_/link")({
  loader: async ({ params }) => {
    const talents = await listPublicTalents();
    const talent = talents.find((item) => item.slug === params.slug);
    if (!talent) throw notFound();
    return { talent };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Links | Gamerbiz" }, { name: "robots", content: "noindex" }] };
    }
    const talent = loaderData.talent;
    const title = `${talent.stageName} | Links | Gamerbiz`;
    const description = `Todos os canais oficiais de ${talent.stageName} — ${talent.category}. Página de links da Gamerbiz.`;
    const url = `${SITE}/mediakit/${params.slug}/link`;
    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (talent.image) {
      meta.push({ property: "og:image", content: talent.image });
      meta.push({ name: "twitter:image", content: talent.image });
    }
    return { meta, links: [{ rel: "canonical", href: url }] };
  },
  component: TalentLinksRoute,
  errorComponent: LinksFallback,
  notFoundComponent: LinksFallback,
});

const ICONS: Record<string, React.ReactNode> = {
  instagram: <FaInstagram className="h-5 w-5" aria-hidden="true" />,
  youtube: <FaYoutube className="h-5 w-5" aria-hidden="true" />,
  tiktok: <FaTiktok className="h-5 w-5" aria-hidden="true" />,
  twitch: <FaTwitch className="h-5 w-5" aria-hidden="true" />,
  twitter: <FaXTwitter className="h-5 w-5" aria-hidden="true" />,
  kick: <SiKick className="h-5 w-5" aria-hidden="true" />,
};

function LinksFallback() {
  return (
    <I18nProvider>
      <main className="grid min-h-[100dvh] place-items-center bg-links px-6 text-center">
        <div>
          <h1 className="title-gbz">404</h1>
          <Link
            to="/mediakit"
            search={{ q: "", cat: "", page: 1 }}
            className="gbz-interactive mt-8 inline-flex min-h-12 items-center rounded-full border border-primary px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary"
          >
            Media Kits
          </Link>
        </div>
      </main>
    </I18nProvider>
  );
}

function TalentLinksContent({ talent }: { talent: Talent }) {
  const { t } = useI18n();
  const entries = socialEntries(talent.socials);

  async function share() {
    const url = `${window.location.origin}/mediakit/${talent.slug}/link`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${talent.stageName} | Links`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast(t.links.linkCopied);
    } catch {
      toast(t.links.copyError);
    }
  }

  return (
    <main
      className="min-h-[100dvh] overflow-x-hidden bg-links"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)",
      }}
    >
      <section className="mx-auto w-full max-w-[560px] px-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <Link
            to="/mediakit/$slug"
            params={{ slug: talent.slug }}
            aria-label={t.mediakit.breadcrumbCurrent}
            className="gbz-interactive flex h-11 w-11 items-center justify-center rounded-full border border-border bg-links text-foreground fine-hover:hover:border-primary fine-hover:hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={share}
            aria-label={t.mediakit.share}
            className="gbz-interactive flex h-11 w-11 items-center justify-center rounded-full border border-border bg-links text-foreground fine-hover:hover:border-primary fine-hover:hover:text-primary"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-primary bg-muted p-1">
            {talent.image ? (
              <img
                src={talent.image}
                alt={talent.stageName}
                className="h-full w-full rounded-full object-cover object-top"
              />
            ) : (
              <User className="h-10 w-10 text-subtle" aria-hidden="true" />
            )}
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground">
            {talent.stageName}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">{talent.category}</p>
        </div>

        <ul className="mt-9 flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={entry.key}>
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="gbz-interactive grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-3.5 text-foreground transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.99] fine-hover:hover:border-primary fine-hover:hover:text-primary"
              >
                {ICONS[entry.platform]}
                <span className="min-w-0">
                  <span className="block font-display text-sm font-bold uppercase tracking-[0.1em]">
                    {entry.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {entry.handle}
                  </span>
                </span>
                <ExternalLink className="h-4 w-4 text-subtle" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <Link
          to="/mediakit/$slug"
          params={{ slug: talent.slug }}
          className="gbz-interactive mt-6 flex min-h-14 items-center justify-center rounded-full bg-primary px-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-[transform,background-color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.98] fine-hover:hover:bg-primary-dark"
        >
          Media Kit
        </Link>

        <footer className="mt-12 flex flex-col items-center gap-3 border-t border-border pt-8 text-center">
          <Logo className="h-7" />
          <p className="text-xs text-subtle">© Gamerbiz. {t.links.rights}</p>
        </footer>
      </section>
    </main>
  );
}

function TalentLinksRoute() {
  const { talent } = Route.useLoaderData();
  return (
    <I18nProvider>
      <TalentLinksContent talent={talent} />
      <Toaster />
    </I18nProvider>
  );
}
