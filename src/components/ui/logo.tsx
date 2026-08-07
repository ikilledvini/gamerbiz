import { cn } from "@/lib/utils";

/**
 * Marca tipográfica temporária da Gamerbiz.
 * TODO: substituir pelo arquivo oficial de logo assim que ele for anexado
 * (basta trocar o conteúdo deste componente por <img src={logo} ... />).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-xl font-extrabold uppercase leading-none tracking-[-0.04em] text-foreground",
        className,
      )}
    >
      Gamer<span className="text-primary">biz</span>
    </span>
  );
}
