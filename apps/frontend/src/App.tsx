import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./state/auth";
import { NotificationsProvider } from "./state/notifications";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage/HomePage";
import MachinePage from "./pages/MachinePage/MachinePage";
import NotificationsPage from "./pages/NotificationsPage/NotificationsPage";
import AuthPage from "./pages/AuthPage/AuthPage";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
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
                <Layout />
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
