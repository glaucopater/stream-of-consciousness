import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ModalState =
  | { type: "alert"; message: string; resolve: () => void }
  | { type: "confirm"; message: string; resolve: (confirmed: boolean) => void };

interface AppModalContextValue {
  showConfirm: (message: string) => Promise<boolean>;
  showModal: (message: string) => Promise<void>;
}

const AppModalContext = createContext<AppModalContextValue | null>(null);

export function useAppModal() {
  const context = useContext(AppModalContext);
  if (!context) {
    throw new Error("useAppModal must be used within AppModalProvider");
  }
  return context;
}

function AppModalDialog({
  modal,
  onClose,
}: {
  modal: ModalState;
  onClose: () => void;
}) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback(
    (confirmed?: boolean) => {
      if (modal.type === "confirm") {
        modal.resolve(confirmed ?? false);
      } else {
        modal.resolve();
      }
      onClose();
    },
    [modal, onClose],
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [dismiss]);

  useEffect(() => {
    if (modal.type === "confirm") {
      confirmButtonRef.current?.focus();
    }
  }, [modal.type]);

  const title = modal.type === "confirm" ? "Confirm" : "Message";

  return (
    <div className="app-modal-overlay" onMouseDown={() => dismiss(false)}>
      <div
        className="app-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="app-modal-header">
          <h2>{title}</h2>
        </header>
        <div className="app-modal-body">
          <p>{modal.message}</p>
        </div>
        <footer className="app-modal-footer">
          {modal.type === "confirm" ? (
            <>
              <button
                className="app-modal-cancel"
                type="button"
                onClick={() => dismiss(false)}
              >
                Cancel
              </button>
              <button
                ref={confirmButtonRef}
                className="app-modal-confirm"
                type="button"
                onClick={() => dismiss(true)}
              >
                Confirm
              </button>
            </>
          ) : (
            <button
              className="app-modal-confirm"
              type="button"
              onClick={() => dismiss()}
            >
              OK
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export function AppModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null);

  const showModal = useCallback((message: string) => {
    return new Promise<void>((resolve) => {
      setModal({ type: "alert", message, resolve });
    });
  }, []);

  const showConfirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setModal({ type: "confirm", message, resolve });
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <AppModalContext.Provider value={{ showModal, showConfirm }}>
      {children}
      {modal ? <AppModalDialog modal={modal} onClose={closeModal} /> : null}
    </AppModalContext.Provider>
  );
}
