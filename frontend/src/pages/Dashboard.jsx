import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Home, Package, Truck, BarChart3, CreditCard, HelpCircle, Settings,
  Search, Bell, Plus, X, Star, Check, MapPin, Clock, Phone, Upload,
  FileText, User, Box, ChevronRight
} from 'lucide-react'
import styles from './Dashboard.module.css'

const ordersData = [
  { id: 'PTH-994821', customer: 'Rahim K.', initials: 'RK', destination: 'Banani', status: 'transit', amount: 120, phone: '+880 1712-345678', address: 'House 12, Road 5, Banani' },
  { id: 'PTH-994820', customer: 'Jannatul N.', initials: 'JN', destination: 'Dhanmondi', status: 'pending', amount: 85, phone: '+880 1812-456789', address: 'Flat 3A, Road 8, Dhanmondi' },
  { id: 'PTH-994819', customer: 'Saiful I.', initials: 'SI', destination: 'Uttara', status: 'delivered', amount: 200, phone: '+880 1912-567890', address: 'Sector 10, Road 4, Uttara' },
  { id: 'PTH-994818', customer: 'Fahmida R.', initials: 'FR', destination: 'Mirpur', status: 'transit', amount: 150, phone: '+880 1612-678901', address: 'Block C, Road 3, Mirpur 10' },
]

const pickupsData = [
  { time: '11:00', name: 'Abdul K.', status: 'On the way', badge: 'coming' },
  { time: '14:00', name: 'Pending', status: 'Scheduled', badge: 'scheduled' },
  { time: '17:00', name: 'Pending', status: 'Scheduled', badge: 'scheduled' },
]

const areaOptions = [
  { value: 'banani', label: 'Banani', charge: 60 },
  { value: 'gulshan', label: 'Gulshan', charge: 60 },
  { value: 'dhanmondi', label: 'Dhanmondi', charge: 70 },
  { value: 'uttara', label: 'Uttara', charge: 80 },
  { value: 'mirpur', label: 'Mirpur', charge: 70 },
  { value: 'mohammadpur', label: 'Mohammadpur', charge: 75 },
]

