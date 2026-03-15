import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import Placeholder from './pages/Placeholder'
import AnalyticsPage from './pages/AnalyticsPage'
import DeliveriesPage from './pages/DeliveriesPage'
import AppShell from './components/AppShell'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './hooks/use-theme'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/deliveries" element={<DeliveriesPage />} />
              <Route path="/orders" element={<Navigate to="/deliveries" replace />} />
              <Route path="/stores" element={<Placeholder />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/payments" element={<Placeholder />} />
              <Route path="/settings" element={<Placeholder />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
