import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

/**
 * Verifies the admin cookie on mount by calling /admin/me. While the check
 * is in flight we render nothing (avoids a flash of the login page for an
 * admin who refreshes). On 401 we redirect to login.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const { user, setUser, clear } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-me'],
    queryFn: () => adminApi.me().then(r => r.data),
    retry: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (data?.user) setUser(data.user)
    else if (isError) clear()
  }, [data, isError, setUser, clear])

  // While we don't know the answer yet, keep the previous cached user
  // (if any) and render the children to avoid a flash. If there's no
  // cached user, render nothing until we get a response.
  if (isLoading && !user) return null

  if (isError) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return children
}
