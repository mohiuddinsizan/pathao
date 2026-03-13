import { useState, useEffect } from 'react'
import { Package, Phone, User, MapPin, X, Eye, Truck, CheckCircle, Store, Box, FileText, AlertTriangle, Scale, DollarSign, MessageSquare } from 'lucide-react'
import Layout from '../components/Layout'
import styles from './Orders.module.css'
import {
  DELIVERIES_DATA,
  STATUS_PROGRESSION,
  getStatusColor,
  getStatusText,
  getStore,
  getDriver,
  STORES_DATA,
} from '../data/constants'

const parcelOptions = [
  { id: 'document', label: 'Document', desc: 'Up to 0.5kg', icon: FileText },
  { id: 'small', label: 'Small Box', desc: 'Up to 2kg', icon: Box },
  { id: 'medium', label: 'Medium Parcel', desc: 'Up to 5kg', icon: Package },
  { id: 'fragile', label: 'Fragile', desc: 'Handle with care', icon: AlertTriangle },
]


const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#f0fdf4',
        border: '2px solid #22c55e',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CheckCircle size={20} style={{ color: '#22c55e' }} />
      <span style={{ color: '#166534', fontWeight: '500' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#22c55e',
          padding: '0',
          marginLeft: '8px',
        }}
      >
        <X size={18} />
      </button>
    </div>
  )
}

