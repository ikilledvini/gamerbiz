import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type {} from "@tanstack/react-start";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://gamerbiz.com.br";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/mediakit", changefreq: "weekly", priority: "0.8" },
  { path: "/blogs", changefreq: "weekly", priority: "0.8" },
  { path: "/links", changefreq: "monthly", priority: "0.6" },
  { path: "/politica-de-privacidade", changefreq: "yearly", priority: "0.3" },
  { path: "/termos-de-servico", changefreq: "yearly", priority: "0.3" },
  ...(["pt", "en", "es", "zh"] as const).flatMap<SitemapEntry>((lang) => [
    { path: `/privacy/${lang}`, changefreq: "yearly", priority: "0.3" },
    { path: `/tos/${lang}`, changefreq: "yearly", priority: "0.3" },
  ]),
];

function publicClient() {
  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const key =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

async function dynamicEntries(): Promise<SitemapEntry[]> {
  const supabase = publicClient();
  if (!supabase) return [];

  const [talents, posts] = await Promise.all([
    supabase.from("talents").select("slug").eq("status", "published"),
    supabase.from("blog_posts").select("slug, published_at, updated_at").eq("status", "published"),
  ]);

  const entries: SitemapEntry[] = [];

  for (const talent of talents.data ?? []) {
    if (!talent.slug) continue;
    entries.push({ path: `/mediakit/${talent.slug}`, changefreq: "monthly", priority: "0.7" });
  }

  for (const post of posts.data ?? []) {
    if (!post.slug) continue;
    const lastmod = post.updated_at ?? post.published_at ?? null;
    entries.push({
      path: `/blogs/${post.slug}`,
      ...(lastmod ? { lastmod: new Date(lastmod).toISOString() } : {}),
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  return entries;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let entries = STATIC_ENTRIES;
        try {
          entries = [...STATIC_ENTRIES, ...(await dynamicEntries())];
        } catch {
          // Mantém as rotas estáticas caso o backend esteja indisponível.
        }

        const urls = entries.map((entry) =>
          [
            `  <url>`,
            `    <loc>${escapeXml(`${BASE_URL}${entry.path}`)}</loc>`,
            entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
            entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : null,
            entry.priority ? `    <priority>${entry.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
