import { useState } from 'react'
import { BarChart3, TrendingUp, Users, DollarSign, Clock, CheckCircle, MapPin } from 'lucide-react'
import Layout from '../components/Layout'
import styles from './Analytics.module.css'
import {
  DELIVERIES_DATA,
  STATUS_PROGRESSION,
  STORES_DATA,
  getStatusColor,
  getStatusText,
} from '../data/constants'

export default function Analytics() {
  const [period, setPeriod] = useState('month')
  const now = new Date()
  const periodDays = {
    today: 1,
    week: 7,
    month: 30,
    quarter: 90,
    year: 365,
  }[period] || 30

  const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
  const filteredDeliveries = DELIVERIES_DATA.filter((delivery) => {
    if (!delivery.timestamp) return true
    return new Date(delivery.timestamp) >= periodStart
  })

  const totalDeliveries = filteredDeliveries.length
  const totalRevenue = filteredDeliveries.reduce((sum, delivery) => sum + (delivery.amount || 0), 0)
  const deliveredCount = filteredDeliveries.filter((delivery) => delivery.status === 'delivered').length
  const successRate = totalDeliveries ? Math.round((deliveredCount / totalDeliveries) * 100) : 0

  const customerCounts = filteredDeliveries.reduce((acc, delivery) => {
    acc[delivery.customer] = (acc[delivery.customer] || 0) + 1
    return acc
  }, {})
  const repeatCustomers = Object.values(customerCounts).filter((count) => count > 1).length

  const statusCounts = filteredDeliveries.reduce((acc, delivery) => {
    acc[delivery.status] = (acc[delivery.status] || 0) + 1
    return acc
  }, {})

  const bucketCount = 7
  const bucketSize = Math.ceil(periodDays / bucketCount)
  const timelineBuckets = Array.from({ length: bucketCount }).map((_, index) => {
    const bucketStart = new Date(now.getTime() - (bucketCount - index) * bucketSize * 24 * 60 * 60 * 1000)
    const bucketEnd = new Date(bucketStart.getTime() + bucketSize * 24 * 60 * 60 * 1000)
    const count = filteredDeliveries.filter((delivery) => {
      if (!delivery.timestamp) return true
      const time = new Date(delivery.timestamp).getTime()
      return time >= bucketStart.getTime() && time < bucketEnd.getTime()
    }).length
    const label = periodDays <= 7
      ? bucketStart.toLocaleDateString('en-US', { weekday: 'short' })
      : `W${index + 1}`
    return { label, count }
  })
  const maxTimeline = Math.max(...timelineBuckets.map((bucket) => bucket.count), 1)

  const revenueSplit = [
    { category: 'Delivery Fees', percentage: 45 },
    { category: 'COD Handling', percentage: 35 },
    { category: 'Service Charges', percentage: 20 },
  ].map((item) => ({
    ...item,
    amount: Math.round((totalRevenue * item.percentage) / 100),
  }))

  const areaMap = filteredDeliveries.reduce((acc, delivery) => {
    acc[delivery.destination] = (acc[delivery.destination] || 0) + 1
    return acc
  }, {})
  const areaDistribution = Object.entries(areaMap)
    .map(([area, count]) => ({
      area,
      count,
      percentage: totalDeliveries ? Math.round((count / totalDeliveries) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const storeStats = STORES_DATA.map((store) => {
    const deliveries = filteredDeliveries.filter((delivery) => delivery.store === store.id)
    const revenue = deliveries.reduce((sum, delivery) => sum + (delivery.amount || 0), 0)
    const pending = deliveries.filter((delivery) => delivery.status === 'pending').length
    const inTransit = deliveries.filter((delivery) => delivery.status === 'in_transit').length
    const delivered = deliveries.filter((delivery) => delivery.status === 'delivered').length
    return {
      id: store.id,
      name: store.name,
      branch: store.branch,
      deliveries: deliveries.length,
      revenue,
      pending,
      inTransit,
      delivered,
    }
  })

  return (
    <Layout activePage="analytics">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1>Analytics Overview</h1>
            <p>Key business metrics and delivery performance</p>
          </div>
          <div className={styles.periodControl}>
            <span className={styles.periodLabel}>Time Range</span>
            <select
              className={styles.periodSelect}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </header>

        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: '#1f2937' }}>
              <BarChart3 size={22} color="#3B82F6" />
            </div>
            <div>
              <div className={styles.kpiLabel}>Total Deliveries</div>
              <div className={styles.kpiValue}>{totalDeliveries.toLocaleString()}</div>
              <div className={styles.kpiSub}><TrendingUp size={14} /> Filtered by selected range</div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: '#1f2937' }}>
              <DollarSign size={22} color="#10B981" />
            </div>
            <div>
              <div className={styles.kpiLabel}>Total Revenue</div>
              <div className={styles.kpiValue}>৳ {totalRevenue.toLocaleString()}</div>
              <div className={styles.kpiSub}><TrendingUp size={14} /> Based on filtered deliveries</div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: '#1f2937' }}>
              <Users size={22} color="#F59E0B" />
            </div>
            <div>
              <div className={styles.kpiLabel}>Repeat Customers</div>
              <div className={styles.kpiValue}>{repeatCustomers}</div>
              <div className={styles.kpiSub}><TrendingUp size={14} /> Repeat within selected range</div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: '#1f2937' }}>
              <CheckCircle size={22} color="#22C55E" />
            </div>
            <div>
              <div className={styles.kpiLabel}>Success Rate</div>
              <div className={styles.kpiValue}>{successRate}%</div>
              <div className={styles.kpiSub}><TrendingUp size={14} /> Delivery completion ratio</div>
            </div>
          </div>
        </div>

        <div className={styles.sectionGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Delivery Trend</h3>
              <span>Updated for {period}</span>
            </div>
            <div className={styles.trendChart}>
              {timelineBuckets.map((item) => (
                <div key={item.label} className={styles.trendBar}>
                  <div className={styles.barFill} style={{ height: `${(item.count / maxTimeline) * 100}%` }}>
                    <span>{item.count}</span>
                  </div>
                  <span className={styles.barLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Revenue Breakdown</h3>
              <span>Weighted by selected range</span>
            </div>
            <div className={styles.breakdownList}>
              {revenueSplit.map((item) => (
                <div key={item.category} className={styles.breakdownItem}>
                  <div className={styles.breakdownMeta}>
                    <span className={styles.breakdownLabel}>{item.category}</span>
                    <span className={styles.breakdownValue}>৳ {item.amount.toLocaleString()}</span>
                  </div>
                  <div className={styles.breakdownBar}>
                    <div style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sectionGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Status Distribution</h3>
              <span>Filtered deliveries</span>
            </div>
            <div className={styles.statusList}>
              {STATUS_PROGRESSION.map((status) => (
                <div key={status} className={styles.statusRow}>
                  <div className={styles.statusLabel}>
                    <span
                      className={styles.statusDot}
                      style={{ backgroundColor: getStatusColor(status) }}
                    />
                    {getStatusText(status)}
                  </div>
                  <div className={styles.statusCount}>{statusCounts[status] || 0}</div>
                </div>
              ))}
            </div>
            <div className={styles.statusFooter}>
              <Clock size={16} />
              Average delivery time: {Math.max(28, 45 - Math.min(totalDeliveries, 20))} mins
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Top Delivery Areas</h3>
              <span>Based on selected range</span>
            </div>
            <div className={styles.areaList}>
              {areaDistribution.map((area) => (
                <div key={area.area} className={styles.areaRow}>
                  <div className={styles.areaMeta}>
                    <MapPin size={14} />
                    <span>{area.area}</span>
                  </div>
                  <div className={styles.areaStats}>
                    <span>{area.count}</span>
                    <span className={styles.areaPercent}>{area.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Store Performance</h3>
            <span>Storewise delivery counts</span>
          </div>
          <div className={styles.storeTable}>
            {storeStats.map((store) => (
              <div key={store.id} className={styles.storeRow}>
                <div className={styles.storeMeta}>
                  <div className={styles.storeName}>{store.name}</div>
                  <div className={styles.storeBranch}>{store.branch}</div>
                </div>
                <div className={styles.storeStats}>
                  <div>
                    <span>Total</span>
                    <strong>{store.deliveries}</strong>
                  </div>
                  <div>
                    <span>Pending</span>
                    <strong>{store.pending}</strong>
                  </div>
                  <div>
                    <span>In Transit</span>
                    <strong>{store.inTransit}</strong>
                  </div>
                  <div>
                    <span>Delivered</span>
                    <strong>{store.delivered}</strong>
                  </div>
                  <div>
                    <span>Revenue</span>
                    <strong>৳ {store.revenue.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
