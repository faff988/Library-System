import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Wrap a route's element with this to require login, and optionally
// restrict it to specific roles, e.g.:
//   <Route path="/staff" element={<ProtectedRoute roles={["admin"]}><Staff /></ProtectedRoute>} />
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const allowed = roles.map((r) => r.toLowerCase());
    if (!role || !allowed.includes(role.toLowerCase())) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}