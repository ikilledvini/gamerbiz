import * as Dialog from "@radix-ui/react-dialog";
import { KeyRound, Trash2, X } from "lucide-react";
import type { ManagedUserRole } from "@/lib/portal.functions";
import type { TalentRow } from "@/lib/talent-mapper";

export type ManagedUserDraft = {
  userId: string | null;
  email: string;
  displayName: string;
  password: string;
  role: ManagedUserRole;
  talentId: string;
};

export function UserEditorDialog({
  value,
  talents,
  currentUserId,
  onChange,
  onClose,
  onSave,
  onDelete,
  onResetPassword,
  saving,
  deleting,
}: {
  value: ManagedUserDraft;
  talents: TalentRow[];
  currentUserId: string | undefined;
  onChange: (next: ManagedUserDraft) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: (() => void) | undefined;
  onResetPassword?: (() => void) | undefined;
  saving: boolean;
  deleting: boolean;
}) {
  const isEditing = Boolean(value.userId);
  const isCurrentUser = value.userId === currentUserId;
  const canSubmit =
    Boolean(value.email.trim()) &&
    (isEditing || value.password.length >= 8) &&
    (value.role === "admin" || Boolean(value.talentId));

  return (
    <Dialog.Root open onOpenChange={(open) => (open ? undefined : onClose())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-border bg-surface p-6 shadow-2xl outline-none md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                {isEditing ? "Gerenciar acesso" : "Nova conta"}
              </p>
              <Dialog.Title className="mt-2 font-display text-2xl font-bold tracking-[-0.04em]">
                {isEditing ? value.displayName || value.email : "Criar usuário"}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Administradores têm acesso total. Creators ficam limitados ao Media Kit selecionado.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <form
            className="mt-7 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              onSave();
            }}
          >
            <label className="block text-[0.62rem] font-bold uppercase tracking-[0.15em] text-subtle">
              Nome
              <input
                type="text"
                autoComplete="name"
                value={value.displayName}
                onChange={(event) => onChange({ ...value, displayName: event.target.value })}
                className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block text-[0.62rem] font-bold uppercase tracking-[0.15em] text-subtle">
              E-mail
              <input
                type="email"
                autoComplete="email"
                required
                value={value.email}
                onChange={(event) => onChange({ ...value, email: event.target.value })}
                className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block text-[0.62rem] font-bold uppercase tracking-[0.15em] text-subtle">
              {isEditing ? "Nova senha (opcional)" : "Senha temporária"}
              <span className="relative mt-2 block">
                <KeyRound
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                  aria-hidden="true"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  required={!isEditing}
                  minLength={8}
                  value={value.password}
                  onChange={(event) => onChange({ ...value, password: event.target.value })}
                  placeholder={isEditing ? "Deixe em branco para manter" : "Mínimo de 8 caracteres"}
                  className="min-h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </span>
            </label>

            <fieldset>
              <legend className="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-subtle">
                Nível de acesso
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["creator", "admin"] as ManagedUserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    disabled={isCurrentUser && role !== "admin"}
                    onClick={() =>
                      onChange({
                        ...value,
                        role,
                        talentId: role === "admin" ? "" : value.talentId,
                      })
                    }
                    className={`min-h-11 rounded-xl border px-4 font-display text-xs font-bold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      value.role === role
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {role === "admin" ? "Administrador" : "Creator"}
                  </button>
                ))}
              </div>
            </fieldset>

            {value.role === "creator" ? (
              <label className="block text-[0.62rem] font-bold uppercase tracking-[0.15em] text-subtle">
                Media Kit permitido
                <select
                  required
                  value={value.talentId}
                  onChange={(event) => onChange({ ...value, talentId: event.target.value })}
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Selecione um Media Kit</option>
                  {talents.map((talent) => (
                    <option key={talent.id} value={talent.id}>
                      {talent.stage_name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs leading-relaxed text-emerald-300">
                Acesso administrativo total. Nenhum Media Kit precisa ser selecionado.
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {onDelete ? (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting || isCurrentUser}
                    className="gbz-interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/40 px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.11em] text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    title={
                      isCurrentUser ? "Não é possível excluir a conta da sessão atual" : undefined
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {deleting ? "Excluindo..." : "Excluir"}
                  </button>
                ) : null}
                {onResetPassword ? (
                  <button
                    type="button"
                    onClick={onResetPassword}
                    className="gbz-interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.11em] text-muted-foreground"
                  >
                    <KeyRound className="h-4 w-4" />
                    Enviar redefinição
                  </button>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={!canSubmit || saving}
                className="min-h-11 rounded-full bg-primary px-6 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Salvando..." : isEditing ? "Salvar acesso" : "Criar usuário"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
