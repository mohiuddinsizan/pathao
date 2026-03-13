import { Settings as SettingsIcon, Bell, Lock, User, LogOut } from 'lucide-react'
import Layout from '../components/Layout'
import styles from './Settings.module.css'

export default function Settings() {
  return (
    <Layout activePage="settings">
      <div className={styles.container}>
      <header className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </header>

      <div className={styles.settingsGrid}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <User size={20} color="#EF4444" />
            <h3>Account Settings</h3>
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.label}>Store Name</div>
              <div className={styles.value}>RedX Store</div>
            </div>
            <button className={styles.editBtn}>Edit</button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.label}>Email Address</div>
              <div className={styles.value}>redx@pathao.com</div>
            </div>
            <button className={styles.editBtn}>Edit</button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.label}>Phone Number</div>
              <div className={styles.value}>+880 1700-000000</div>
            </div>
            <button className={styles.editBtn}>Edit</button>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Lock size={20} color="#3B82F6" />
            <h3>Security</h3>
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.label}>Password</div>
              <div className={styles.value}>••••••••</div>
            </div>
            <button className={styles.editBtn}>Change</button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.label}>Two-Factor Authentication</div>
              <div className={styles.value}>Not Enabled</div>
            </div>
            <button className={styles.editBtn}>Enable</button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.label}>Active Sessions</div>
              <div className={styles.value}>2 devices</div>
            </div>
            <button className={styles.editBtn}>Manage</button>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Bell size={20} color="#F59E0B" />
            <h3>Notifications</h3>
          </div>
          <div className={styles.toggleItem}>
            <div>
              <div className={styles.label}>Email Notifications</div>
              <div className={styles.value}>Receive order updates via email</div>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" defaultChecked />
              <span className={styles.slider}></span>
            </label>
          </div>
          <div className={styles.toggleItem}>
            <div>
              <div className={styles.label}>SMS Alerts</div>
              <div className={styles.value}>Get important alerts via SMS</div>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" defaultChecked />
              <span className={styles.slider}></span>
            </label>
          </div>
          <div className={styles.toggleItem}>
            <div>
              <div className={styles.label}>In-App Notifications</div>
              <div className={styles.value}>Show notifications in app</div>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" defaultChecked />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <SettingsIcon size={20} color="#10B981" />
            <h3>General Preferences</h3>
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.label}>Language</div>
              <div className={styles.value}>Bengali</div>
            </div>
            <button className={styles.editBtn}>Change</button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.label}>Timezone</div>
              <div className={styles.value}>Bangladesh Time (GMT+6)</div>
            </div>
            <button className={styles.editBtn}>Change</button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.label}>Theme</div>
              <div className={styles.value}>Dark</div>
            </div>
            <button className={styles.editBtn}>Change</button>
          </div>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3>Danger Zone</h3>
        <button className={styles.logoutBtn}>
          <LogOut size={16} />
          Log Out
        </button>
        <button className={styles.deleteBtn}>Delete Account</button>
      </div>
      </div>
    </Layout>
  )
}
