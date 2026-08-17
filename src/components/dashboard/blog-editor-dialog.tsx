import { Trash2, X } from "lucide-react";
import type { BlogPostRow } from "@/lib/blog.functions";
import { toSlug } from "@/lib/slug";

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
  type?: "text" | "number" | "url";
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

export function BlogEditorDialog({
  post,
  onChange,
  onClose,
  onSave,
  onDelete,
  saving,
  deleting,
}: {
  post: BlogPostRow;
  onChange: (post: BlogPostRow) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: (() => void) | undefined;
  saving: boolean;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm md:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-editor-title"
        className="mx-auto my-4 w-full max-w-5xl overflow-hidden rounded-[32px] border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-6 border-b border-border px-6 py-6 md:px-8">
          <div>
            <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
              Conteúdo editorial
            </p>
            <h2
              id="blog-editor-title"
              className="mt-2 font-display text-2xl font-bold tracking-[-0.035em] text-foreground"
            >
              {post.id ? `Editar ${post.title}` : "Novo artigo"}
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
              Publicação
            </legend>
            <Field
              label="Título"
              value={post.title}
              onChange={(title) => onChange({ ...post, title, slug: post.slug || toSlug(title) })}
              required
            />
            <Field
              label="Slug da URL"
              value={post.slug}
              onChange={(slug) => onChange({ ...post, slug })}
              required
            />
            <Field
              label="Categoria"
              value={post.category}
              onChange={(category) => onChange({ ...post, category })}
            />
            <Field
              label="Autor"
              value={post.author_name}
              onChange={(author_name) => onChange({ ...post, author_name })}
            />
            <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle">
              Situação
              <select
                value={post.status}
                onChange={(event) =>
                  onChange({ ...post, status: event.target.value as BlogPostRow["status"] })
                }
                className={inputClass}
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="hidden">Oculto</option>
              </select>
            </label>
            <Field
              label="Ordem"
              type="number"
              value={String(post.sort_order)}
              onChange={(sort_order) => onChange({ ...post, sort_order: Number(sort_order) || 0 })}
            />
            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground md:col-span-2">
              <input
                type="checkbox"
                checked={post.featured}
                onChange={(event) => onChange({ ...post, featured: event.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              Destacar este artigo no topo do blog
            </label>
          </fieldset>

          <fieldset className="mt-10 grid gap-5 border-t border-border pt-8 md:grid-cols-2">
            <legend className="mb-5 font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground md:col-span-2">
              Capa e resumo
            </legend>
            <Field
              label="URL da imagem de capa"
              type="url"
              value={post.cover_image_url ?? ""}
              onChange={(cover_image_url) => onChange({ ...post, cover_image_url })}
            />
            <Field
              label="Texto alternativo da capa"
              value={post.cover_image_alt ?? ""}
              onChange={(cover_image_alt) => onChange({ ...post, cover_image_alt })}
            />
            <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle md:col-span-2">
              Resumo
              <textarea
                value={post.excerpt ?? ""}
                rows={3}
                maxLength={320}
                onChange={(event) => onChange({ ...post, excerpt: event.target.value })}
                className={`${inputClass} py-3`}
              />
              <span className="mt-2 block text-[0.65rem] normal-case tracking-normal text-muted-foreground">
                {(post.excerpt ?? "").length}/320 caracteres
              </span>
            </label>
          </fieldset>

          <fieldset className="mt-10 border-t border-border pt-8">
            <legend className="mb-5 font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground">
              Conteúdo do artigo
            </legend>
            <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle">
              Texto
              <textarea
                value={post.content}
                rows={18}
                required
                onChange={(event) => onChange({ ...post, content: event.target.value })}
                className={`${inputClass} resize-y py-4 font-mono leading-relaxed`}
              />
            </label>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Separe parágrafos com uma linha vazia. Use <strong>## Título</strong> para subtítulos,
              <strong> ### Título</strong> para seções menores e <strong>- item</strong> para
              listas.
            </p>
          </fieldset>

          <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <button
              type="submit"
              disabled={saving}
              className="gbz-interactive min-h-12 rounded-full bg-primary px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar artigo"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="gbz-interactive min-h-12 rounded-full border border-border px-7 font-display text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
            >
              Cancelar
            </button>
            {post.id && onDelete ? (
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
