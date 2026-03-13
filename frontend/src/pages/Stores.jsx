import { useState } from 'react'
import { MapPin, Plus, Edit2, Trash2, Settings, Globe, Phone } from 'lucide-react'
import Layout from '../components/Layout'
import styles from './Stores.module.css'
import { STORES_DATA, DELIVERIES_DATA, ANALYTICS_STATS } from '../data/constants'

export default function Stores() {
  const storesData = STORES_DATA.map((store, idx) => {
    const deliveries = DELIVERIES_DATA.filter((delivery) => delivery.store === store.id)
    const revenue = deliveries.reduce((sum, item) => sum + (item.amount || 0), 0)
    return {
      id: store.id,
      name: store.name,
      address: store.location,
      phone: `+880 1700-00${idx}${idx}${idx}${idx}`,
      email: `store${store.id}@isdproject.com`,
      status: idx === 2 ? 'inactive' : 'active',
      deliveries: deliveries.length,
      revenue: `৳ ${revenue.toLocaleString()}`,
      employees: 4 + idx,
      established: '2024-01-15',
    }
  })
  const [showModal, setShowModal] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })

  const handleCreateStore = () => {
    setSelectedStore(null)
    setFormData({ name: '', address: '', phone: '', email: '' })
    setShowModal(true)
  }

  const handleEditStore = (store) => {
    setSelectedStore(store)
    setFormData({
      name: store.name,
      address: store.address,
      phone: store.phone,
      email: store.email,
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedStore(null)
    setFormData({ name: '', address: '', phone: '', email: '' })
  }

  const handleSaveStore = () => {
    // In a real app, this would save to backend
    console.log('Saving store:', selectedStore ? 'Update' : 'Create', formData)
    handleCloseModal()
  }

  return (
    <Layout activePage="stores">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1>Manage Stores</h1>
            <p>Create and manage your store locations</p>
          </div>
          <button className={styles.createBtn} onClick={handleCreateStore}>
            <Plus size={18} />
            Create New Store
          </button>
        </header>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.label}>Total Stores</span>
            <span className={styles.value}>{storesData.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.label}>Active Stores</span>
            <span className={styles.value} style={{ color: '#10B981' }}>
              {storesData.filter(s => s.status === 'active').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.label}>Total Deliveries</span>
            <span className={styles.value}>
              {storesData.reduce((sum, s) => sum + s.deliveries, 0)}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.label}>Total Revenue</span>
            <span className={styles.value}>৳ {ANALYTICS_STATS.totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.storesGrid}>
          {storesData.map((store) => (
            <div key={store.id} className={styles.storeCard}>
              <div className={styles.storeHeader}>
                <div>
                  <h3>{store.name}</h3>
                  <span className={`${styles.status} ${styles[store.status]}`}>
                    {store.status === 'active' ? '● Active' : '● Inactive'}
                  </span>
                </div>
                <div className={styles.actions}>
                  <button className={styles.iconBtn} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className={styles.iconBtn} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.storeInfo}>
                <div className={styles.infoRow}>
                  <MapPin size={14} />
                  <span>{store.address}</span>
                </div>
                <div className={styles.infoRow}>
                  <Phone size={14} />
                  <span style={{ fontSize: '12px', color: '#888' }}>{store.phone}</span>
                </div>
                <div className={styles.infoRow}>
                  <Globe size={14} />
                  <span>{store.email}</span>
                </div>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.label}>Deliveries</span>
                  <span className={styles.number}>{store.deliveries}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.label}>Revenue</span>
                  <span className={styles.number}>{store.revenue}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.label}>Staff</span>
                  <span className={styles.number}>{store.employees}</span>
                </div>
              </div>

              <button className={styles.settingsBtn}>
                <Settings size={14} />
                Store Settings
              </button>
            </div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>{selectedStore ? 'Edit Store' : 'Create New Store'}</h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>✕</button>
              </div>

              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Store Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., RedX Store Banani"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Address</label>
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Full address"
                    rows="3"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+880 17..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="store@example.com"
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button className={styles.saveBtn} onClick={handleSaveStore}>
                    {selectedStore ? 'Update Store' : 'Create Store'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
