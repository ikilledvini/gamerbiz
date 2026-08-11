import { Trash2, X } from "lucide-react";
import type { TalentRow } from "@/lib/talent-mapper";

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "text" | "email" | "number" | "url";
}) {
  return (
    <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

export function TalentEditorDialog({
  talent,
  onChange,
  onClose,
  onSave,
  onDelete,
  saving,
  deleting,
}: {
  talent: TalentRow;
  onChange: (talent: TalentRow) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  saving: boolean;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm md:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="talent-editor-title"
        className="mx-auto my-4 w-full max-w-5xl overflow-hidden rounded-[32px] border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-6 border-b border-border px-6 py-6 md:px-8">
          <div>
            <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
              Media Kit
            </p>
            <h2
              id="talent-editor-title"
              className="mt-2 font-display text-2xl font-bold tracking-[-0.035em] text-foreground"
            >
              {talent.id ? `Editar ${talent.stage_name}` : "Novo talento"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar editor"
            className="gbz-interactive grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
          className="px-6 py-7 md:px-8"
        >
          <fieldset className="grid gap-5 md:grid-cols-2">
            <legend className="mb-5 font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground md:col-span-2">
              Identidade e publicação
            </legend>
            <Field
              label="Nome artístico"
              value={talent.stage_name}
              onChange={(stage_name) => onChange({ ...talent, stage_name })}
              required
            />
            <Field
              label="Slug da URL"
              value={talent.slug}
              onChange={(slug) => onChange({ ...talent, slug })}
              required
            />
            <Field
              label="Usuário"
              value={talent.username ?? ""}
              onChange={(username) => onChange({ ...talent, username })}
            />
            <Field
              label="Nicho"
              value={talent.category}
              onChange={(category) => onChange({ ...talent, category })}
            />
            <Field
              label="Cidade"
              value={talent.city ?? ""}
              onChange={(city) => onChange({ ...talent, city })}
            />
            <Field
              label="Ordem"
              type="number"
              value={String(talent.sort_order)}
              onChange={(sort_order) =>
                onChange({ ...talent, sort_order: Number(sort_order) || 0 })
              }
            />
            <Field
              label="URL da foto"
              type="url"
              value={talent.image_url ?? ""}
              onChange={(image_url) => onChange({ ...talent, image_url })}
            />
            <Field
              label="Link externo do Media Kit"
              type="url"
              value={talent.media_kit_url ?? ""}
              onChange={(media_kit_url) => onChange({ ...talent, media_kit_url })}
            />
            <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle md:col-span-2">
              Bio
              <textarea
                value={talent.bio ?? ""}
                rows={4}
                onChange={(event) => onChange({ ...talent, bio: event.target.value })}
                className={`${inputClass} py-3`}
              />
            </label>
            <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle">
              Situação
              <select
                value={talent.status}
                onChange={(event) =>
                  onChange({ ...talent, status: event.target.value as TalentRow["status"] })
                }
                className={inputClass}
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="hidden">Oculto</option>
              </select>
            </label>
            <Field
              label="E-mail comercial"
              type="email"
              value={talent.contact_email ?? ""}
              onChange={(contact_email) => onChange({ ...talent, contact_email })}
            />
          </fieldset>

          <fieldset className="mt-10 grid gap-5 border-t border-border pt-8 md:grid-cols-2">
            <legend className="mb-5 font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground md:col-span-2">
              Redes sociais
            </legend>
            <Field
              label="Instagram"
              type="url"
              value={talent.instagram_url ?? ""}
              onChange={(instagram_url) => onChange({ ...talent, instagram_url })}
            />
            <Field
              label="YouTube"
              type="url"
              value={talent.youtube_url ?? ""}
              onChange={(youtube_url) => onChange({ ...talent, youtube_url })}
            />
            <Field
              label="TikTok"
              type="url"
              value={talent.tiktok_url ?? ""}
              onChange={(tiktok_url) => onChange({ ...talent, tiktok_url })}
            />
            <Field
              label="Twitch"
              type="url"
              value={talent.twitch_url ?? ""}
              onChange={(twitch_url) => onChange({ ...talent, twitch_url })}
            />
            <Field
              label="X / Twitter"
              type="url"
              value={talent.twitter_url ?? ""}
              onChange={(twitter_url) => onChange({ ...talent, twitter_url })}
            />
          </fieldset>

          <fieldset className="mt-10 grid gap-5 border-t border-border pt-8 md:grid-cols-2">
            <legend className="mb-5 font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground md:col-span-2">
              Métricas manuais e materiais
            </legend>
            <Field
              label="Seguidores"
              value={talent.followers ?? ""}
              onChange={(followers) => onChange({ ...talent, followers })}
            />
            <Field
              label="Visualizações médias"
              value={talent.avg_views ?? ""}
              onChange={(avg_views) => onChange({ ...talent, avg_views })}
            />
            <Field
              label="Engajamento"
              value={talent.engagement ?? ""}
              onChange={(engagement) => onChange({ ...talent, engagement })}
            />
            <Field
              label="Audiência"
              value={talent.audience ?? ""}
              onChange={(audience) => onChange({ ...talent, audience })}
            />
            <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle md:col-span-2">
              Conquistas e cases
              <textarea
                value={talent.achievements ?? ""}
                rows={4}
                onChange={(event) => onChange({ ...talent, achievements: event.target.value })}
                className={`${inputClass} py-3`}
              />
            </label>
          </fieldset>

          <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <button
              type="submit"
              disabled={saving}
              className="gbz-interactive min-h-12 rounded-full bg-primary px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar Media Kit"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="gbz-interactive min-h-12 rounded-full border border-border px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
            >
              Cancelar
            </button>
            {talent.id && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="gbz-interactive ml-auto inline-flex min-h-12 items-center gap-2 rounded-full border border-primary px-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary transition-colors disabled:opacity-60 fine-hover:hover:bg-primary fine-hover:hover:text-primary-foreground"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
