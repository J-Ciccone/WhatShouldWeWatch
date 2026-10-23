import { Copy, Share2 } from "lucide-react";
import { inviteUrl, shareInvite } from "../lib/invite";
import { Dialog } from "./ui/Dialog";
import { QrCode } from "./ui/QrCode";
import { useToast } from "./ui/toastContext";

export function InviteDialog({ code, open, onClose }: { code: string; open: boolean; onClose: () => void }) {
  const toast = useToast();
  const url = inviteUrl(code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast("Invite link copied!", "success");
    } catch {
      toast("Couldn't copy. Share the code instead.", "error");
    }
  };

  const share = async () => {
    const result = await shareInvite(code);
    if (result === "copied") toast("Invite link copied!", "success");
    if (result === "failed") toast(`Couldn't share. Tell your friends the code: ${code}`, "error");
  };

  return (
    <Dialog open={open} onClose={onClose} title="Invite friends">
      <p className="muted" style={{ textAlign: "center" }}>
        Scan the code, open the link, or type this code on the home page.
      </p>
      <div className="invite-code" aria-label={`Lobby code ${code.split("").join(" ")}`}>
        {code}
      </div>
      <div className="qr">
        <QrCode value={url} label={`QR code for ${url}`} />
      </div>
      <div className="invite-actions">
        <button type="button" className="btn" onClick={copy}>
          <Copy size={18} /> Copy link
        </button>
        <button type="button" className="btn btn-primary" onClick={share}>
          <Share2 size={18} /> Share
        </button>
      </div>
    </Dialog>
  );
}
