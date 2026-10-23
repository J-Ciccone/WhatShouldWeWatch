import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./auth/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { CenteredSpinner } from "./components/ui/Spinner";
import { ToastProvider } from "./components/ui/ToastProvider";
import { HomePage } from "./pages/HomePage";

// The home page loads first; the lobby screens (and the database SDK) load on demand.
const NewLobbyPage = lazy(() => import("./pages/NewLobbyPage").then((m) => ({ default: m.NewLobbyPage })));
const LobbyPage = lazy(() => import("./pages/LobbyPage").then((m) => ({ default: m.LobbyPage })));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={<CenteredSpinner />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="new" element={<NewLobbyPage />} />
                  <Route path="lobby/:code" element={<LobbyPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
