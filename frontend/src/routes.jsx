import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import Analysis from './pages/Analysis.jsx'
import ChangeDetection from './pages/ChangeDetection.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Forbidden from './pages/Forbidden.jsx'
import Indices from './pages/Indices.jsx'
import Infrastructure from './pages/Infrastructure.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import Processing from './pages/Processing.jsx'
import Report from './pages/Report.jsx'
import RiskMap from './pages/RiskMap.jsx'
import UiKit from './pages/UiKit.jsx'
import Upload from './pages/Upload.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* public */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route path="/_ui" element={<UiKit />} />

      {/* protected */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/processing/:jobId" element={<Processing />} />
        <Route path="/analysis/:eventId" element={<Analysis />} />
        <Route path="/indices/:eventId" element={<Indices />} />
        <Route path="/change/:eventId" element={<ChangeDetection />} />
        <Route path="/infrastructure/:eventId" element={<Infrastructure />} />
        <Route path="/risk/:eventId" element={<RiskMap />} />
        <Route path="/report/:eventId" element={<Report />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