const parcelTypes = [
  { value: 'small', label: 'Small', maxWeight: '0.5kg', icon: '📦' },
  { value: 'medium', label: 'Medium', maxWeight: '2kg', icon: '📦' },
  { value: 'large', label: 'Large', maxWeight: '5kg', icon: '📦' },
  { value: 'fragile', label: 'Fragile', maxWeight: '3kg', icon: '⚠️' },
  { value: 'document', label: 'Document', maxWeight: '0.5kg', icon: '📄' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState('')
  const [activeNav, setActiveNav] = useState('dashboard')
  
  const [deliveryForm, setDeliveryForm] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverArea: '',
    receiverAddress: '',
    receiverNotes: '',
    parcelType: 'small',
    weight: '',
    description: '',
    codAmount: '',
    productValue: '',
    isFragile: false,
  })

  const [settingsForm, setSettingsForm] = useState({
    storeName: user?.name || 'RedX Store',
    email: 'redx@example.com',
    phone: '+880 1712-345678',
    pickupAddress: 'House 45, Road 12, Gulshan 2, Dhaka 1212',
    bankName: 'Dutch Bangla Bank',
    accountNumber: '1234567890',
  })

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const openOrderPanel = (order) => {
    setSelectedOrder(order)
    setShowPanel(true)
  }

  const getStatusBadge = (status) => {
    const styles_map = {
      transit: { class: styles.badgeTransit, label: 'In Transit' },
      pending: { class: styles.badgePending, label: 'Pending' },
      delivered: { class: styles.badgeDelivered, label: 'Delivered' }
    }
    return styles_map[status]
  }

  const filteredOrders = ordersData.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.destination.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const calculateDeliveryCharge = () => {
    const area = areaOptions.find(a => a.value === deliveryForm.receiverArea)
    return area ? area.charge : 0
  }

  const handleCreateDelivery = () => {
    if (!deliveryForm.receiverName || !deliveryForm.receiverPhone || !deliveryForm.receiverArea) {
      showToast('Please fill in all required fields')
      return
    }
    setShowModal(false)
    showToast('Delivery created successfully!')
    setDeliveryForm({
      receiverName: '',
      receiverPhone: '',
      receiverArea: '',
      receiverAddress: '',
      receiverNotes: '',
      parcelType: 'small',
      weight: '',
      description: '',
      codAmount: '',
      productValue: '',
      isFragile: false,
    })
  }

  const handleSaveSettings = () => {
    setShowSettings(false)
    showToast('Settings saved successfully!')
  }

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Star size={18} fill="white" stroke="white" />
          </div>
          <span>PATHAO</span>
        </div>

        <nav className={styles.nav}>
          <div 
            className={`${styles.navItem} ${activeNav === 'dashboard' ? styles.active : ''}`}
            onClick={() => { setActiveNav('dashboard'); navigate('/dashboard') }}
          >
            <Home size={18} />
            Dashboard
          </div>
          <div 
            className={`${styles.navItem} ${activeNav === 'orders' ? styles.active : ''}`}
            onClick={() => { setActiveNav('orders'); navigate('/orders') }}
          >
            <Package size={18} />
            Orders
            <span className={styles.navBadge}>12</span>
          </div>
          <div 
            className={`${styles.navItem} ${activeNav === 'pickups' ? styles.active : ''}`}
            onClick={() => { setActiveNav('pickups'); navigate('/pickups') }}
          >
            <Truck size={18} />
            Pickups
          </div>
          <div 
            className={`${styles.navItem} ${activeNav === 'analytics' ? styles.active : ''}`}
            onClick={() => { setActiveNav('analytics'); navigate('/analytics') }}
          >
            <BarChart3 size={18} />
            Analytics
          </div>
          <div 
            className={`${styles.navItem} ${activeNav === 'payments' ? styles.active : ''}`}
            onClick={() => { setActiveNav('payments'); navigate('/payments') }}
          >
            <CreditCard size={18} />
            Payments
          </div>
          <div className={styles.navDivider} />
          <div 
            className={`${styles.navItem} ${activeNav === 'settings' ? styles.active : ''}`}
            onClick={() => { setActiveNav('settings'); navigate('/settings') }}
          >
            <Settings size={18} />
            Settings
          </div>
          <div 
            className={`${styles.navItem} ${activeNav === 'support' ? styles.active : ''}`}
            onClick={() => { setActiveNav('support'); navigate('/support') }}
          >
            <HelpCircle size={18} />
            Support
          </div>
        </nav>

        <div className={styles.profile} onClick={() => setShowSettings(true)}>
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
        <header className={styles.header}>
          <h1>Dashboard</h1>
          <div className={styles.headerActions}>
            <div className={styles.search}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className={styles.iconBtn} onClick={() => showToast('5 new notifications')}>
              <Bell size={16} />
              <span className={styles.badge}>5</span>
            </button>
            <button className={styles.btn} onClick={() => setShowModal(true)}>
              <Plus size={14} />
              Create Delivery
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.greeting}>
            <h2>{greeting()}, {user?.name || 'RedX Store'}</h2>
            <p>{currentDate}</p>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={`${styles.statIcon} ${styles.red}`}>
                <Package size={22} />
              </div>
              <div className={styles.statInfo}>
                <h3>147</h3>
                <p>Orders Today</p>
              </div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statIcon} ${styles.orange}`}>
                <Clock size={22} />
              </div>
              <div className={styles.statInfo}>
                <h3>18</h3>
                <p>Awaiting Pickup</p>
              </div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statIcon} ${styles.blue}`}>
                <Truck size={22} />
              </div>
              <div className={styles.statInfo}>
                <h3>89</h3>
                <p>In Transit</p>
              </div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statIcon} ${styles.green}`}>
                <Check size={22} />
              </div>
              <div className={styles.statInfo}>
                <h3>40</h3>
                <p>Delivered</p>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {/* Orders Table */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Recent Orders</h3>
                <a href="#" onClick={(e) => { e.preventDefault(); showToast('View all orders') }}>View All</a>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Destination</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusBadge(order.status)
                    return (
                      <tr key={order.id} onClick={() => openOrderPanel(order)}>
                        <td className={styles.id}>#{order.id}</td>
                        <td>
                          <div className={styles.customer}>
                            <div className={styles.customerAvatar}>{order.initials}</div>
                            {order.customer}
                          </div>
                        </td>
                        <td>{order.destination}</td>
                        <td>
                          <span className={`${styles.badgeStatus} ${statusInfo.class}`}>
                            <span className={styles.dot}></span>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className={styles.amount}>৳{order.amount}</td>
                        <td>
                          <button 
                            className={`${styles.tableBtn} ${order.status === 'transit' ? styles.track : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              openOrderPanel(order)
                            }}
                          >
                            {order.status === 'transit' ? 'Track' : 'View'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Right Column */}
            <div className={styles.rightCol}>
              {/* Quick Actions */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Quick Actions</h3>
                </div>
                <div className={styles.actions}>
                  <div className={`${styles.action} ${styles.primary}`} onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    <span>Create Delivery</span>
                  </div>
                  <div className={styles.action} onClick={() => showToast('Bulk upload opened')}>
                    <Upload size={20} />
                    <span>Bulk Upload</span>
                  </div>
                  <div className={styles.action} onClick={() => showToast('Generating report...')}>
                    <FileText size={20} />
                    <span>Export Report</span>
                  </div>
                  <div className={styles.action} onClick={() => setShowSettings(true)}>
                    <Settings size={20} />
                    <span>Settings</span>
                  </div>
                </div>
              </div>

              {/* Today's Pickups */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Today's Pickups</h3>
                </div>
                <div className={styles.pickups}>
                  {pickupsData.map((pickup, index) => (
                    <div key={index} className={styles.pickup}>
                      <span className={styles.pickupTime}>{pickup.time}</span>
                      <div className={styles.pickupInfo}>
                        <div className={styles.pickupName}>{pickup.name}</div>
                        <div className={styles.pickupStatus}>{pickup.status}</div>
                      </div>
                      <span className={`${styles.pickupBadge} ${styles[pickup.badge]}`}>
                        {pickup.badge === 'coming' ? 'Arriving' : 'Scheduled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Delivery Modal - Two Panels */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Create Delivery</h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.modalPanels}>
              {/* Left Panel - Receiver Info */}
              <div className={styles.modalPanel}>
                <div className={styles.panelTitle}>
                  <User size={18} />
                  <h4>Receiver Information</h4>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Receiver Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name"
                    value={deliveryForm.receiverName}
                    onChange={(e) => setDeliveryForm({...deliveryForm, receiverName: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Phone Number *</label>
                  <input 
                    type="tel" 
                    placeholder="+880 1XXX-XXXXXX"
                    value={deliveryForm.receiverPhone}
                    onChange={(e) => setDeliveryForm({...deliveryForm, receiverPhone: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Delivery Area *</label>
                  <select 
                    value={deliveryForm.receiverArea}
                    onChange={(e) => setDeliveryForm({...deliveryForm, receiverArea: e.target.value})}
                  >
                    <option value="">Select area</option>
                    {areaOptions.map(area => (
                      <option key={area.value} value={area.value}>
                        {area.label} (৳{area.charge})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.labelWithBtn}>
                    Full Address
                    <button type="button" className={styles.mapBtn} onClick={() => showToast('Map picker opened')}>
                      <MapPin size={14} />
                      Pick on Map
                    </button>
                  </label>
                  <textarea 
                    placeholder="House/Flat, Road, Area details..."
                    value={deliveryForm.receiverAddress}
                    onChange={(e) => setDeliveryForm({...deliveryForm, receiverAddress: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Delivery Instructions</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Call before delivery"
                    value={deliveryForm.receiverNotes}
                    onChange={(e) => setDeliveryForm({...deliveryForm, receiverNotes: e.target.value})}
                  />
                </div>
              </div>

              {/* Right Panel - Parcel Details */}
              <div className={styles.modalPanel}>
                <div className={styles.panelTitle}>
                  <Box size={18} />
                  <h4>Parcel Details</h4>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Parcel Type</label>
                  <div className={styles.parcelTypes}>
                    {parcelTypes.map(type => (
                      <div 
                        key={type.value}
                        className={`${styles.parcelType} ${deliveryForm.parcelType === type.value ? styles.selected : ''}`}
                        onClick={() => setDeliveryForm({...deliveryForm, parcelType: type.value})}
                      >
                        <span className={styles.parcelIcon}>{type.icon}</span>
                        <span className={styles.parcelLabel}>{type.label}</span>
                        <span className={styles.parcelWeight}>{type.maxWeight}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Weight (kg)</label>
                    <input 
                      type="number" 
                      placeholder="0.5"
                      step="0.1"
                      value={deliveryForm.weight}
                      onChange={(e) => setDeliveryForm({...deliveryForm, weight: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Product Value (৳)</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={deliveryForm.productValue}
                      onChange={(e) => setDeliveryForm({...deliveryForm, productValue: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>COD Amount (৳)</label>
                  <input 
                    type="number" 
                    placeholder="Cash to collect from receiver"
                    value={deliveryForm.codAmount}
                    onChange={(e) => setDeliveryForm({...deliveryForm, codAmount: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Product Description</label>
                  <input 
                    type="text" 
                    placeholder="Brief description of the item"
                    value={deliveryForm.description}
                    onChange={(e) => setDeliveryForm({...deliveryForm, description: e.target.value})}
                  />
                </div>
                
                <label className={styles.checkbox}>
                  <input 
                    type="checkbox"
                    checked={deliveryForm.isFragile}
                    onChange={(e) => setDeliveryForm({...deliveryForm, isFragile: e.target.checked})}
                  />
                  <span>This parcel contains fragile items</span>
                </label>

                {/* Price Summary */}
                <div className={styles.priceSummary}>
                  <div className={styles.priceRow}>
                    <span>Delivery Charge</span>
                    <span>৳{calculateDeliveryCharge()}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>COD Charge (1%)</span>
                    <span>৳{Math.round((parseInt(deliveryForm.codAmount) || 0) * 0.01)}</span>
                  </div>
                  <div className={`${styles.priceRow} ${styles.total}`}>
                    <span>Total Charge</span>
                    <span>৳{calculateDeliveryCharge() + Math.round((parseInt(deliveryForm.codAmount) || 0) * 0.01)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className={styles.btn} onClick={handleCreateDelivery}>
                <Check size={16} />
                Create Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {showSettings && (
        <div className={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Account Settings</h3>
              <button className={styles.modalClose} onClick={() => setShowSettings(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.settingsSection}>
                <h4>Store Information</h4>
                <div className={styles.formGroup}>
                  <label>Store Name</label>
                  <input 
                    type="text" 
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({...settingsForm, storeName: e.target.value})}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input 
                      type="tel" 
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.settingsSection}>
                <h4>Pickup Address</h4>
                <div className={styles.formGroup}>
                  <label className={styles.labelWithBtn}>
                    Default Pickup Location
                    <button type="button" className={styles.mapBtn} onClick={() => showToast('Map picker opened')}>
                      <MapPin size={14} />
                      Change on Map
                    </button>
                  </label>
                  <textarea 
                    value={settingsForm.pickupAddress}
                    onChange={(e) => setSettingsForm({...settingsForm, pickupAddress: e.target.value})}
                  />
                </div>
              </div>
              
              <div className={styles.settingsSection}>
                <h4>Payment Details</h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Bank Name</label>
                    <input 
                      type="text" 
                      value={settingsForm.bankName}
                      onChange={(e) => setSettingsForm({...settingsForm, bankName: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Account Number</label>
                    <input 
                      type="text" 
                      value={settingsForm.accountNumber}
                      onChange={(e) => setSettingsForm({...settingsForm, accountNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <button className={styles.btnDanger} onClick={handleLogout}>
                Log Out
              </button>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowSettings(false)}>
                Cancel
              </button>
              <button className={styles.btn} onClick={handleSaveSettings}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Panel */}
      <div className={`${styles.panel} ${showPanel ? styles.show : ''}`}>
        {selectedOrder && (
          <>
            <div className={styles.panelHeader}>
              <h3>Order #{selectedOrder.id}</h3>
              <button className={styles.modalClose} onClick={() => setShowPanel(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.panelContent}>
              <div className={styles.panelBadge}>
                <span className={`${styles.badgeStatus} ${getStatusBadge(selectedOrder.status).class}`}>
                  <span className={styles.dot}></span>
                  {getStatusBadge(selectedOrder.status).label}
                </span>
              </div>

              <div className={styles.section}>
                <h4>Customer</h4>
                <div className={styles.row}>
                  <span className={styles.label}>Name</span>
                  <span className={styles.value}>{selectedOrder.customer}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Phone</span>
                  <span className={styles.value}>{selectedOrder.phone}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Address</span>
                  <span className={styles.value}>{selectedOrder.address}</span>
                </div>
              </div>

              <div className={styles.section}>
                <h4>Package</h4>
                <div className={styles.row}>
                  <span className={styles.label}>Type</span>
                  <span className={styles.value}>Small Parcel</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Payment</span>
                  <span className={styles.value}>COD ৳{selectedOrder.amount}</span>
                </div>
              </div>

              {selectedOrder.status === 'transit' && (
                <div className={styles.section}>
                  <h4>Rider</h4>
                  <div className={styles.riderCard}>
                    <div className={styles.riderAvatar}>AK</div>
                    <div className={styles.riderInfo}>
                      <div className={styles.riderName}>Abdul Karim</div>
                      <div className={styles.riderMeta}>4.9 Rating • Honda CG 125</div>
                    </div>
                    <button className={styles.tableBtn} onClick={() => showToast('Calling rider...')}>
                      <Phone size={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.section}>
                <h4>Timeline</h4>
                <div className={styles.timeline}>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineDot}><Check size={10} /></div>
                    <div className={styles.timelineInfo}>
                      <div className={styles.timelineTitle}>Order Placed</div>
                      <div className={styles.timelineTime}>10:30 AM</div>
                    </div>
                  </div>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineDot}><Check size={10} /></div>
                    <div className={styles.timelineInfo}>
                      <div className={styles.timelineTitle}>Picked Up</div>
                      <div className={styles.timelineTime}>11:15 AM</div>
                    </div>
                  </div>
                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineDot} ${selectedOrder.status === 'transit' ? styles.current : ''}`}>
                      {selectedOrder.status !== 'transit' && <Check size={10} />}
                    </div>
                    <div className={styles.timelineInfo}>
                      <div className={styles.timelineTitle}>In Transit</div>
                      <div className={styles.timelineTime}>{selectedOrder.status === 'transit' ? 'ETA 12:00 PM' : '11:45 AM'}</div>
                    </div>
                  </div>
                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineDot} ${selectedOrder.status === 'delivered' ? '' : styles.pending}`}>
                      {selectedOrder.status === 'delivered' && <Check size={10} />}
                    </div>
                    <div className={styles.timelineInfo}>
                      <div className={styles.timelineTitle}>Delivered</div>
                      <div className={styles.timelineTime}>{selectedOrder.status === 'delivered' ? '12:30 PM' : '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.status === 'transit' && (
                <button className={styles.btn} style={{ width: '100%', marginTop: '16px' }} onClick={() => showToast('Opening live tracking...')}>
                  <MapPin size={16} />
                  Track Live
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={styles.toast}>
          <Check size={18} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
