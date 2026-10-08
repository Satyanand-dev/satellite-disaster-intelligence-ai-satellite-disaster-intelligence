import { EmptyState } from '../ui/index.js'

/**
 * Placeholder for pages filled in during F4 — keeps routes working and
 * every page instantly presentable (no blank screens).
 */
export default function PageStub({ title, description, action }) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-text">{title}</h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </header>
      <EmptyState
        title="Under construction"
        description="This page is scaffolded; its content lands in the next build step (F4)."
        action={action}
      />
    </div>
  )
}
