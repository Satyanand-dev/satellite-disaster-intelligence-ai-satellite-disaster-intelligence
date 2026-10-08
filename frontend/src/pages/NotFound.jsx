import { Link } from 'react-router-dom'
import { Button } from '../components/ui/index.js'

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-6xl font-bold text-accent/30">404</p>
      <h1 className="mt-3 text-lg font-semibold text-text">Page not found</h1>
      <p className="mt-1 max-w-md text-sm text-muted">
        The page you are looking for does not exist or was moved.
      </p>
      <Link to="/dashboard" className="mt-5">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
