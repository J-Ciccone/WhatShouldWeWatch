import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
import { clearReloadFlag, reloadOnceForUpdate } from "./lib/reloadOnce";

// A tab left open across a deploy can fail to load a page's code; reload to get the new version.
window.addEventListener("vite:preloadError", (event) => {
  if (reloadOnceForUpdate()) event.preventDefault();
});
window.addEventListener("load", () => setTimeout(clearReloadFlag, 10_000));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
