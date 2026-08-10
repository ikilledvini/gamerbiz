import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { TALENT_COLUMNS, mapTalentRow, type TalentRow } from "@/lib/talent-mapper";

type TalentInput = {
  id?: string | null;
  slug: string;
  stage_name: string;
  username: string | null;
  category: string;
  city: string | null;
  bio: string | null;
  image_url: string | null;
  media_kit_url: string | null;
  status: "draft" | "published" | "hidden";
  sort_order: number;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  twitch_url: string | null;
  twitter_url: string | null;
  followers: string | null;
  avg_views: string | null;
  engagement: string | null;
  audience: string | null;
  achievements: string | null;
  contact_email: string | null;
};

function serverPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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

/** Lista pública: apenas talentos publicados. */
export const listPublicTalents = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverPublicClient();
  const { data, error } = await supabase
    .from("talents")
    .select(TALENT_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as TalentRow[]).map(mapTalentRow);
});

/** Lista completa (admin), incluindo rascunhos e ocultos. */
export const adminListTalents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("talents")
      .select(TALENT_COLUMNS)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as TalentRow[];
  });

export const adminIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export const adminSaveTalent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: TalentInput) => input)
  .handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const query = id
      ? context.supabase.from("talents").update(values).eq("id", id)
      : context.supabase.from("talents").insert(values);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminReorderTalents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { ids: string[] }) => input)
  .handler(async ({ data, context }) => {
    for (const [index, id] of data.ids.entries()) {
      const { error } = await context.supabase
        .from("talents")
        .update({ sort_order: index + 1 })
        .eq("id", id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteTalent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("talents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
