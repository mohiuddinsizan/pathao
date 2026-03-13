import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, Bell, Plus, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import styles from './Navbar.module.css'
import { DELIVERY_NOTIFICATIONS, getStatusColor, getStatusText } from '../data/constants'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleNewDelivery = () => {
    navigate('/deliveries')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openNewDeliveryModal'))
    }, 100)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setShowUserMenu(false)
  }

  const handleMenuClick = (action) => {
    if (action === 'profile') navigate('/settings')
    if (action === 'settings') navigate('/settings')
    if (action === 'logout') handleLogout()
    setShowUserMenu(false)
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <div className={styles.searchBar}>
          <Search size={16} />
          <input type="text" placeholder="Search deliveries, customers..." />
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.newDeliveryBtn} onClick={handleNewDelivery}>
          <Plus size={18} />
          New Delivery
        </button>

        <div className={styles.notificationWrapper}>
          <button
            className={styles.notificationBtn}
            title="Notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell size={20} />
            <span className={styles.badge}>{DELIVERY_NOTIFICATIONS.length}</span>
          </button>

          {showNotifications && (
            <div className={styles.notificationPanel}>
              <div className={styles.notificationHeader}>
                <h4>Delivery Updates</h4>
                <button
                  className={styles.clearBtn}
                  onClick={() => setShowNotifications(false)}
                >
                  Close
                </button>
              </div>
              <div className={styles.notificationList}>
                {DELIVERY_NOTIFICATIONS.map((note) => (
                  <div key={note.id} className={styles.notificationItem}>
                    <div className={styles.notificationMeta}>
                      <span className={styles.notificationTitle}>{note.title}</span>
                      <span className={styles.notificationTime}>{note.time}</span>
                    </div>
                    <p className={styles.notificationMessage}>{note.message}</p>
                    <span
                      className={styles.notificationStatus}
                      style={{
                        color: getStatusColor(note.status),
                        backgroundColor: `${getStatusColor(note.status)}20`,
                      }}
                    >
                      {getStatusText(note.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.userMenuWrapper}>
          <button
            className={styles.userMenuBtn}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className={styles.avatar}>{user?.name?.charAt(0) || 'R'}</div>
            <span className={styles.userName}>{user?.name || 'RedX Store'}</span>
            <ChevronDown size={16} className={showUserMenu ? styles.chevronOpen : ''} />
          </button>

          {showUserMenu && (
            <div className={styles.userDropdown}>
              <button
                className={styles.menuItem}
                onClick={() => handleMenuClick('profile')}
              >
                <User size={16} />
                Profile
              </button>
              <button
                className={styles.menuItem}
                onClick={() => handleMenuClick('settings')}
              >
                <Settings size={16} />
                Settings
              </button>
              <hr className={styles.divider} />
              <button
                className={styles.menuItem}
                onClick={() => handleMenuClick('logout')}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
