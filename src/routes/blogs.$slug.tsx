import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BlogArticleContent } from "@/components/blog/blog-article-content";
import { BlogShell } from "@/components/blog/blog-shell";
import { I18nProvider } from "@/i18n";
import { getPublicBlogPost } from "@/lib/blog.functions";

const SITE = "https://gamerbiz.com.br";

export const Route = createFileRoute("/blogs/$slug")({
  loader: async ({ params }) => {
    const post = await getPublicBlogPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Blog | Gamerbiz" }] };
    const { post } = loaderData;
    const title = `${post.title} | Gamerbiz`;
    const description = post.excerpt || "Conteúdo editorial da Gamerbiz.";
    const url = `${SITE}/blogs/${params.slug}`;
    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (post.cover_image_url) {
      meta.push({ property: "og:image", content: post.cover_image_url });
      meta.push({ name: "twitter:image", content: post.cover_image_url });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description,
            image: post.cover_image_url || undefined,
            datePublished: post.published_at || undefined,
            dateModified: post.updated_at,
            author: { "@type": "Organization", name: post.author_name },
            publisher: { "@type": "Organization", name: "Gamerbiz", url: SITE },
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: BlogPostRoute,
  notFoundComponent: BlogPostNotFound,
  errorComponent: BlogPostNotFound,
});

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function BlogPostContent() {
  const { post } = Route.useLoaderData();
  return (
    <BlogShell>
      <article className="section-gbz">
        <div className="container-gbz">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors fine-hover:hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar ao blog
          </Link>
          <header className="mx-auto mt-12 max-w-5xl text-center">
            <p className="eyebrow-gbz justify-center">{post.category}</p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-5xl lg:text-7xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mx-auto mt-7 max-w-[70ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
                {post.excerpt}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
                {post.author_name}
              </span>
              {post.published_at ? (
                <time dateTime={post.published_at} className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                  {formatDate(post.published_at)}
                </time>
              ) : null}
            </div>
          </header>

          {post.cover_image_url ? (
            <figure className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-[36px] border border-border bg-muted">
              <img
                src={post.cover_image_url}
                alt={post.cover_image_alt || ""}
                className="aspect-[16/8] w-full object-cover"
              />
            </figure>
          ) : null}

          <div className="mx-auto mt-14 max-w-3xl border-t border-border pt-8">
            <BlogArticleContent content={post.content} />
          </div>
        </div>
      </article>
    </BlogShell>
  );
}

function BlogPostRoute() {
  return (
    <I18nProvider>
      <BlogPostContent />
    </I18nProvider>
  );
}

function BlogPostNotFound() {
  return (
    <I18nProvider>
      <BlogShell>
        <section className="section-gbz">
          <div className="container-gbz">
            <h1 className="title-gbz">Artigo não encontrado.</h1>
            <p className="mt-4 text-muted-foreground">
              Este conteúdo não está disponível ou ainda não foi publicado.
            </p>
            <Link
              to="/blogs"
              className="mt-8 inline-flex min-h-12 items-center rounded-full border border-primary px-7 font-display text-xs font-bold uppercase tracking-[0.15em] text-primary"
            >
              Voltar ao blog
            </Link>
          </div>
        </section>
      </BlogShell>
    </I18nProvider>
  );
}
