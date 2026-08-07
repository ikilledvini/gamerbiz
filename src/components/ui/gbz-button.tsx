import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export const gbzButton = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-bold tracking-tight transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-60 whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-dark shadow-glow",
        outline:
          "border border-border bg-background text-foreground hover:border-primary hover:text-primary",
        ghost: "text-muted-foreground hover:text-foreground",
        solidLight:
          "bg-foreground text-background hover:bg-foreground/85",
      },
      size: {
        sm: "h-11 px-5 text-sm",
        md: "h-[50px] px-7 text-[0.95rem]",
        lg: "h-[54px] px-8 text-base",
        full: "h-[54px] w-full px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type GbzButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof gbzButton> & { children: ReactNode };

export function GbzButton({ className, variant, size, ...props }: GbzButtonProps) {
  return <button className={cn(gbzButton({ variant, size }), className)} {...props} />;
}
