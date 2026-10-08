import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'

/** Blocks routes until the (mock) session exists. */
export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}