const StatusTimeline = ({ status }) => {
  const getStatusIndex = (status) => STATUS_PROGRESSION.indexOf(status)
  const currentIndex = getStatusIndex(status)

  return (
    <div style={{ marginTop: '24px' }}>
      <h4 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
        Status Timeline
      </h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {STATUS_PROGRESSION.map((step, idx) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: idx <= currentIndex ? '#3b82f6' : '#e5e7eb',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              {idx <= currentIndex ? '✓' : idx + 1}
            </div>
            {idx < STATUS_PROGRESSION.length - 1 && (
              <div
                style={{
                  width: '24px',
                  height: '2px',
                  backgroundColor: idx < currentIndex ? '#3b82f6' : '#e5e7eb',
                  margin: '0 4px',
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
        Current Status: <span style={{ fontWeight: '600', color: '#1f2937' }}>{getStatusText(status)}</span>
      </div>
    </div>
  )
}

const DeliveryViewModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null

  const store = getStore(order.store)
  const driver = getDriver(order.driver)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0b0b0b',
          border: '1px solid #222',
          borderRadius: '12px',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          color: '#e5e7eb',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderBottom: '1px solid #222',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#f9fafb' }}>
            Delivery Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              color: '#9ca3af',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* General Info Section */}
        <div style={{ padding: '20px', borderBottom: '2px solid #222', backgroundColor: '#111' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#e5e7eb', marginTop: 0, marginBottom: '16px' }}>
            General Information
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}
          >
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>Store</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#f9fafb', margin: 0 }}>
                {store?.name} - {store?.branch}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>Delivery ID</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#f9fafb', margin: 0 }}>
                {order.id}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>Amount</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: 0 }}>
                ৳ {order.amount}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>Status</p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: getStatusColor(order.status) + '20',
                  color: getStatusColor(order.status),
                }}
              >
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #222' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px 0' }}>Assigned Driver</p>
            {driver ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Truck size={20} style={{ color: '#0284c7' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#f9fafb', margin: '0 0 2px 0' }}>
                    {driver.name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{driver.phone}</p>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>No driver assigned yet</p>
            )}
          </div>
        </div>

        {/* Two Column Section: Recipient Info | Parcel Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1px 1fr',
            gap: '0',
            padding: '20px',
            borderBottom: '1px solid #222',
          }}
        >
          {/* Recipient Information */}
          <div style={{ paddingRight: '20px' }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#e5e7eb',
                marginBottom: '16px',
                marginTop: 0,
              }}
            >
              Recipient Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <User size={16} style={{ color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>Name</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#f9fafb', margin: 0 }}>
                    {order.recipient}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Phone size={16} style={{ color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>Phone</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#f9fafb', margin: 0 }}>
                    {order.phone}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} style={{ color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>Address</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#f9fafb', margin: 0, lineHeight: '1.5' }}>
                    {order.recipientAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ backgroundColor: '#222', width: '1px' }}></div>

          {/* Parcel Information */}
          <div style={{ paddingLeft: '20px' }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#e5e7eb',
                marginBottom: '16px',
                marginTop: 0,
              }}
            >
              Parcel Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Package size={16} style={{ color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>Description</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#f9fafb', margin: 0 }}>
                    {order.itemDescription}
                  </p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>Weight</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#f9fafb', margin: 0 }}>
                  {order.itemWeight}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>Notes</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#f9fafb', margin: 0, lineHeight: '1.5' }}>
                  {order.notes || 'No special notes'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div style={{ padding: '20px' }}>
          <StatusTimeline status={order.status} />
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            padding: '16px 20px',
            borderTop: '1px solid #222',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #2b2b2b',
              backgroundColor: '#0f0f0f',
              color: '#e5e7eb',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#111'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#0f0f0f'
            }}
          >
            Close
          </button>
          <button
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563eb'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#3b82f6'
            }}
          >
            Export Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState(DELIVERIES_DATA)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapTarget, setMapTarget] = useState('')
  const [mapQuery, setMapQuery] = useState('')
  const [filterStore, setFilterStore] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRange, setFilterRange] = useState('7d')
  const [sortBy, setSortBy] = useState('newest')
  const [formData, setFormData] = useState({
    destination: '',
    merchantId: '',
    recipient: '',
    address: '',
    itemDescription: '',
    weight: '',
    amount: '',
    store: '1',
    parcelType: 'document',
    notes: '',
    codAmount: '',
    recipientPhone: '',
  })

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedOrder(null), 300)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateDelivery = (e) => {
    e.preventDefault()
    if (
      !formData.recipient ||
      !formData.recipientPhone ||
      !formData.amount
    ) {
      setNotification('Please fill in all required fields')
      return
    }

    const newOrder = {
      id: `PTH-${Math.floor(Math.random() * 1000000)}`,
      customer: formData.recipient,
      phone: formData.recipientPhone,
      destination: formData.destination,
      status: 'pending',
      amount: parseFloat(formData.amount),
      date: 'Just now',
      timestamp: new Date(),
      store: parseInt(formData.store, 10),
      driver: null,
      recipient: formData.recipient,
      recipientAddress: formData.address,
      itemDescription: formData.itemDescription,
      itemWeight: formData.weight || 'Not specified',
      notes: formData.notes,
      cod: Boolean(formData.codAmount),
      codAmount: formData.codAmount ? parseFloat(formData.codAmount) : undefined,
      parcelType: formData.parcelType,
    }

    setOrders((prev) => [newOrder, ...prev])
    setNotification('Delivery created successfully!')
    setFormData({
      destination: '',
      merchantId: '',
      recipient: '',
      address: '',
      itemDescription: '',
      weight: '',
      amount: '',
      store: '1',
      parcelType: 'document',
      notes: '',
      codAmount: '',
      recipientPhone: '',
    })
    setShowCreateModal(false)
  }

  const getStatusBadgeColor = (status) => ({
    backgroundColor: `${getStatusColor(status)}20`,
    color: getStatusColor(status),
    border: `1px solid ${getStatusColor(status)}40`,
  })

  const mapSuggestions = [
    'Banani, Dhaka',
    'Gulshan 1, Dhaka',
    'Dhanmondi Lake, Dhaka',
    'Uttara Sector 10, Dhaka',
    'Mirpur 10, Dhaka',
  ]

  const openMapPicker = (target) => {
    setMapTarget(target)
    setMapQuery(formData[target] || '')
    setShowMapModal(true)
  }

  const handleMapSelect = (value) => {
    if (!mapTarget) return
    setFormData((prev) => ({ ...prev, [mapTarget]: value }))
    setShowMapModal(false)
    setMapTarget('')
    setMapQuery('')
  }

  useEffect(() => {
    const openModal = () => setShowCreateModal(true)
    window.addEventListener('openNewDeliveryModal', openModal)
    return () => window.removeEventListener('openNewDeliveryModal', openModal)
  }, [])

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const rangeStart = () => {
    if (filterRange === 'today') return startOfDay
    if (filterRange === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    if (filterRange === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    if (filterRange === '90d') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    return null
  }

  const filteredOrders = orders
    .filter((order) => {
      const start = rangeStart()
      const timestamp = order.timestamp ? new Date(order.timestamp) : null
      const inRange = start ? (timestamp ? timestamp >= start : true) : true
      const matchesStore = filterStore === 'all' ? true : order.store === parseInt(filterStore, 10)
      const matchesStatus = filterStatus === 'all' ? true : order.status === filterStatus
      return inRange && matchesStore && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'amount-high') return b.amount - a.amount
      if (sortBy === 'amount-low') return a.amount - b.amount
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return sortBy === 'oldest' ? aTime - bTime : bTime - aTime
    })

  return (
    <Layout activePage="deliveries">
      <div className={styles.pageWrapper}>
        <div className={styles.listPageHeader}>
          <div>
            <h2>Deliveries</h2>
            <p>Filter and sort deliveries by store and timeline.</p>
          </div>
          <button className={styles.primaryBtn} onClick={() => setShowCreateModal(true)}>
            Create Delivery
          </button>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label>Store</label>
            <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)}>
              <option value="all">All Stores</option>
              {STORES_DATA.map((store) => (
                <option key={store.id} value={store.id}>{store.name} - {store.branch}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              {STATUS_PROGRESSION.map((status) => (
                <option key={status} value={status}>{getStatusText(status)}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Timeline</label>
            <select value={filterRange} onChange={(e) => setFilterRange(e.target.value)}>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="amount-high">Amount (High)</option>
              <option value="amount-low">Amount (Low)</option>
            </select>
          </div>
        </div>

        <div className={styles.mapPreviewCard}>
          <div className={styles.mapPreviewHeader}>
            <h3>Live Tracking Map (Dummy)</h3>
            <span>Tracking enabled for future integration</span>
          </div>
          <div className={styles.mapPreviewCanvas}>
            <div className={styles.mapPulse} />
            <span>Map Preview</span>
          </div>
        </div>

        <div className={styles.listHeader}>
          <h2>Recent Deliveries</h2>
          <span>{filteredOrders.length} results</span>
        </div>

        <div className={styles.listWrapper}>
          {filteredOrders.map((order) => (
            <div key={order.id} className={styles.listCard}>
              <div className={styles.listTop}>
                <div>
                  <h4>{order.customer}</h4>
                  <span className={styles.listId}>{order.id}</span>
                </div>
                <div className={styles.listAmount}>
                  ৳ {order.amount}
                  <span>{order.date}</span>
                </div>
              </div>

              <div className={styles.listMeta}>
                <div className={styles.metaItem}>
                  <MapPin size={14} />
                  <span>{order.destination}</span>
                </div>
                <div className={styles.statusBadge} style={getStatusBadgeColor(order.status)}>
                  {getStatusText(order.status)}
                </div>
                {order.driver && (
                  <div className={styles.metaItem}>
                    <Truck size={14} />
                    <span>{getDriver(order.driver)?.name}</span>
                  </div>
                )}
              </div>

              <button onClick={() => handleViewOrder(order)} className={styles.viewButton}>
                <Eye size={16} />
                View Details
              </button>
            </div>
          ))}
        </div>

        {showCreateModal && (
          <div className={styles.createModal}>
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Create New Delivery</h2>
                  <p>Fill the form below to schedule a delivery</p>
                </div>
                <button className={styles.closeIcon} type="button" onClick={() => setShowCreateModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateDelivery} className={styles.formLayout}>
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <Store size={16} />
                    <span>General Info</span>
                  </div>

                  <div className={styles.generalGrid}>
                    <div className={styles.field}>
                      <label>
                        <Store size={14} />
                        Store
                      </label>
                      <select name="store" value={formData.store} onChange={handleInputChange}>
                        {STORES_DATA.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name} - {store.branch}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>
                        <Box size={14} />
                        Merchant ID (optional)
                      </label>
                      <input
                        type="text"
                        name="merchantId"
                        value={formData.merchantId}
                        onChange={handleInputChange}
                        placeholder="Type ID (optional)"
                      />
                    </div>
                    <div className={styles.field}>
                      <label>
                        <MapPin size={14} />
                        Destination
                      </label>
                      <div className={styles.mapField}>
                        <input
                          type="text"
                          name="destination"
                          value={formData.destination}
                          onChange={handleInputChange}
                          placeholder="Delivery area"
                        />
                        <button
                          type="button"
                          className={styles.mapButton}
                          onClick={() => openMapPicker('destination')}
                        >
                          Map
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.sectionBlock}>
                  <div className={styles.sectionSplit}>
                    <div className={styles.sectionColumn}>
                      <div className={styles.sectionHeader}>
                        <User size={16} />
                        <span>Recipient Info</span>
                      </div>
                      <div className={styles.field}>
                        <label>
                          <User size={14} />
                          Recipient Name *
                        </label>
                        <input
                          type="text"
                          name="recipient"
                          value={formData.recipient}
                          onChange={handleInputChange}
                          placeholder="Recipient name"
                        />
                      </div>
                      <div className={styles.field}>
                        <label>
                          <Phone size={14} />
                          Recipient Phone *
                        </label>
                        <input
                          type="tel"
                          name="recipientPhone"
                          value={formData.recipientPhone || ''}
                          onChange={handleInputChange}
                          placeholder="Recipient phone"
                        />
                      </div>
                      <div className={styles.field}>
                        <label>
                          <MapPin size={14} />
                          Delivery Address
                        </label>
                        <div className={styles.mapField}>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Full address"
                            rows={3}
                          />
                          <button
                            type="button"
                            className={`${styles.mapButton} ${styles.mapButtonTall}`}
                            onClick={() => openMapPicker('address')}
                          >
                            Map
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles.verticalDivider} />

                    <div className={styles.sectionColumn}>
                      <div className={styles.sectionHeader}>
                        <Package size={16} />
                        <span>Parcel Info</span>
                      </div>

                      <div className={styles.optionGrid}>
                        {parcelOptions.map((option) => {
                          const Icon = option.icon
                          const active = formData.parcelType === option.id
                          return (
                            <button
                              type="button"
                              key={option.id}
                              className={`${styles.optionCard} ${active ? styles.optionActive : ''}`}
                              onClick={() => setFormData((prev) => ({ ...prev, parcelType: option.id }))}
                            >
                              <div className={styles.optionIcon}>
                                <Icon size={18} />
                              </div>
                              <div>
                                <div className={styles.optionTitle}>{option.label}</div>
                                <div className={styles.optionDesc}>{option.desc}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      <div className={styles.field}>
                        <label>
                          <FileText size={14} />
                          Item Description
                        </label>
                        <input
                          type="text"
                          name="itemDescription"
                          value={formData.itemDescription}
                          onChange={handleInputChange}
                          placeholder="What are you sending?"
                        />
                      </div>
                      <div className={styles.field}>
                        <label>
                          <Scale size={14} />
                          Weight
                        </label>
                        <input
                          type="text"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          placeholder="e.g., 2.5 kg"
                        />
                      </div>
                      <div className={styles.field}>
                        <label>
                          <DollarSign size={14} />
                          Amount (Tk) *
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="Delivery amount"
                        />
                      </div>
                      <div className={styles.field}>
                        <label>
                          <DollarSign size={14} />
                          COD Amount (optional)
                        </label>
                        <input
                          type="number"
                          name="codAmount"
                          value={formData.codAmount}
                          onChange={handleInputChange}
                          placeholder="Cash on delivery amount"
                        />
                      </div>
                      <div className={styles.field}>
                        <label>
                          <MessageSquare size={14} />
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Special handling instructions"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.secondaryBtn} onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryBtn}>
                    Create Delivery
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMapModal && (
          <div className={styles.mapModal}>
            <div className={styles.mapCard}>
              <div className={styles.mapHeader}>
                <h3>Select Address from Map</h3>
                <button type="button" onClick={() => setShowMapModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.mapSearch}>
                <input
                  type="text"
                  value={mapQuery}
                  onChange={(e) => setMapQuery(e.target.value)}
                  placeholder="Search address"
                />
                <button type="button" onClick={() => handleMapSelect(mapQuery || mapSuggestions[0])}>
                  Use
                </button>
              </div>
              <div className={styles.mapBody}>
                <div className={styles.mapCanvas}>
                  <div className={styles.mapPin} />
                  <span>Map Preview</span>
                </div>
                <div className={styles.mapList}>
                  {mapSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleMapSelect(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.mapActions}>
                <button type="button" onClick={() => setShowMapModal(false)}>
                  Cancel
                </button>
                <button type="button" className={styles.primaryBtn} onClick={() => handleMapSelect(mapQuery || mapSuggestions[0])}>
                  Use this location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DeliveryViewModal order={selectedOrder} isOpen={isModalOpen} onClose={handleCloseModal} />

      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}
    </Layout>
  )
}

