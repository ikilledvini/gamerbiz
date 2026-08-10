import type { TablesInsert } from "@/integrations/supabase/types";

export async function submitLeadSubmission(payload: TablesInsert<"lead_submissions">) {
  const { supabase } = await import("@/integrations/supabase/client");
  const { error } = await supabase.from("lead_submissions").insert(payload);
  if (error) throw error;
}
