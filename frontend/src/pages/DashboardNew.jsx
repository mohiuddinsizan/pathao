import { useNavigate } from 'react-router-dom'
import { Package, Store, DollarSign, BarChart3, ChevronRight, TrendingUp } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import styles from './DashboardNew.module.css'
import {
  ANALYTICS_STATS,
  WEEKLY_DELIVERY_TREND,
  STORES_DATA,
  DELIVERIES_DATA,
  getStatusColor,
  getStatusText,
} from '../data/constants'

export default function Dashboard() {
  const navigate = useNavigate()

  const blocks = [
    {
      title: 'Deliveries',
      icon: Package,
      mainNumber: ANALYTICS_STATS.deliveriesToday.toString(),
      mainLabel: 'Today',
      stats: [
        { label: 'Pending', value: ANALYTICS_STATS.awaitingPickup.toString() },
        { label: 'Transit', value: ANALYTICS_STATS.inTransit.toString() },
        { label: 'Delivered', value: ANALYTICS_STATS.deliveredToday.toString() }
      ],
      action: 'View All',
      route: '/deliveries'
    },
    {
      title: 'Stores',
      icon: Store,
      mainNumber: ANALYTICS_STATS.totalStores.toString(),
      mainLabel: 'Active',
      stats: [
        { label: 'Branches', value: STORES_DATA.length.toString() },
        { label: 'This Month', value: ANALYTICS_STATS.totalDeliveries.toString() },
        { label: 'Avg/Store', value: Math.round(ANALYTICS_STATS.totalDeliveries / STORES_DATA.length).toString() }
      ],
      action: 'Manage',
      route: '/stores'
    },
    {
      title: 'Revenue',
      icon: DollarSign,
      mainNumber: `৳ ${(ANALYTICS_STATS.totalRevenue / 1000).toFixed(0)}K`,
      mainLabel: 'This Month',
      stats: [
        { label: 'Avg/Delivery', value: `৳ ${Math.round(ANALYTICS_STATS.totalRevenue / ANALYTICS_STATS.totalDeliveries)}` },
        { label: 'Repeat Customers', value: ANALYTICS_STATS.repeatCustomers.toString() },
        { label: 'Growth', value: '+12%' }
      ],
      action: 'Payments',
      route: '/payments'
    },
    {
      title: 'Success Rate',
      icon: BarChart3,
      mainNumber: `${ANALYTICS_STATS.successRate}%`,
      mainLabel: 'On-Time',
      stats: [
        { label: 'Rating', value: ANALYTICS_STATS.customerSatisfaction.toFixed(1) },
        { label: 'Issues', value: '2' },
        { label: 'Trend', value: '+8%' }
      ],
      action: 'Analytics',
      route: '/analytics'
    }
  ]

  return (
    <Layout activePage="dashboard">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's your business overview.</p>
          </div>
        </div>

        {/* Blocks Grid */}
        <div className={styles.blocksGrid}>
          {blocks.map((block, idx) => {
            const Icon = block.icon
            return (
              <div key={idx} className={styles.block}>
                <div className={styles.blockHeader}>
                  <Icon size={24} />
                  <h2>{block.title}</h2>
                </div>

                <div className={styles.mainMetric}>
                  <div className={styles.number}>{block.mainNumber}</div>
                  <div className={styles.label}>{block.mainLabel}</div>
                </div>

                <div className={styles.summaryStats}>
                  {block.stats.map((stat, statIdx) => (
                    <div key={statIdx} className={styles.miniStat}>
                      <span className={styles.value}>{stat.value}</span>
                      <span className={styles.miniLabel}>{stat.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={styles.viewDetailsBtn}
                  onClick={() => navigate(block.route)}
                >
                  {block.action}
                  <ChevronRight size={14} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Delivery Trends</h3>
              <TrendingUp size={16} className={styles.trendIcon} />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={WEEKLY_DELIVERY_TREND}>
                <defs>
                  <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#ddd' }}
                  cursor={{ stroke: '#EF4444', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDeliveries)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Revenue Growth</h3>
              <TrendingUp size={16} className={styles.trendIcon} />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={WEEKLY_DELIVERY_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#ddd' }}
                  cursor={{ stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  )
}
