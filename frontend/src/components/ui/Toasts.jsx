import { Toaster } from 'react-hot-toast'

/**
 * Global toast host — mount once in the AppShell.
 * For firing notifications import { toast } from './toast.js'.
 */
export default function Toasts() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#16213A',
          color: '#E6EDF7',
          border: '1px solid #1E2A44',
          borderRadius: '8px',
          fontSize: '13px',
          boxShadow: '0 4px 16px rgba(0,0,0,.4)',
        },
        success: { iconTheme: { primary: '#22C55E', secondary: '#16213A' } },
        error: { iconTheme: { primary: '#EF4444', secondary: '#16213A' } },
      }}
    />
  )
}
