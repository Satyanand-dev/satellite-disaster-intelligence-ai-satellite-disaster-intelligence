import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEMO_CREDENTIALS = { email: 'analyst@demo.com', password: 'demo1234' }

const DEMO_USER = {
  id: 'u_1',
  name: 'Demo Analyst',
  email: 'analyst@demo.com',
  role: 'analyst',
}

/**
 * Mock auth store — same shape a real JWT flow will have (plan.md §F).
 * F2 backend swaps `login()` for POST /api/v1/auth/login without touching UI.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,

      login(email, password) {
        const e = String(email ?? '').trim().toLowerCase()
        const p = String(password ?? '')
        if (!e || !p) return { ok: false, error: 'Email and password are required.' }
        if (e === DEMO_CREDENTIALS.email && p === DEMO_CREDENTIALS.password) {
          set({ user: DEMO_USER })
          return { ok: true }
        }
        return { ok: false, error: 'Invalid email or password.' }
      },

      logout() {
        set({ user: null })
      },
    }),
    { name: 'sdi-auth' },
  ),
)
