import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const loggedIn = localStorage.getItem('merchant_logged_in')
    const merchantName = localStorage.getItem('merchant_name')
    if (loggedIn === 'true' && merchantName) {
      setUser({ name: merchantName, email: 'demo@pathao.com' })
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Demo credentials check
    const DEMO_EMAIL = 'demo@pathao.com'
    const DEMO_PHONE = '01700000000'
    const DEMO_PASS = 'demo123'

    if ((email === DEMO_EMAIL || email === DEMO_PHONE) && password === DEMO_PASS) {
      const userData = { name: 'RedX Store', email: DEMO_EMAIL }
      localStorage.setItem('merchant_logged_in', 'true')
      localStorage.setItem('merchant_name', 'RedX Store')
      setUser(userData)
      setIsAuthenticated(true)
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials. Try: demo@pathao.com / demo123' }
  }

  const loginWithGoogle = () => {
    const userData = { name: 'Google User', email: 'user@gmail.com' }
    localStorage.setItem('merchant_logged_in', 'true')
    localStorage.setItem('merchant_name', 'Google User')
    setUser(userData)
    setIsAuthenticated(true)
    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem('merchant_logged_in')
    localStorage.removeItem('merchant_name')
    setUser(null)
    setIsAuthenticated(false)
  }

  const register = (phone) => {
    // Simulate OTP sent
    return { success: true, message: 'OTP sent to ' + phone }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000'
      }}>
        <div style={{ color: '#EF4444', fontSize: '24px', fontWeight: 700 }}>Loading...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginWithGoogle, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
