import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DeliveriesPage from './pages/DeliveriesPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CreateParcelPage from './pages/CreateParcelPage'
import StoresPage from './pages/StoresPage'
import AnalyticsPage from './pages/AnalyticsPage'
import PaymentsPage from './pages/PaymentsPage'
import SettingsPage from './pages/SettingsPage'
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
              <Route path="/deliveries/new" element={<CreateParcelPage />} />
              <Route path="/deliveries/:orderId" element={<OrderDetailPage />} />
              <Route path="/orders" element={<Navigate to="/deliveries" replace />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

