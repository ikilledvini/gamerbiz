import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

export type BlogPostInput = {
  id?: string | null;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: string;
  author_name: string;
  status: BlogPostRow["status"];
  featured: boolean;
  sort_order: number;
  published_at: string | null;
};

function serverPublicClient() {
  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const key =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !key) {
    throw new Error("Supabase public connection is not configured for the published site.");
  }

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

function isMissingBlogTable(error: { code?: string; message?: string }) {
  const message = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  return (
    error.code === "PGRST205" ||
    (message.includes("public.blog_posts") && message.includes("schema cache"))
  );
}

export const listPublicBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await serverPublicClient()
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error && isMissingBlogTable(error)) return [];
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPostRow[];
});

export const getPublicBlogPost = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data: input }) => {
    const { data, error } = await serverPublicClient()
      .from("blog_posts")
      .select("*")
      .eq("slug", input.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error && isMissingBlogTable(error)) return null;
    if (error) throw new Error(error.message);
    return (data as BlogPostRow | null) ?? null;
  });

export const adminListBlogPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("blog_posts")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as BlogPostRow[];
  });

export const adminSaveBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: BlogPostInput) => input)
  .handler(async ({ data: input, context }) => {
    const { id, ...payload } = input;
    const values = {
      ...payload,
      published_at:
        payload.status === "published" ? payload.published_at || new Date().toISOString() : null,
    };
    const query = id
      ? context.supabase.from("blog_posts").update(values).eq("id", id)
      : context.supabase.from("blog_posts").insert(values);
    const { data, error } = await query.select("*").single();
    if (error) throw new Error(error.message);
    return data as BlogPostRow;
  });

export const adminReorderBlogPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { ids: string[] }) => input)
  .handler(async ({ data: input, context }) => {
    for (const [index, id] of input.ids.entries()) {
      const { error } = await context.supabase
        .from("blog_posts")
        .update({ sort_order: index + 1 })
        .eq("id", id);
      if (error) throw new Error(error.message);
    }
    return { success: true };
  });

export const adminDeleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: string }) => input)
  .handler(async ({ data: input, context }) => {
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", input.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
