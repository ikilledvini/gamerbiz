import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/i18n";
import { MediaKitShell } from "@/components/media-kit/media-kit-shell";
import { MediaKitSectionHeading } from "@/components/media-kit/media-kit-section-heading";
import { TalentCard } from "@/components/ui/talent-card";
import { listPublicTalents } from "@/lib/talents.functions";
import { talentCategoryGroups, getTalentCategoryGroups, type Talent } from "@/data/talents";
import { normalizeForSearch } from "@/lib/slug";

const TITLE = "Media Kits Gamerbiz | Encontre o creator ideal";
const DESCRIPTION =
  "Explore os talentos da Gamerbiz, compare perfis e acesse informações comerciais, plataformas, conteúdos e audiência.";
const URL = "https://idea-to-site-muse.lovable.app/mediakit";

const PAGE_SIZE = 12;

type MediaKitSearch = { q: string; cat: string; page: number };

export const Route = createFileRoute("/mediakit/")({
  validateSearch: (search: Record<string, unknown>): MediaKitSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    cat: typeof search["cat"] === "string" ? search["cat"] : "",
    page: Number(search["page"]) > 0 ? Math.floor(Number(search["page"])) : 1,
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  loader: () => listPublicTalents(),
  component: MediaKitDirectoryRoute,
  errorComponent: MediaKitDirectoryError,
});

function MediaKitDirectoryError() {
  return (
    <I18nProvider>
      <MediaKitShell>
        <DirectoryErrorContent />
      </MediaKitShell>
    </I18nProvider>
  );
}

function DirectoryErrorContent() {
  const { t } = useI18n();

  return (
    <section className="section-gbz">
      <div className="container-gbz">
        <div className="max-w-3xl rounded-[40px] border border-border bg-surface p-8 md:p-12">
          <MediaKitSectionHeading
            eyebrow={t.mediakit.eyebrow}
            title={t.mediakit.loadError}
            description={t.mediakit.loadErrorText}
          />
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="gbz-interactive mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-[transform,background-color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:bg-primary-dark"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t.mediakit.tryAgain}
          </button>
        </div>
      </div>
    </section>
  );
}

function byName(a: Talent, b: Talent) {
  return a.stageName.toLowerCase().localeCompare(b.stageName.toLowerCase(), "pt-BR");
}

