import { createContext, useContext } from "react";

export type ToastTone = "info" | "success" | "error";
export type ShowToast = (message: string, tone?: ToastTone) => void;

export const ToastContext = createContext<ShowToast>(() => {});

/**
 * Lets an open modal dialog offer itself as the place to show toasts, since
 * nothing outside a modal is visible above it. Returns an unregister function.
 */
export const ToastHostContext = createContext<(el: HTMLElement) => () => void>(() => () => {});

/** Shows a short message at the bottom of the screen. */
export function useToast(): ShowToast {
  return useContext(ToastContext);
}
