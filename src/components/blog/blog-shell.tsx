import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ModalProvider } from "@/components/modals/modal-provider";

export function BlogShell({ children }: { children: ReactNode }) {
  return (
    <ModalProvider>
      <a
        href="#blog-conteudo"
        className="sr-only rounded-full bg-primary px-5 py-3 font-display text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
      >
        Ir para o conteúdo
      </a>
      <Header homeHrefPrefix="/" />
      <main id="blog-conteudo" className="min-h-[70svh] pt-24">
        {children}
      </main>
      <Footer homeHrefPrefix="/" />
    </ModalProvider>
  );
}
