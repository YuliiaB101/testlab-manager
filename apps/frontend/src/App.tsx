import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./state/auth";
import { NotificationsProvider } from "./state/notifications";
import Header from "./components/Header/Header";
import HomePage from "./pages/HomePage/HomePage";
import MachinePage from "./pages/MachinePage/MachinePage";
import NotificationsPage from "./pages/NotificationsPage/NotificationsPage";
import AuthPage from "./pages/AuthPage/AuthPage";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, initialized } = useAuth();
  if (!initialized) return null; // still checking auth
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                  <Header />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="machines/:id" element={<MachinePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationsProvider>
    </AuthProvider>
  );
}
