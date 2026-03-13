import { createContext, useContext, useState, useEffect } from 'react'
import { loginAPI, registerAPI, getMeAPI } from '../api/auth'

const AuthContext = createContext(null)

// Demo fallback when backend is unavailable
const DEMO_EMAIL = 'demo@pathao.com'
const DEMO_PHONE = '01700000000'
const DEMO_PASS = 'demo123'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const demoLoggedIn = localStorage.getItem('merchant_logged_in')

    if (token) {
      // Validate token with backend
      getMeAPI()
        .then((data) => {
          setUser(data)
          setIsAuthenticated(true)
        })
        .catch(() => {
          localStorage.removeItem('auth_token')
        })
        .finally(() => setLoading(false))
    } else if (demoLoggedIn === 'true') {
      // Demo session fallback
      const name = localStorage.getItem('merchant_name') || 'Demo User'
      setUser({ name, email: DEMO_EMAIL })
      setIsAuthenticated(true)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      await loginAPI(email, password)
      const userData = await getMeAPI()
      setUser(userData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      // Fallback to demo mode if backend is unreachable
      if ((email === DEMO_EMAIL || email === DEMO_PHONE) && password === DEMO_PASS) {
        const userData = { name: 'RedX Store', email: DEMO_EMAIL }
        localStorage.setItem('merchant_logged_in', 'true')
        localStorage.setItem('merchant_name', 'RedX Store')
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true }
      }
      return { success: false, error: err.message || 'Invalid credentials' }
    }
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
    localStorage.removeItem('auth_token')
    localStorage.removeItem('merchant_logged_in')
    localStorage.removeItem('merchant_name')
    setUser(null)
    setIsAuthenticated(false)
  }

  const register = async ({ email, password, name, phone, business_name }) => {
    try {
      await registerAPI({ email, password, name, phone, business_name })
      const userData = await getMeAPI()
      setUser(userData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' }
    }
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
