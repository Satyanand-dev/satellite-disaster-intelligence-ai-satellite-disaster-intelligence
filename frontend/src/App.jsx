import { BrowserRouter } from 'react-router-dom'
import { Toasts } from './components/ui/index.js'
import AppRoutes from './routes.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Toasts />
      <AppRoutes />
    </BrowserRouter>
  )
}
