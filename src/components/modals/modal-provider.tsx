import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BrandContactModal } from "./brand-contact-modal";
import { CreatorApplicationModal } from "./creator-application-modal";

type ModalContextValue = {
  openBrandModal: (subject?: string) => void;
  openCreatorModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [brandOpen, setBrandOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [subject, setSubject] = useState<string | null>(null);

  const openBrandModal = useCallback((nextSubject?: string) => {
    setSubject(nextSubject ?? null);
    setBrandOpen(true);
  }, []);

  const openCreatorModal = useCallback(() => setCreatorOpen(true), []);

  const value = useMemo(
    () => ({ openBrandModal, openCreatorModal }),
    [openBrandModal, openCreatorModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <BrandContactModal open={brandOpen} onOpenChange={setBrandOpen} subject={subject} />
      <CreatorApplicationModal open={creatorOpen} onOpenChange={setCreatorOpen} />
    </ModalContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals deve ser usado dentro de ModalProvider");
  return ctx;
}
