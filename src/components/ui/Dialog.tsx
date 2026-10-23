import { X } from "lucide-react";
import { useContext, useEffect, useId, useRef, type ReactNode } from "react";
import { ToastHostContext } from "./toastContext";

interface Props {
  open: boolean;
  /** Omit to make the dialog impossible to dismiss (Esc and backdrop clicks do nothing). */
  onClose?: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}

/** A modal built on the native <dialog> element: focus trapping and Esc come for free. */
export function Dialog({ open, onClose, title, children, wide }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const toastHost = useRef<HTMLDivElement>(null);
  const registerToastHost = useContext(ToastHostContext);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // A modal dialog sits above everything else on the page, so toasts raised
  // while it's open are shown inside it.
  useEffect(() => {
    if (!open || !toastHost.current) return;
    return registerToastHost(toastHost.current);
  }, [open, registerToastHost]);

  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? "dialog-wide" : ""}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Esc: let React state decide whether the dialog closes.
        e.preventDefault();
        onClose?.();
      }}
      onClose={() => {
        // Browsers don't always let a page cancel Esc/back (e.g. before any tap),
        // so the dialog can close natively. Keep React in sync: tell the owner,
        // or re-open a dialog that must not be dismissed.
        if (!open) return;
        if (onClose) onClose();
        else ref.current?.showModal();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose?.();
      }}
    >
      {open && (
        <div className="dialog-inner">
          <div className="dialog-header">
            <h2 id={titleId}>{title}</h2>
            {onClose && (
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            )}
          </div>
          {children}
        </div>
      )}
      <div ref={toastHost} />
    </dialog>
  );
}
