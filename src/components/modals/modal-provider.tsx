import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const [motion, setMotion] = useState(false);
  const pointerInput = useRef(false);

  useEffect(() => {
    const onPointerDown = () => {
      pointerInput.current = true;
    };
    const onKeyDown = () => {
      pointerInput.current = false;
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const openBrandModal = useCallback((nextSubject?: string) => {
    setSubject(nextSubject ?? null);
    setMotion(pointerInput.current);
    setBrandOpen(true);
  }, []);

  const openCreatorModal = useCallback(() => {
    setMotion(pointerInput.current);
    setCreatorOpen(true);
  }, []);

  const value = useMemo(
    () => ({ openBrandModal, openCreatorModal }),
    [openBrandModal, openCreatorModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <BrandContactModal
        open={brandOpen}
        onOpenChange={setBrandOpen}
        subject={subject}
        motion={motion}
      />
      <CreatorApplicationModal open={creatorOpen} onOpenChange={setCreatorOpen} motion={motion} />
    </ModalContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals deve ser usado dentro de ModalProvider");
  return ctx;
}
