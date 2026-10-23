import { useEffect, useRef, type ReactNode } from "react";

/**
 * A bar pinned to the bottom of the screen for the main action of a step.
 * It publishes its height as --action-bar-height so page content and toasts
 * can stay clear of it.
 */
export function ActionBar({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el) return;
    const update = () => root.style.setProperty("--action-bar-height", `${el.offsetHeight}px`);
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(el);
    return () => {
      observer?.disconnect();
      root.style.removeProperty("--action-bar-height");
    };
  }, []);

  return (
    <div className="action-bar" ref={ref}>
      <div className="action-bar-inner">{children}</div>
    </div>
  );
}
