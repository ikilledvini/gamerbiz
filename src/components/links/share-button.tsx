import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

export function ShareButton({ className }: { className?: string }) {
  const { t } = useI18n();

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Gamerbiz", url });
        return;
      } catch {
        /* compartilhamento cancelado — não é erro */
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast(t.links.linkCopied);
    } catch {
      toast(t.links.copyError);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={t.links.sharePage}
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-border bg-black text-foreground outline-offset-2 duration-200 ease-out [transition-property:transform,color,border-color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground active:scale-[0.96] [@media(hover:hover)_and_(pointer:fine)]:hover:border-primary [@media(hover:hover)_and_(pointer:fine)]:hover:text-primary ${className ?? ""}`}
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
