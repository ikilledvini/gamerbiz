import { useMemo, useState } from "react";
import { Inbox, Mail, MessageSquareText, Search, X } from "lucide-react";
import type { LeadRow } from "@/lib/portal.functions";
import { normalizeForSearch } from "@/lib/slug";
import { cn } from "@/lib/utils";

type KindFilter = "all" | "brand" | "creator";

const KIND_LABEL: Record<string, string> = {
  brand: "Marca",
  creator: "Creator",
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className="mt-1 whitespace-pre-line break-words text-sm text-foreground">{value}</p>
    </div>
  );
}

export function FormInboxPanel({ leads }: { leads: LeadRow[] }) {
  const [term, setTerm] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [selected, setSelected] = useState<LeadRow | null>(null);

  const filtered = useMemo(() => {
    const needle = normalizeForSearch(term);
    return leads
      .filter((lead) => kind === "all" || lead.kind === kind)
      .filter(
        (lead) =>
          !needle ||
          normalizeForSearch(
            [lead.name, lead.email, lead.company, lead.subject, lead.message, lead.profiles]
              .filter(Boolean)
              .join(" "),
          ).includes(needle),
      );
  }, [leads, kind, term]);

  const brandCount = leads.filter((lead) => lead.kind === "brand").length;
  const creatorCount = leads.filter((lead) => lead.kind === "creator").length;

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Formulários
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">Entradas recebidas</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Leitura das mensagens enviadas nos formulários de marca e creator, exatamente como
              foram recebidas.
            </p>
          </div>
          <label className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar por nome, e-mail ou mensagem"
              className="h-11 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              ["all", `Todas (${leads.length})`],
              ["brand", `Marcas (${brandCount})`],
              ["creator", `Creators (${creatorCount})`],
            ] as Array<[KindFilter, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setKind(key)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition",
                kind === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-[26px] border border-border bg-surface p-10 text-center">
          <Inbox className="mx-auto h-6 w-6 text-subtle" />
          <p className="mt-3 text-sm text-muted-foreground">Nenhuma entrada encontrada.</p>
        </section>
      ) : (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => setSelected(lead)}
              className="rounded-[22px] border border-border bg-surface p-4 text-left transition hover:border-primary"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {KIND_LABEL[lead.kind] ?? lead.kind}
                </span>
                <span className="text-[11px] text-subtle">{formatDateTime(lead.created_at)}</span>
              </div>
              <p className="mt-3 truncate font-display text-base font-bold">{lead.name}</p>
              <p className="mt-1 flex items-center gap-2 truncate text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {lead.email}
              </p>
              {(lead.company || lead.creator_type) && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {lead.company || lead.creator_type}
                </p>
              )}
              {lead.message && (
                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {lead.message}
                </p>
              )}
            </button>
          ))}
        </section>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[26px] border border-border bg-surface p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  {KIND_LABEL[selected.kind] ?? selected.kind}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold">{selected.name}</h3>
                <p className="mt-1 text-xs text-subtle">
                  Recebido em {formatDateTime(selected.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-primary"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="E-mail" value={selected.email} />
              <Field label="WhatsApp" value={selected.whatsapp} />
              <Field label="Empresa" value={selected.company} />
              <Field label="Tipo de creator" value={selected.creator_type} />
              <Field label="Assunto" value={selected.subject} />
              <Field label="Idioma" value={selected.locale} />
              <Field label="Origem" value={selected.source} />
            </div>

            <div className="mt-4 space-y-4">
              <Field label="Perfis / redes" value={selected.profiles} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-subtle">
                  Mensagem
                </p>
                <p className="mt-2 whitespace-pre-line break-words rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed">
                  {selected.message || "Sem mensagem."}
                </p>
              </div>
            </div>

            <p className="mt-5 flex items-center gap-2 text-[11px] text-subtle">
              <MessageSquareText className="h-3.5 w-3.5" />
              Somente leitura — gerencie etapas e responsáveis na aba Pipeline.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