function DirectoryContent() {
  const { t } = useI18n();
  const navigate = useNavigate({ from: "/mediakit/" });
  const { q, cat, page } = Route.useSearch();
  const publishedTalents = Route.useLoaderData() as Talent[];
  const inputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<"list" | "grid">("list");

  const results = useMemo(() => {
    const term = normalizeForSearch(q);
    return publishedTalents
      .filter((talent) => (cat ? getTalentCategoryGroups(talent).includes(cat) : true))
      .filter((talent) => {
        if (!term) return true;
        const haystack = normalizeForSearch(
          [
            talent.stageName,
            talent.username ?? "",
            talent.categories.join(" "),
            talent.city ?? "",
          ].join(" "),
        );
        return haystack.includes(term);
      })
      .sort(byName);
  }, [publishedTalents, q, cat]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageItems = useMemo(
    () => results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [results, currentPage],
  );

  const hasFilters = Boolean(q || cat);

  function setSearch(next: Partial<MediaKitSearch>) {
    void navigate({
      search: (prev: MediaKitSearch) => ({ ...prev, ...next }),
      replace: true,
    });
  }

  function openMediaKit(talent: Talent) {
    void navigate({ to: "/mediakit/$slug", params: { slug: talent.slug } });
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
            <span aria-current="page">{t.mediakit.breadcrumbCurrent}</span>
          </nav>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <p className="eyebrow-gbz">{t.mediakit.eyebrow}</p>
              <h1 className="title-gbz mt-4 max-w-[22ch]">{t.mediakit.title}</h1>
              <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                {t.mediakit.description}
              </p>
            </div>
            <p className="w-fit rounded-full border border-primary/40 bg-primary/10 px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {publishedTalents.length}{" "}
              {publishedTalents.length === 1 ? t.mediakit.countOne : t.mediakit.countMany}
            </p>
          </div>

          {publishedTalents.length === 0 ? (
            <p className="mt-10 max-w-[52ch] text-muted-foreground">{t.mediakit.emptyAll}</p>
          ) : (
            <>
              <div className="mt-12 rounded-[32px] border border-border bg-surface/70 p-3 md:flex md:items-center md:gap-3">
                <div className="relative w-full md:max-w-[440px]">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                    aria-hidden="true"
                  />
                  <input
                    ref={inputRef}
                    type="search"
                    value={q}
                    aria-label={t.mediakit.searchLabel}
                    placeholder={t.mediakit.searchPlaceholder}
                    onChange={(event) => setSearch({ q: event.target.value, page: 1 })}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setSearch({ q: "", page: 1 });
                    }}
                    className="h-13 w-full rounded-full border border-border bg-background pl-11 pr-11 text-sm text-foreground outline-offset-2 transition-[border-color] duration-[160ms] ease-[var(--ease-out-gbz)] placeholder:text-subtle focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  />
                  {q ? (
                    <button
                      type="button"
                      aria-label={t.mediakit.clearSearch}
                      onClick={() => {
                        setSearch({ q: "", page: 1 });
                        inputRef.current?.focus();
                      }}
                      className="gbz-interactive absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-[transform,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:text-primary"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <label className="mt-3 flex items-center gap-3 md:mt-0">
                  <span className="sr-only">{t.mediakit.category}</span>
                  <select
                    value={cat}
                    onChange={(event) => setSearch({ cat: event.target.value, page: 1 })}
                    className="h-13 w-full rounded-full border border-border bg-background px-5 text-sm text-foreground outline-offset-2 transition-[border-color] duration-[160ms] ease-[var(--ease-out-gbz)] focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary md:w-auto"
                  >
                    <option value="">{t.mediakit.allCategories}</option>
                    {talentCategoryGroups.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                {hasFilters ? (
                  <button
                    type="button"
                    onClick={() => setSearch({ q: "", cat: "", page: 1 })}
                    className="gbz-interactive mt-3 h-13 rounded-full border border-border px-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:border-primary fine-hover:hover:text-primary md:mt-0"
                  >
                    {t.mediakit.clearFilters}
                  </button>
                ) : null}

                <div
                  role="group"
                  aria-label={t.mediakit.viewLabel}
                  className="mt-3 flex h-13 items-center gap-1 rounded-full border border-border bg-background p-1 md:ml-auto md:mt-0"
                >
                  {[
                    { key: "list" as const, label: t.mediakit.viewList, Icon: List },
                    { key: "grid" as const, label: t.mediakit.viewGrid, Icon: LayoutGrid },
                  ].map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={view === key}
                      onClick={() => setView(key)}
                      className={`gbz-interactive inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.14em] transition-[transform,background-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] md:flex-none ${
                        view === key
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground fine-hover:hover:text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <p
                aria-live="polite"
                className="mt-5 font-display text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-subtle"
              >
                {results.length}{" "}
                {results.length === 1 ? t.mediakit.resultsOne : t.mediakit.resultsMany}
              </p>

              {results.length === 0 ? (
                <div className="mt-10">
                  <p className="text-base text-muted-foreground md:text-lg">{t.mediakit.empty}</p>
                  <button
                    type="button"
                    onClick={() => setSearch({ q: "", cat: "", page: 1 })}
                    className="gbz-interactive mt-5 min-h-12 rounded-full border border-primary px-6 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary transition-[transform,background-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:bg-primary fine-hover:hover:text-primary-foreground"
                  >
                    {t.mediakit.clearFilters}
                  </button>
                </div>
              ) : (
                <>
                  {view === "grid" ? (
                    <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                      {pageItems.map((talent) => (
                        <li key={talent.id}>
                          <TalentCard talent={talent} onMediaKit={openMediaKit} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {pageItems.map((talent) => (
                        <li key={talent.id}>
                          <Link
                            to="/mediakit/$slug"
                            params={{ slug: talent.slug }}
                            className="gbz-interactive group flex min-h-20 items-center gap-4 rounded-[24px] border border-transparent px-4 py-3 transition-[transform,background-color,border-color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.99] fine-hover:hover:-translate-y-0.5 fine-hover:hover:border-border fine-hover:hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                          >
                            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                              {talent.image ? (
                                <img
                                  src={talent.image}
                                  alt={talent.stageName}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-subtle" aria-hidden="true" />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-display text-lg font-bold tracking-[-0.02em] text-foreground">
                                {talent.stageName}
                              </span>
                              <span className="block truncate text-sm text-muted-foreground">
                                {talent.username ? `@${talent.username}` : talent.category}
                              </span>
                            </span>
                            <ArrowUpRight
                              className="ml-auto h-4 w-4 shrink-0 text-subtle transition-[transform,color] duration-[160ms] ease-[var(--ease-out-gbz)] fine-hover:group-hover:-translate-y-0.5 fine-hover:group-hover:translate-x-0.5 fine-hover:group-hover:text-primary"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {totalPages > 1 ? (
                    <nav
                      aria-label={t.mediakit.breadcrumbCurrent}
                      className="mt-12 flex items-center justify-start gap-4"
                    >
                      <button
                        type="button"
                        aria-label={t.a11y.prevSlide}
                        disabled={currentPage === 1}
                        onClick={() => setSearch({ page: currentPage - 1 })}
                        className="gbz-interactive flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:border-primary fine-hover:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={t.a11y.nextSlide}
                        disabled={currentPage === totalPages}
                        onClick={() => setSearch({ page: currentPage + 1 })}
                        className="gbz-interactive flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:border-primary fine-hover:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span
                        aria-live="polite"
                        className="text-xs uppercase tracking-[0.18em] text-subtle"
                      >
                        {currentPage}/{totalPages}
                      </span>
                    </nav>
                  ) : null}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </Tooltip.Provider>
  );
}

function MediaKitDirectoryRoute() {
  return (
    <I18nProvider>
      <MediaKitShell>
        <DirectoryContent />
      </MediaKitShell>
      <Toaster />
    </I18nProvider>
  );
}
