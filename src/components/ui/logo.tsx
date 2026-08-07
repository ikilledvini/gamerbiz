import { cn } from "@/lib/utils";
import logoAsset from "@/assets/gamerbiz-logo.png.asset.json";

/** Logo oficial da Gamerbiz. */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="Gamerbiz"
      className={cn("h-8 w-auto select-none", className)}
      draggable={false}
    />
  );
}
