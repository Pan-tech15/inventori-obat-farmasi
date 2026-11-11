import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const session = JSON.parse(localStorage.getItem("session") || "null");
  if (!session) return <Navigate to="/login" replace />;
  if (allowedRole && session.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
