import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ToastContext, ToastHostContext, type ToastTone } from "./toastContext";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

const DURATION_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Open modal dialogs, innermost last; toasts render inside the top one.
  const [hosts, setHosts] = useState<HTMLElement[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = ++nextId.current;
      // Keep at most three on screen; the newest wins.
      setToasts((list) => [...list.slice(-2), { id, message, tone }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION_MS),
      );
    },
    [dismiss],
  );

  const registerHost = useCallback((el: HTMLElement) => {
    setHosts((list) => [...list, el]);
    return () => setHosts((list) => list.filter((h) => h !== el));
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const list = (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>
          <p>{t.message}</p>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
  const host = hosts.at(-1);

  return (
    <ToastContext value={show}>
      <ToastHostContext value={registerHost}>
        {children}
        {host ? createPortal(list, host) : list}
      </ToastHostContext>
    </ToastContext>
  );
}
