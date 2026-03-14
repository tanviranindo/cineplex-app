import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import PageSkeleton from "./PageSkeleton";

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const authReady = useAuthStore((s) => s.authReady)
  if (!authReady) return <PageSkeleton />
  if (!user) return <Navigate to="/login" replace />
  return children
}
