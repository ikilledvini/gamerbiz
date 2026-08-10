import { useMemo, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Search, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/i18n";
import { MediaKitShell } from "@/components/media-kit/media-kit-shell";
import { TalentCard } from "@/components/ui/talent-card";
import { publishedTalents, type Talent } from "@/data/talents";
import { normalizeForSearch } from "@/lib/slug";

const TITLE = "Media Kits Gamerbiz — Encontre o creator ideal";
const DESCRIPTION =
  "Explore os talentos da Gamerbiz, compare perfis e acesse informações comerciais, plataformas, conteúdos e audiência.";
const URL = "https://idea-to-site-muse.lovable.app/mediakit";

type MediaKitSearch = { q: string; cat: string };

export const Route = createFileRoute("/mediakit/")({
  validateSearch: (search: Record<string, unknown>): MediaKitSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    cat: typeof search["cat"] === "string" ? search["cat"] : "",
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
  component: MediaKitDirectoryRoute,
});

function byName(a: Talent, b: Talent) {
  return a.stageName.toLowerCase().localeCompare(b.stageName.toLowerCase(), "pt-BR");
}

function DirectoryContent() {
  const { t } = useI18n();
  const navigate = useNavigate({ from: "/mediakit" });
  const { q, cat } = Route.useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(publishedTalents.map((talent) => talent.category))).sort(),
    [],
  );

  const results = useMemo(() => {
    const term = normalizeForSearch(q);
    return publishedTalents
      .filter((talent) => (cat ? talent.category === cat : true))
      .filter((talent) => {
        if (!term) return true;
        const haystack = normalizeForSearch(
          [talent.stageName, talent.username ?? "", talent.category, talent.city ?? ""].join(" "),
        );
        return haystack.includes(term);
      })
      .sort(byName);
  }, [q, cat]);

  const grouped = useMemo(() => {
    const map = new Map<string, Talent[]>();
    for (const talent of results) {
      const letter = talent.stageName[0]?.toUpperCase() ?? "#";
      const list = map.get(letter) ?? [];
      list.push(talent);
      map.set(letter, list);
    }
    return Array.from(map.entries());
  }, [results]);

  const hasFilters = Boolean(q || cat);

  function setSearch(next: Partial<MediaKitSearch>) {
    void navigate({ search: (prev: MediaKitSearch) => ({ ...prev, ...next }), replace: true });
  }

  function openMediaKit(talent: Talent) {
    void navigate({ to: "/mediakit/$slug", params: { slug: talent.slug } });
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
            <span aria-current="page">{t.mediakit.breadcrumbCurrent}</span>
          </nav>

          <p className="eyebrow-gbz mt-6">{t.mediakit.eyebrow}</p>
          <h1 className="title-gbz mt-4 max-w-[22ch]">{t.mediakit.title}</h1>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">
            {t.mediakit.description}
          </p>
          <p className="mt-4 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {publishedTalents.length}{" "}
            {publishedTalents.length === 1 ? t.mediakit.countOne : t.mediakit.countMany}
          </p>

          {publishedTalents.length === 0 ? (
            <p className="mt-10 max-w-[52ch] text-muted-foreground">{t.mediakit.emptyAll}</p>
          ) : (
            <>
              <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative w-full md:max-w-[420px]">
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
                    onChange={(event) => setSearch({ q: event.target.value })}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setSearch({ q: "" });
                    }}
                    className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-11 text-sm text-foreground outline-offset-2 placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  />
                  {q ? (
                    <button
                      type="button"
                      aria-label={t.mediakit.clearSearch}
                      onClick={() => {
                        setSearch({ q: "" });
                        inputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground duration-200 hover:text-primary active:scale-[0.97]"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <label className="flex items-center gap-3">
                  <span className="sr-only">{t.mediakit.category}</span>
                  <select
                    value={cat}
                    onChange={(event) => setSearch({ cat: event.target.value })}
                    className="h-12 rounded-full border border-border bg-surface px-5 text-sm text-foreground outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <option value="">{t.mediakit.allCategories}</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                {hasFilters ? (
                  <button
                    type="button"
                    onClick={() => setSearch({ q: "", cat: "" })}
                    className="h-12 rounded-full border border-border px-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground duration-200 hover:border-primary hover:text-primary active:scale-[0.97]"
                  >
                    {t.mediakit.clearFilters}
                  </button>
                ) : null}
              </div>

              <p aria-live="polite" className="mt-4 text-xs uppercase tracking-[0.18em] text-subtle">
                {results.length}{" "}
                {results.length === 1 ? t.mediakit.resultsOne : t.mediakit.resultsMany}
              </p>

              {results.length === 0 ? (
                <div className="mt-10">
                  <p className="text-muted-foreground">{t.mediakit.empty}</p>
                  <button
                    type="button"
                    onClick={() => setSearch({ q: "", cat: "" })}
                    className="mt-5 rounded-full border border-primary px-6 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary duration-200 hover:bg-primary hover:text-primary-foreground active:scale-[0.97]"
                  >
                    {t.mediakit.clearFilters}
                  </button>
                </div>
              ) : (
                grouped.map(([letter, list]) => (
                  <section key={letter} className="mt-12">
                    <h2 className="font-display text-2xl font-extrabold text-primary">{letter}</h2>
                    {view === "grid" ? (
                      <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {list.map((talent) => (
                          <li key={talent.id}>
                            <TalentCard talent={talent} onMediaKit={openMediaKit} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="mt-5 grid grid-cols-1 gap-x-10 gap-y-1 md:grid-cols-2">
                        {list.map((talent) => (
                          <li key={talent.id}>
                            <Link
                              to="/mediakit/$slug"
                              params={{ slug: talent.slug }}
                              className="flex items-center gap-4 rounded-2xl px-3 py-3 duration-200 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                            >
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
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
                                <span className="block truncate font-display text-base font-bold text-foreground">
                                  {talent.stageName}
                                </span>
                                <span className="block truncate text-sm text-muted-foreground">
                                  {talent.username ? `@${talent.username}` : talent.category}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))

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
