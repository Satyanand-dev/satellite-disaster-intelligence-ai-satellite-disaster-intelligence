import { Link } from 'react-router-dom'
import { Button } from '../components/ui/index.js'

export default function Forbidden() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-6xl font-bold text-critical/40">403</p>
      <h1 className="mt-3 text-lg font-semibold text-text">Access denied</h1>
      <p className="mt-1 max-w-md text-sm text-muted">
        Your account does not have permission to view this resource.
      </p>
      <Link to="/dashboard" className="mt-5">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  )
}
