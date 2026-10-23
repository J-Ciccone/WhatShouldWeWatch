import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Route, Routes, useLocation, useNavigationType } from "react-router";
import { AuthContext } from "../auth/AuthContext";
import { ToastProvider } from "../components/ui/ToastProvider";

function LocationProbe() {
  const location = useLocation();
  const navigationType = useNavigationType();
  return (
    <>
      <output data-testid="location">{location.pathname}</output>
      <output data-testid="nav-type">{navigationType}</output>
    </>
  );
}

/**
 * Renders a component with the app's providers: router (at `route`), toasts and a
 * signed-in user. The current path is exposed as data-testid="location", and
 * `rerender` keeps the providers.
 */
export function renderWithApp(ui: ReactElement, { route = "/", path = "*", uid = "me" } = {}) {
  function Providers({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>
          <AuthContext value={uid}>
            <Routes>
              <Route path={path} element={children} />
              <Route path="*" element={null} />
            </Routes>
            <LocationProbe />
          </AuthContext>
        </ToastProvider>
      </MemoryRouter>
    );
  }
  return render(ui, { wrapper: Providers });
}
