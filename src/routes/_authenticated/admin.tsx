import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GripVertical, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Logo } from "@/components/ui/logo";
import { supabase } from "@/integrations/supabase/client";
import {
  adminDeleteTalent,
  adminIsAdmin,
  adminListTalents,
  adminReorderTalents,
  adminSaveTalent,
} from "@/lib/talents.functions";
import type { TalentRow } from "@/lib/talent-mapper";
import { normalizeForSearch, toSlug } from "@/lib/slug";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel de Media Kits — Gamerbiz" },
      { name: "description", content: "Painel interno para gerenciar os media kits da Gamerbiz." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel de Media Kits — Gamerbiz" },
      { property: "og:description", content: "Painel interno de gestão de talentos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminRoute,
});

const EMPTY: TalentRow = {
  id: "",
  slug: "",
  stage_name: "",
  username: null,
  category: "Multigame",
  city: null,
  bio: null,
  image_url: null,
  media_kit_url: null,
  status: "draft",
  sort_order: 999,
};

const STATUS_LABEL: Record<TalentRow["status"], string> = {
  draft: "Rascunho",
  published: "Publicado",
  hidden: "Oculto",
};

function AdminRoute() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listTalents = useServerFn(adminListTalents);
  const checkAdmin = useServerFn(adminIsAdmin);
  const saveTalent = useServerFn(adminSaveTalent);
  const deleteTalent = useServerFn(adminDeleteTalent);
  const reorderTalents = useServerFn(adminReorderTalents);

  const [term, setTerm] = useState("");
  const [editing, setEditing] = useState<TalentRow | null>(null);
  const [order, setOrder] = useState<TalentRow[] | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const adminQuery = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin({}) });
  const isAdmin = adminQuery.data?.isAdmin === true;

  const talentsQuery = useQuery({
    queryKey: ["admin-talents"],
    queryFn: () => listTalents({}),
    enabled: isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: (values: TalentRow) =>
      saveTalent({
        data: {
          id: values.id || null,
          slug: values.slug || toSlug(values.stage_name),
          stage_name: values.stage_name,
          username: values.username || null,
          category: values.category || "Multigame",
          city: values.city || null,
          bio: values.bio || null,
          image_url: values.image_url || null,
          media_kit_url: values.media_kit_url || null,
          status: values.status,
          sort_order: Number(values.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      toast.success("Talento salvo.");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-talents"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTalent({ data: { id } }),
    onSuccess: () => {
      toast.success("Talento removido.");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-talents"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => reorderTalents({ data: { ids } }),
    onSuccess: () => {
      toast.success("Ordem atualizada.");
      void queryClient.invalidateQueries({ queryKey: ["admin-talents"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setOrder(null);
    },
  });

  const baseList = order ?? talentsQuery.data ?? [];
  const canReorder = normalizeForSearch(term).length === 0;

  const rows = useMemo(() => {
    const needle = normalizeForSearch(term);
    if (!needle) return baseList;
    return baseList.filter((row) =>
      normalizeForSearch(`${row.stage_name} ${row.username ?? ""} ${row.category}`).includes(needle),
    );
  }, [baseList, term]);

  useEffect(() => {
    setOrder(null);
  }, [talentsQuery.data]);

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const list = [...baseList];
    const from = list.findIndex((row) => row.id === dragId);
    const to = list.findIndex((row) => row.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    setOrder(list);
    setDragId(null);
    reorderMutation.mutate(list.map((row) => row.id));
  }

  useEffect(() => {
    if (adminQuery.isSuccess && !isAdmin) {
      toast.error("Sua conta não tem permissão de administrador.");
    }
  }, [adminQuery.isSuccess, isAdmin]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b border-border">
        <div className="container-gbz flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-4">
            <Logo className="h-8" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-subtle">
              Painel de Media Kits
            </span>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-full border border-border px-5 py-2.5 font-display text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground duration-200 hover:border-primary hover:text-primary"
          >
            Sair
          </button>
        </div>
      </header>

      <section className="container-gbz py-10">
        {adminQuery.isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : !isAdmin ? (
          <div className="rounded-2xl border border-border bg-surface p-8">
            <h1 className="font-display text-xl font-bold uppercase text-foreground">
              Sem permissão
            </h1>
            <p className="mt-3 max-w-[60ch] text-sm text-muted-foreground">
              Sua conta está autenticada, mas ainda não tem o papel de administrador. Peça para um
              administrador liberar o acesso.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative w-full md:max-w-[380px]">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Buscar talento"
                  aria-label="Buscar talento"
                  className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm text-foreground outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => setEditing({ ...EMPTY })}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground duration-200 hover:opacity-90 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Novo talento
              </button>
              <p className="ml-auto text-xs uppercase tracking-[0.18em] text-subtle">
                {rows.length} talentos
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-[0.65rem] uppercase tracking-[0.16em] text-subtle">
                  <tr>
                    <th className="px-5 py-4">Nome</th>
                    <th className="px-5 py-4">@</th>
                    <th className="px-5 py-4">Nicho</th>
                    <th className="px-5 py-4">Situação</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {talentsQuery.isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-muted-foreground">
                        Carregando talentos...
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="border-t border-border">
                        <td className="px-5 py-4 font-display font-bold text-foreground">
                          {row.stage_name}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{row.username ?? "—"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{row.category}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] ${
                              row.status === "published"
                                ? "bg-primary/15 text-primary"
                                : "bg-surface text-subtle"
                            }`}
                          >
                            {STATUS_LABEL[row.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setEditing(row)}
                            className="rounded-full border border-border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground duration-200 hover:border-primary hover:text-primary"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveMutation.mutate(editing);
            }}
            className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-8"
          >
            <h2 className="font-display text-xl font-bold uppercase text-foreground">
              {editing.id ? `Editar ${editing.stage_name}` : "Novo talento"}
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field
                label="Nome artístico"
                value={editing.stage_name}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    stage_name: value,
                    slug: editing.id ? editing.slug : toSlug(value),
                  })
                }
                required
              />
              <Field
                label="Slug (URL)"
                value={editing.slug}
                onChange={(value) => setEditing({ ...editing, slug: value })}
                required
              />
              <Field
                label="@ usuário"
                value={editing.username ?? ""}
                onChange={(value) => setEditing({ ...editing, username: value })}
              />
              <Field
                label="Nicho (use + para combinar)"
                value={editing.category}
                onChange={(value) => setEditing({ ...editing, category: value })}
              />
              <Field
                label="Cidade"
                value={editing.city ?? ""}
                onChange={(value) => setEditing({ ...editing, city: value })}
              />
              <Field
                label="Ordem"
                value={String(editing.sort_order)}
                onChange={(value) => setEditing({ ...editing, sort_order: Number(value) || 0 })}
              />
              <Field
                label="URL da foto"
                value={editing.image_url ?? ""}
                onChange={(value) => setEditing({ ...editing, image_url: value })}
              />
              <Field
                label="Link do media kit"
                value={editing.media_kit_url ?? ""}
                onChange={(value) => setEditing({ ...editing, media_kit_url: value })}
              />

              <label className="text-xs font-bold uppercase tracking-[0.16em] text-subtle md:col-span-2">
                Bio
                <textarea
                  value={editing.bio ?? ""}
                  onChange={(event) => setEditing({ ...editing, bio: event.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm normal-case tracking-normal text-foreground outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                />
              </label>

              <label className="text-xs font-bold uppercase tracking-[0.16em] text-subtle">
                Situação
                <select
                  value={editing.status}
                  onChange={(event) =>
                    setEditing({ ...editing, status: event.target.value as TalentRow["status"] })
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="hidden">Oculto</option>
                </select>
              </label>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="h-12 rounded-full bg-primary px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              >
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-12 rounded-full border border-border px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground duration-200 hover:border-primary hover:text-primary"
              >
                Cancelar
              </button>
              {editing.id ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remover ${editing.stage_name}?`)) {
                      deleteMutation.mutate(editing.id);
                    }
                  }}
                  className="ml-auto inline-flex h-12 items-center gap-2 rounded-full border border-primary px-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary duration-200 hover:bg-primary hover:text-primary-foreground"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Excluir
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="text-xs font-bold uppercase tracking-[0.16em] text-subtle">
      {label}
      <input
        type="text"
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      />
    </label>
  );
}
