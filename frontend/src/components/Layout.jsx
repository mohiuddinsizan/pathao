import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Home, Package, Truck, BarChart3, CreditCard, HelpCircle, Settings,
  ChevronRight, Star, Store
} from 'lucide-react'
import Navbar from './Navbar'
import styles from './Layout.module.css'
import { DELIVERIES_DATA } from '../data/constants'

export default function Layout({ children, activePage }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleNavClick = (page, path) => {
    navigate(path)
  }

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo} onClick={() => navigate('/dashboard')}>
          <div className={styles.logoIcon}>
            <Star size={18} fill="white" stroke="white" />
          </div>
          <span>PATHAO</span>
        </div>

        <nav className={styles.nav}>
          <div 
            className={`${styles.navItem} ${activePage === 'dashboard' ? styles.active : ''}`}
            onClick={() => handleNavClick('dashboard', '/dashboard')}
          >
            <Home size={18} />
            Dashboard
          </div>
          <div 
            className={`${styles.navItem} ${activePage === 'deliveries' ? styles.active : ''}`}
            onClick={() => handleNavClick('deliveries', '/deliveries')}
          >
            <Package size={18} />
            Deliveries
            <span className={styles.navBadge}>{DELIVERIES_DATA.length}</span>
          </div>
          <div 
            className={`${styles.navItem} ${activePage === 'stores' ? styles.active : ''}`}
            onClick={() => handleNavClick('stores', '/stores')}
          >
            <Store size={18} />
            Stores
          </div>
          <div 
            className={`${styles.navItem} ${activePage === 'payments' ? styles.active : ''}`}
            onClick={() => handleNavClick('payments', '/payments')}
          >
            <CreditCard size={18} />
            Payments
          </div>
          <div 
            className={`${styles.navItem} ${activePage === 'analytics' ? styles.active : ''}`}
            onClick={() => handleNavClick('analytics', '/analytics')}
          >
            <BarChart3 size={18} />
            Analytics
          </div>
          <div className={styles.navDivider} />
          <div 
            className={`${styles.navItem} ${activePage === 'settings' ? styles.active : ''}`}
            onClick={() => handleNavClick('settings', '/settings')}
          >
            <Settings size={18} />
            Settings
          </div>
          <div 
            className={`${styles.navItem} ${activePage === 'support' ? styles.active : ''}`}
            onClick={() => handleNavClick('support', '/support')}
          >
            <HelpCircle size={18} />
            Support
          </div>
        </nav>

        <div className={styles.profile} onClick={() => handleNavClick('settings', '/settings')}>
          <div className={styles.avatar}>
            {user?.name?.substring(0, 2).toUpperCase() || 'RX'}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{user?.name || 'RedX Store'}</span>
            <span className={styles.profileEmail}>Merchant Account</span>
          </div>
          <ChevronRight size={16} className={styles.profileArrow} />
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <Navbar />
        
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}
