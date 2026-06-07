import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Admin auth state. The session itself lives in an HttpOnly cookie that JS
 * can't see — this store just caches the user identity and an "are we logged
 * in?" hint so the UI can render without an extra round-trip. The truth is
 * the server: every protected request will 401 if the cookie is missing
 * or revoked, and the axios interceptor redirects to /admin/login.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      // True once /admin/me has confirmed the cookie at least once this load.
      bootstrapped: false,
      setUser: (user) => set({ user, bootstrapped: true }),
      clear:   () => set({ user: null, bootstrapped: true }),
    }),
    {
      name: 'cl-auth',
      // Persist only the user identity. `bootstrapped` resets every load so
      // we always re-verify the cookie on first render.
      partialize: (s) => ({ user: s.user }),
    }
  )
)
