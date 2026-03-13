// Shared data constants for consistent usage across the merchant desktop app

// Store Information
export const STORES_DATA = [
  { id: 1, name: 'ISD Project - Dhaka', branch: 'Banani', location: 'House 45, Road 12, Banani, Dhaka 1213' },
  { id: 2, name: 'ISD Project - Chittagong', branch: 'Halishahar', location: 'Block C, Road 5, Halishahar, Chittagong' },
  { id: 3, name: 'ISD Project - Sylhet', branch: 'Sylhet Sadar', location: 'Zindabazar, Sylhet Sadar, Sylhet' },
]

// Driver Information
export const DRIVERS_DATA = [
  { id: 1, name: 'Ahmed Khan', phone: '+880 1723-123456', vehicle: 'Motorcycle', rating: 4.8 },
  { id: 2, name: 'Rajib Kumar', phone: '+880 1823-234567', vehicle: 'Van', rating: 4.6 },
  { id: 3, name: 'Fatima Begum', phone: '+880 1923-345678', vehicle: 'Motorcycle', rating: 4.9 },
  { id: 4, name: 'Kamal Hossain', phone: '+880 1623-456789', vehicle: 'Pickup Truck', rating: 4.7 },
]

// Delivery Status Configuration
export const DELIVERY_STATUSES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked-up',
  TRANSIT: 'transit',
  DELIVERED: 'delivered',
}

export const STATUS_LABELS = {
  [DELIVERY_STATUSES.PENDING]: 'Pending',
  [DELIVERY_STATUSES.ASSIGNED]: 'Assigned',
  [DELIVERY_STATUSES.PICKED_UP]: 'Picked Up',
  [DELIVERY_STATUSES.TRANSIT]: 'In Transit',
  [DELIVERY_STATUSES.DELIVERED]: 'Delivered',
}

export const STATUS_COLORS = {
  [DELIVERY_STATUSES.PENDING]: '#F59E0B',
  [DELIVERY_STATUSES.ASSIGNED]: '#06B6D4',
  [DELIVERY_STATUSES.PICKED_UP]: '#8B5CF6',
  [DELIVERY_STATUSES.TRANSIT]: '#3B82F6',
  [DELIVERY_STATUSES.DELIVERED]: '#10B981',
}

export const STATUS_PROGRESSION = [
  DELIVERY_STATUSES.PENDING,
  DELIVERY_STATUSES.ASSIGNED,
  DELIVERY_STATUSES.PICKED_UP,
  DELIVERY_STATUSES.TRANSIT,
  DELIVERY_STATUSES.DELIVERED,
]

// Sample Delivery Data - Distributed across 10 days for graph display
const generateDeliveryData = () => {
  const now = new Date()
  const deliveries = []
  const stores = [1, 2, 3]
  const drivers = [1, 2, 3, 4]
  const statuses = ['pending', 'assigned', 'picked-up', 'transit', 'delivered']
  const amounts = [85, 95, 120, 150, 175, 200, 250, 300]
  
  // Create 80 deliveries spread across 10 days (8 per day)
  for (let dayOffset = 9; dayOffset >= 0; dayOffset--) {
    const dayStart = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    dayStart.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 8; i++) {
      const hourOffset = Math.floor(Math.random() * 24)
      const minOffset = Math.floor(Math.random() * 60)
      const timestamp = new Date(dayStart.getTime() + hourOffset * 60 * 60 * 1000 + minOffset * 60 * 1000)
      
      deliveries.push({
        id: `PTH-${994820 + deliveries.length}`,
        customer: `Customer ${deliveries.length}`,
        phone: `+880 17${Math.floor(Math.random() * 90)}-${Math.floor(Math.random() * 1000000)}`,
        destination: ['Banani', 'Mirpur', 'Gulshan', 'Dhanmondi', 'Uttara'][Math.floor(Math.random() * 5)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        date: timestamp.toLocaleString(),
        timestamp: timestamp,
        store: stores[Math.floor(Math.random() * stores.length)],
        driver: drivers[Math.floor(Math.random() * drivers.length)],
        recipient: `Recipient ${deliveries.length}`,
        recipientAddress: `Address ${deliveries.length}, Dhaka`,
        itemDescription: 'Package',
        itemWeight: `${Math.floor(Math.random() * 5) + 1} kg`,
        notes: 'Standard delivery',
        cod: Math.random() > 0.5,
        codAmount: Math.random() > 0.5 ? amounts[Math.floor(Math.random() * amounts.length)] : 0,
      })
    }
  }
  
  return deliveries
}

export const DELIVERIES_DATA = generateDeliveryData()

