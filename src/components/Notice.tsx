import { Toast, ToastContainer } from "react-bootstrap";

/** A small auto-hiding toast in the bottom-left corner. Pass null to hide it. */
export function Notice({ message, onClose }: { message: string | null; onClose: () => void }) {
  return (
    <ToastContainer position="bottom-start" className="p-3 position-fixed">
      <Toast show={message !== null} onClose={onClose} delay={3500} autohide bg="light">
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
