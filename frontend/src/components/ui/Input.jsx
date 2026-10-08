import clsx from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, hint, id, className, required = false, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-muted">
          {label}
          {required && <span className="text-critical ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        className={clsx(
          'h-10 w-full rounded-md border bg-panel2 px-3 text-sm text-text placeholder:text-muted/60',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60',
          error ? 'border-critical' : 'border-border',
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-critical">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
})

export default Input
