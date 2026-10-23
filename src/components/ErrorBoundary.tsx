import { Component, type ErrorInfo, type ReactNode } from "react";
import { isChunkLoadError, reloadOnceForUpdate } from "../lib/reloadOnce";

/** Shows a message instead of a blank page if anything below it throws while rendering. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // A page's code went missing after a deploy: reload once to get the new version.
    if (isChunkLoadError(error) && reloadOnceForUpdate()) return;
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="centered" style={{ padding: 24 }}>
        <h2>Something went wrong</h2>
        <p className="muted">Sorry about that. Head back home and try again.</p>
        <a href="/" className="btn btn-primary">
          Back to home
        </a>
      </div>
    );
  }
}