// Analytics Data
export const ANALYTICS_STATS = {
  totalStores: STORES_DATA.length,
  totalDrivers: DRIVERS_DATA.length,
  totalDeliveries: 1247,
  totalRevenue: 187450,
  repeatCustomers: 485,
  successRate: 99.2,
  deliveriesToday: 147,
  awaitingPickup: 18,
  inTransit: 89,
  deliveredToday: 40,
  avgDeliveryTime: 42, // minutes
  customerSatisfaction: 4.8,
}

// Weekly delivery trend (last 7 days)
export const WEEKLY_DELIVERY_TREND = [
  { day: 'Mon', count: 156, revenue: 23400 },
  { day: 'Tue', count: 189, revenue: 28350 },
  { day: 'Wed', count: 201, revenue: 30150 },
  { day: 'Thu', count: 178, revenue: 26700 },
  { day: 'Fri', count: 215, revenue: 32250 },
  { day: 'Sat', count: 228, revenue: 34200 },
  { day: 'Sun', count: 208, revenue: 31200 },
]

// Revenue Breakdown
export const REVENUE_BREAKDOWN = [
  { category: 'Delivery Fees', amount: 84405, percentage: 45 },
  { category: 'COD Collection', amount: 65607, percentage: 35 },
  { category: 'Express Service', amount: 37438, percentage: 20 },
]

// Delivery Area Distribution
export const AREA_DISTRIBUTION = [
  { area: 'Banani', count: 245, percentage: 19.7 },
  { area: 'Gulshan', count: 198, percentage: 15.9 },
  { area: 'Dhanmondi', count: 187, percentage: 15.0 },
  { area: 'Uttara', count: 165, percentage: 13.2 },
  { area: 'Mirpur', count: 156, percentage: 12.5 },
  { area: 'Mohammadpur', count: 142, percentage: 11.4 },
  { area: 'Others', count: 154, percentage: 12.3 },
]

// Payment History
export const PAYMENT_HISTORY = [
  { 
    id: 'TXN-001245', 
    date: '2026-01-22', 
    amount: 15000, 
    status: 'completed', 
    method: 'Bank Transfer', 
    ref: 'REF-12847',
    deliveries: 125,
    store: 1,
  },
  { 
    id: 'TXN-001244', 
    date: '2026-01-21', 
    amount: 8500, 
    status: 'completed', 
    method: 'Bank Transfer', 
    ref: 'REF-12846',
    deliveries: 71,
    store: 2,
  },
  { 
    id: 'TXN-001243', 
    date: '2026-01-20', 
    amount: 12350, 
    status: 'processing', 
    method: 'Bkash', 
    ref: 'REF-12845',
    deliveries: 103,
    store: 1,
  },
  { 
    id: 'TXN-001242', 
    date: '2026-01-19', 
    amount: 18750, 
    status: 'completed', 
    method: 'Bank Transfer', 
    ref: 'REF-12844',
    deliveries: 156,
    store: 3,
  },
  { 
    id: 'TXN-001241', 
    date: '2026-01-18', 
    amount: 9200, 
    status: 'completed', 
    method: 'Nagad', 
    ref: 'REF-12843',
    deliveries: 77,
    store: 1,
  },
]

// Notification messages
export const DELIVERY_NOTIFICATIONS = [
  {
    id: 'NTF-001',
    title: 'Delivery Assigned',
    message: 'Driver Ahmed Khan has been assigned to delivery PTH-994823.',
    time: '5 mins ago',
    status: DELIVERY_STATUSES.ASSIGNED,
  },
  {
    id: 'NTF-002',
    title: 'Picked Up',
    message: 'Delivery PTH-994822 has been picked up and is on the way to Mirpur.',
    time: '22 mins ago',
    status: DELIVERY_STATUSES.PICKED_UP,
  },
  {
    id: 'NTF-003',
    title: 'In Transit',
    message: 'Delivery PTH-994821 is in transit to Banani.',
    time: '1 hour ago',
    status: DELIVERY_STATUSES.TRANSIT,
  },
  {
    id: 'NTF-004',
    title: 'Delivered',
    message: 'Delivery PTH-994825 was delivered successfully.',
    time: '3 hours ago',
    status: DELIVERY_STATUSES.DELIVERED,
  },
]

// Utility functions
export const getStatusText = (status) => STATUS_LABELS[status] || 'Unknown'
export const getStatusColor = (status) => STATUS_COLORS[status] || '#888'
export const getStore = (storeId) => STORES_DATA.find(s => s.id === storeId)
export const getDriver = (driverId) => DRIVERS_DATA.find(d => d.id === driverId)
