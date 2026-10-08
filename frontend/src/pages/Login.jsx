import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Input } from '../components/ui/index.js'
import { useAuthStore } from '../store/authStore.js'

export default function Login() {
  const { user, login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={location.state?.from ?? '/dashboard'} replace />

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!email.trim()) errs.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = 'Enter a valid email address.'
    if (!password) errs.password = 'Password is required.'
    setFieldErrors(errs)
    setError(null)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    // Simulated request — replaced by POST /api/v1/auth/login in the backend phase.
    window.setTimeout(() => {
      const result = login(email, password)
      setLoading(false)
      if (result.ok) navigate(location.state?.from ?? '/dashboard', { replace: true })
      else setError(result.error)
    }, 450)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <h2 className="text-base font-semibold text-text">Sign in</h2>
        <p className="mt-0.5 text-xs text-muted">Access the disaster intelligence dashboard</p>
      </div>

      {error && <Alert variant="error" title="Sign-in failed">{error}</Alert>}

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="analyst@demo.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
      />

      <Button type="submit" loading={loading} className="w-full">
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>

      <div className="rounded-md border border-border bg-panel2 px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Demo credentials</p>
        <p className="mt-1 font-mono text-xs text-text">analyst@demo.com</p>
        <p className="font-mono text-xs text-text">demo1234</p>
      </div>
    </form>
  )
}
