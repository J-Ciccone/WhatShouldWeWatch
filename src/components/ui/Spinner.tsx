export function Spinner({ label = "Loading…", size = "md" }: { label?: string; size?: "sm" | "md" }) {
  return (
    <span className={`spinner ${size === "sm" ? "spinner-sm" : ""}`} role="status">
      <span className="visually-hidden">{label}</span>
    </span>
  );
}

export function CenteredSpinner({ label }: { label?: string }) {
  return (
    <div className="centered">
      <Spinner label={label} />
    </div>
  );
}
