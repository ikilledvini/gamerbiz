import { ArrowUpRight, BookOpen, CalendarDays } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogShell } from "@/components/blog/blog-shell";
import { I18nProvider } from "@/i18n";
import { listPublicBlogPosts, type BlogPostRow } from "@/lib/blog.functions";

const TITLE = "Blog | Gamerbiz";
const DESCRIPTION =
  "Notícias, análises e bastidores sobre creators, marcas, esports e cultura gamer.";
const URL = "https://gamerbiz.com.br/blogs";

export const Route = createFileRoute("/blogs/")({
  loader: () => listPublicBlogPosts(),
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
  component: BlogsRoute,
  errorComponent: BlogsError,
});

function formatDate(value: string | null) {
  if (!value) return "Em breve";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function PostCard({ post, featured = false }: { post: BlogPostRow; featured?: boolean }) {
  return (
    <article
      className={`group overflow-hidden rounded-[32px] border border-border bg-surface transition-[transform,border-color] duration-200 fine-hover:hover:-translate-y-1 fine-hover:hover:border-primary/60 ${featured ? "lg:grid lg:grid-cols-[1.15fr_0.85fr]" : ""}`}
    >
      <Link
        to="/blogs/$slug"
        params={{ slug: post.slug }}
        className={`block overflow-hidden bg-muted ${featured ? "min-h-72 lg:min-h-[430px]" : "aspect-[16/10]"}`}
        aria-label={`Ler ${post.title}`}
      >
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={post.cover_image_alt || ""}
            className="h-full w-full object-cover transition-transform duration-500 fine-hover:group-hover:scale-[1.03]"
          />
        ) : (
          <span className="grid h-full min-h-64 place-items-center bg-[radial-gradient(circle_at_25%_20%,rgba(255,20,20,0.24),transparent_42%),linear-gradient(135deg,#171717,#080808)] text-primary">
            <BookOpen className="h-10 w-10" aria-hidden="true" />
          </span>
        )}
      </Link>
      <div className={`flex flex-col ${featured ? "justify-center p-7 md:p-10" : "p-6"}`}>
        <div className="flex flex-wrap items-center gap-3 font-display text-[0.65rem] font-bold uppercase tracking-[0.15em]">
          <span className="text-primary">{post.category}</span>
          <span className="text-subtle">{formatDate(post.published_at)}</span>
        </div>
        <h2
          className={`mt-5 font-display font-bold tracking-[-0.045em] text-foreground ${featured ? "text-3xl md:text-5xl" : "text-2xl"}`}
        >
          <Link to="/blogs/$slug" params={{ slug: post.slug }}>
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="mt-4 line-clamp-3 text-base leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
        <Link
          to="/blogs/$slug"
          params={{ slug: post.slug }}
          className="mt-7 inline-flex w-fit items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-foreground transition-colors fine-hover:hover:text-primary"
        >
          Ler artigo <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function BlogsContent() {
  const posts = Route.useLoaderData() as BlogPostRow[];
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const remaining = featured ? posts.filter((post) => post.id !== featured.id) : [];

  return (
    <BlogShell>
      <section className="section-gbz">
        <div className="container-gbz">
          <nav
            aria-label="breadcrumb"
            className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-subtle"
          >
            <Link to="/" className="transition-colors fine-hover:hover:text-primary">
              Início
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Blog</span>
          </nav>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <p className="eyebrow-gbz">Conteúdo Gamerbiz</p>
              <h1 className="title-gbz mt-4 max-w-[16ch]">Ideias que movimentam o jogo.</h1>
              <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                Notícias, análises e bastidores sobre creators, marcas, esports e tudo o que forma a
                cultura gamer.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
              {posts.length} {posts.length === 1 ? "artigo" : "artigos"}
            </div>
          </div>

          {featured ? (
            <div className="mt-14">
              <PostCard post={featured} featured />
            </div>
          ) : (
            <div className="mt-14 rounded-[36px] border border-border bg-surface p-8 md:p-12">
              <BookOpen className="h-9 w-9 text-primary" aria-hidden="true" />
              <h2 className="mt-6 font-display text-3xl font-bold tracking-[-0.04em]">
                Novos artigos em breve.
              </h2>
              <p className="mt-3 max-w-[52ch] text-muted-foreground">
                Estamos preparando conteúdos sobre o mercado gamer, creators e campanhas que
                conectam comunidades.
              </p>
            </div>
          )}

          {remaining.length ? (
            <section className="mt-16 border-t border-border pt-12" aria-labelledby="latest-posts">
              <p className="eyebrow-gbz">Mais conteúdos</p>
              <h2
                id="latest-posts"
                className="mt-4 font-display text-4xl font-bold tracking-[-0.045em]"
              >
                Últimas publicações
              </h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {remaining.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </BlogShell>
  );
}

function BlogsRoute() {
  return (
    <I18nProvider>
      <BlogsContent />
    </I18nProvider>
  );
}

function BlogsError() {
  return (
    <I18nProvider>
      <BlogShell>
        <section className="section-gbz">
          <div className="container-gbz">
            <div className="max-w-3xl rounded-[36px] border border-primary/30 bg-primary/10 p-8 md:p-12">
              <h1 className="font-display text-4xl font-bold">Não foi possível carregar o blog.</h1>
              <p className="mt-4 text-muted-foreground">Tente novamente em alguns instantes.</p>
            </div>
          </div>
        </section>
      </BlogShell>
    </I18nProvider>
  );
}
