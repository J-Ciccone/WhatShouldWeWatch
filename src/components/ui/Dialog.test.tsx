import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";
import { useToast } from "./toastContext";
import { ToastProvider } from "./ToastProvider";

// The jsdom stand-in's close() doesn't fire "close", so tests dispatch it the way a browser would.
function closeNatively(dialog: HTMLDialogElement) {
  dialog.close();
  fireEvent(dialog, new Event("close"));
}

describe("Dialog", () => {
  it("re-opens a must-answer dialog when the browser closes it (Esc or Android back)", () => {
    // Regression: Chrome ignores preventDefault on Esc without a prior tap, which left
    // invited friends stuck with no name prompt.
    render(
      <Dialog open title="Join">
        <p>x</p>
      </Dialog>,
    );
    const dialog = document.querySelector("dialog")!;
    closeNatively(dialog);
    expect(dialog).toHaveAttribute("open");
  });

  it("tells the owner when the browser closes a dismissable dialog", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="Info">
        <p>x</p>
      </Dialog>,
    );
    closeNatively(document.querySelector("dialog")!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("doesn't report a close it caused itself", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Dialog open onClose={onClose} title="Info">
        <p>x</p>
      </Dialog>,
    );
    rerender(
      <Dialog open={false} onClose={onClose} title="Info">
        <p>x</p>
      </Dialog>,
    );
    fireEvent(document.querySelector("dialog")!, new Event("close"));
    expect(onClose).not.toHaveBeenCalled();
  });
});

function ToastButton() {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast("Copied!")}>
      Copy
    </button>
  );
}

describe("toasts and dialogs", () => {
  it("shows toasts inside an open dialog, where they're visible above the backdrop", async () => {
    // Regression: toasts rendered behind the modal's top layer, so "Invite link copied!" was invisible.
    const user = userEvent.setup();
    const { rerender } = render(
      <ToastProvider>
        <Dialog open onClose={() => {}} title="Invite">
          <ToastButton />
        </Dialog>
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Copy" }));
    const dialog = document.querySelector("dialog")!;
    expect(dialog).toContainElement(screen.getByText("Copied!"));

    rerender(
      <ToastProvider>
        <Dialog open={false} onClose={() => {}} title="Invite">
          <ToastButton />
        </Dialog>
      </ToastProvider>,
    );
    expect(dialog).not.toContainElement(screen.getByText("Copied!"));
  });
});
