import { MapPin, Phone, Package, Clock } from 'lucide-react'
import Layout from '../components/Layout'
import styles from './Pickups.module.css'

const pickupsData = [
  { time: '10:30 AM', merchant: 'RedX Store', address: '123 Main Street, Dhanmondi', items: 15, status: 'pending' },
  { time: '11:15 AM', merchant: 'Fashion Plus', address: '45 Paradise Road, Banani', items: 8, status: 'picked' },
  { time: '2:00 PM', merchant: 'Electronics Hub', address: '78 Tech Park, Gulshan', items: 22, status: 'scheduled' },
  { time: '3:30 PM', merchant: 'Gift World', address: '56 Shop Lane, Mirpur', items: 12, status: 'scheduled' },
]

export default function Pickups() {
  return (
    <Layout activePage="pickups">
      <div className={styles.container}>
      <header className={styles.header}>
        <h1>Today's Pickups</h1>
        <div className={styles.date}>{new Date().toLocaleDateString()}</div>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Total Pickups</span>
          <span className={styles.value}>4</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Pending</span>
          <span className={styles.value} style={{ color: '#F59E0B' }}>1</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Completed</span>
          <span className={styles.value} style={{ color: '#10B981' }}>1</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Scheduled</span>
          <span className={styles.value} style={{ color: '#3B82F6' }}>2</span>
        </div>
      </div>

      <div className={styles.pickupsList}>
        {pickupsData.map((pickup, idx) => (
          <div key={idx} className={styles.pickupCard}>
            <div className={styles.left}>
              <div className={styles.time}>
                <Clock size={20} color="#EF4444" />
                <span>{pickup.time}</span>
              </div>
              <div className={styles.merchant}>{pickup.merchant}</div>
              <div className={styles.address}>
                <MapPin size={14} color="#888" />
                <span>{pickup.address}</span>
              </div>
            </div>
            <div className={styles.middle}>
              <div className={styles.items}>
                <Package size={16} color="#888" />
                <span>{pickup.items} items</span>
              </div>
            </div>
            <div className={styles.right}>
              <span className={`${styles.status} ${styles[pickup.status]}`}>
                {pickup.status === 'pending' && '⏳ Pending'}
                {pickup.status === 'picked' && '✓ Picked'}
                {pickup.status === 'scheduled' && '📅 Scheduled'}
              </span>
              <button className={styles.actionBtn}>
                {pickup.status === 'pending' ? 'Assign Rider' : 'View Details'}
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </Layout>
  )
}
