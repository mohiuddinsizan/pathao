import { useState, useEffect, useCallback, Fragment } from 'react'
import { getAnalytics } from '@/api/analytics'
import { getStores } from '@/api/stores'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Package, TrendingUp, Banknote, CheckCircle, Loader2, X, ChevronRight, HandCoins, Wallet } from 'lucide-react'

/* ─── helpers ─── */
const fmt = (d) => d.toISOString().split('T')[0]

const DATE_PRESETS = [
  { label: 'Today', key: 'today', from: 0, to: 0 },
  { label: 'Yesterday', key: 'yesterday', from: 1, to: 1 },
  { label: '7d', key: '7d', from: 6, to: 0 },
  { label: '30d', key: '30d', from: 29, to: 0 },
  { label: '90d', key: '90d', from: 89, to: 0 },
  { label: 'All Time', key: 'all', from: null, to: null },
]

const STATUS_COLORS = {
  pending: '#94a3b8',
  assigned: '#64748b',
  picked_up: '#475569',
  in_transit: '#334155',
  delivered: '#1e293b',
  cancelled: '#ef4444',
}

const PAYMENT_COLORS = {
  cod: '#1e293b',
  prepaid: '#3b82f6',
  bkash: '#e11d8f',
}

const PIPELINE_STAGES = [
  { from: 'pending', to: 'assigned' },
  { from: 'assigned', to: 'picked_up' },
  { from: 'picked_up', to: 'in_transit' },
  { from: 'in_transit', to: 'delivered' },
]

const PARCEL_LABELS = {
  document: 'Document',
  small_box: 'Small Box',
  medium_parcel: 'Medium Parcel',
  large_parcel: 'Large Parcel',
  fragile: 'Fragile',
  unspecified: 'Unspecified',
}

function fmtDuration(minutes) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${Math.round(minutes)}m`
}

function generateInsights(data) {
  const insights = []
  const s = data.summary || {}
  const pipeline = data.pipeline || []
  const topStores = data.top_stores || []
  const paymentMethods = data.payment_methods || []
  const hourlyData = data.hourly_data || []
  const orderCounts = data.order_counts || {}

  if (s.total_orders > 0) {
    if (s.delivery_rate >= 80) {
      insights.push({ icon: '✓', title: `${s.delivery_rate}% delivery rate`, description: 'Strong delivery performance this period.' })
    } else if (s.delivery_rate >= 50) {
      insights.push({ icon: '→', title: `${s.delivery_rate}% delivery rate`, description: `${s.total_orders - s.delivered_count} orders still pending delivery.` })
    } else {
      insights.push({ icon: '!', title: `Low delivery rate: ${s.delivery_rate}%`, description: `Only ${s.delivered_count} of ${s.total_orders} orders delivered.` })
    }
  }

  if (s.avg_order_value > 0) {
    insights.push({ icon: '৳', title: `Avg order value: ৳${s.avg_order_value.toLocaleString()}`, description: `Total revenue ৳${s.total_revenue.toLocaleString()} across ${s.total_orders} orders.` })
  }

  if (s.delivered_revenue > 0) {
    const codRatio = Math.round((s.total_cod_collected / s.delivered_revenue) * 100)
    insights.push({ icon: '₿', title: `${codRatio}% COD collection ratio`, description: `৳${s.total_cod_collected.toLocaleString()} collected out of ৳${s.delivered_revenue.toLocaleString()} delivered revenue.` })
  }

  if (pipeline.length > 0) {
    const slowest = pipeline.reduce((a, b) => a.avg_minutes > b.avg_minutes ? a : b)
    insights.push({ icon: '⏱', title: `Slowest stage: ${slowest.from_status.replace(/_/g, ' ')} → ${slowest.to_status.replace(/_/g, ' ')}`, description: `Avg ${fmtDuration(slowest.avg_minutes)} across ${slowest.count} orders.` })
  }

  if (topStores.length > 0) {
    const top = topStores[0]
    insights.push({ icon: '★', title: `Top store: ${top.name}${top.branch ? ` (${top.branch})` : ''}`, description: `${top.order_count} orders, ৳${Number(top.revenue).toLocaleString()} revenue.` })
  }

  if (paymentMethods.length > 0) {
    const dominant = paymentMethods.reduce((a, b) => a.count > b.count ? a : b)
    const pct = s.total_orders > 0 ? Math.round((dominant.count / s.total_orders) * 100) : 0
    const methodLabel = dominant.method === 'cod' ? 'COD' : dominant.method === 'bkash' ? 'bKash' : dominant.method
    insights.push({ icon: '◉', title: `${pct}% ${methodLabel} payments`, description: `${dominant.count} of ${s.total_orders} orders use ${methodLabel}.` })
  }

  // Cancellation insight
  const cancelledCount = orderCounts.cancelled || 0
  if (cancelledCount > 0 && s.total_orders > 0) {
    const cancelRate = Math.round((cancelledCount / s.total_orders) * 100)
    insights.push({ icon: '✕', title: `${cancelRate}% cancellation rate`, description: `${cancelledCount} orders cancelled out of ${s.total_orders}.` })
  }

  // Peak hour insight
  if (hourlyData.length > 0) {
    const peak = hourlyData.reduce((a, b) => a.count > b.count ? a : b)
    insights.push({ icon: '⏰', title: `Peak hour: ${String(peak.hour).padStart(2, '0')}:00`, description: `${peak.count} orders placed during this hour.` })
  }

  return insights
}

/* ─── Custom Tooltip ─── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2.5 shadow-xl text-xs backdrop-blur-sm">
      <p className="font-semibold mb-1.5 text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span
            className="inline-block h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold ml-auto pl-3">
            {typeof p.value === 'number' && p.name?.includes('৳')
              ? `৳${p.value.toLocaleString()}`
              : p.value?.toLocaleString?.() ?? p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Skeleton helpers ─── */
function ChartSkeleton() {
  return <div className="h-[260px] rounded-lg bg-muted animate-pulse" />
}

function KpiSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 flex items-start gap-2.5 animate-pulse">
      <div className="h-7 w-7 rounded-md bg-muted" />
      <div className="space-y-1.5">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-5 w-20 rounded bg-muted" />
        <div className="h-3 w-14 rounded bg-muted" />
      </div>
    </div>
  )
}

function InsightSkeleton() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border p-3 animate-pulse">
      <div className="h-5 w-5 rounded bg-muted mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_1fr_5rem_7rem_5.5rem_6rem] items-center px-4 py-3 animate-pulse">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="h-4 w-20 rounded bg-muted" />
      <div className="h-4 w-8 rounded bg-muted ml-auto" />
      <div className="h-4 w-16 rounded bg-muted ml-auto" />
      <div className="h-4 w-10 rounded bg-muted ml-auto" />
      <div className="h-4 w-14 rounded bg-muted ml-auto" />
    </div>
  )
}

/* ─── Card wrapper ─── */
function SectionCard({ title, subtitle, children, className }) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-4 space-y-3', className)}>
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

/* ─── KPI Card ─── */
function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 flex items-start gap-2.5">
      <div className={cn('rounded-md p-1.5', color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium leading-tight">{label}</p>
        <p className="text-lg font-bold tracking-tight leading-snug">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground leading-tight line-clamp-1">{sub}</p>}
      </div>
    </div>
  )
}

/* ═══════════ Main Page ═══════════ */
export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Date state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('7d')
  const [stores, setStores] = useState([])
  const [storeFilter, setStoreFilter] = useState('all')

  // Fetch stores once on mount
  useEffect(() => {
    getStores()
      .then((data) => setStores(Array.isArray(data) ? data : data.stores || []))
      .catch(() => setStores([]));
  }, []);

  // Initialize to last 7 days
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(today)
    start.setDate(start.getDate() - 6)
    setDateFrom(fmt(start))
    setDateTo(fmt(today))
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      if (storeFilter !== 'all') params.store_id = storeFilter
      const result = await getAnalytics(params)
      setData(result)
    } catch (err) {
      setError(err?.message || 'Failed to load analytics.')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, storeFilter])

  useEffect(() => {
    if (dateFrom || dateTo || selectedPreset === 'all') {
      fetchData()
    }
  }, [fetchData, selectedPreset])

  function applyPreset(preset) {
    if (preset.key === selectedPreset && preset.key !== 'all') {
      return
    }
    setSelectedPreset(preset.key)
    if (preset.from === null) {
      setDateFrom('')
      setDateTo('')
      return
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(today)
    start.setDate(start.getDate() - preset.from)
    const end = new Date(today)
    end.setDate(end.getDate() - preset.to)
    setDateFrom(fmt(start))
    setDateTo(fmt(end))
  }

  // Derived data
  const summary = data?.summary || {}
  const orderCountsArray = Object.entries(data?.order_counts || {}).map(
    ([status, count]) => ({ status, count })
  )
  const dailyData = data?.daily_data || []
  const paymentMethods = data?.payment_methods || []
  const topStores = data?.top_stores || []
  const pipeline = data?.pipeline || []
  const hourlyData = data?.hourly_data || []
  const parcelTypes = data?.parcel_types || []

  // Fill all 24 hours for the hourly chart (so gaps show as zero)
  const hourlyFull = Array.from({ length: 24 }, (_, h) => {
    const match = hourlyData.find((d) => d.hour === h)
    return { hour: h, label: `${h.toString().padStart(2, '0')}:00`, count: match?.count ?? 0, revenue: match?.revenue ?? 0 }
  })

  const colorPrimary = 'hsl(var(--primary))'

  // Period label for subtitles
  function fmtReadable(dateStr) {
    const d = new Date(dateStr + 'T00:00:00')
    const day = d.getDate()
    const suffix = [, 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : (day % 100 - day % 10 !== 10) * (day % 10)] || 'th'
    return `${day}${suffix} ${d.toLocaleDateString('en-US', { month: 'long' })}, ${d.getFullYear()}`
  }
  const periodLabel = selectedPreset === 'all'
    ? 'All time'
    : dateFrom && dateTo
      ? dateFrom === dateTo
        ? fmtReadable(dateFrom)
        : `${fmtReadable(dateFrom)}  –  ${fmtReadable(dateTo)}`
      : 'Selected period'

  return (
    <Tabs defaultValue="overview" className="flex flex-col h-full overflow-hidden p-4 lg:p-6 gap-0">
      {/* Sticky header: title + tabs + filters */}
      <div className="shrink-0 space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Tab navigation — always visible */}
        <TabsList className="w-full justify-start bg-transparent h-auto p-0 rounded-none border-b border-border">
          {[
            { value: 'overview', label: 'Overview' },
            { value: 'deliveries', label: 'Deliveries' },
            { value: 'stores', label: 'Stores' },
            { value: 'payments', label: 'Payments' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Date & store filter bar */}
        <div className="rounded-lg border border-border bg-card p-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  'h-7 rounded-md border px-2.5 text-xs font-medium transition-colors cursor-pointer',
                  selectedPreset === preset.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {preset.label}
              </button>
            ))}

            <div className="h-5 w-px bg-border" />

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setSelectedPreset(null)
              }}
              className={cn(
                'h-8 rounded-md border bg-background px-2 text-xs cursor-pointer',
                dateFrom && !selectedPreset
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input text-foreground'
              )}
              title="From date"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setSelectedPreset(null)
              }}
              className={cn(
                'h-8 rounded-md border bg-background px-2 text-xs cursor-pointer',
                dateTo && !selectedPreset
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input text-foreground'
              )}
              title="To date"
            />

            {(dateFrom || dateTo) && !selectedPreset && (
              <button
                type="button"
                onClick={() => applyPreset(DATE_PRESETS[2])}
                className="inline-flex items-center gap-1 h-7 rounded-md px-2.5 text-xs font-medium text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              >
                <X className="h-3 w-3" />
                Reset
              </button>
            )}

            <div className="h-5 w-px bg-border" />

            <Select value={storeFilter} onValueChange={(v) => setStoreFilter(v)}>
              <SelectTrigger className="h-7 w-auto min-w-[140px] max-w-[220px] text-xs font-medium truncate border-input">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}{s.branch ? ` — ${s.branch}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {storeFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setStoreFilter('all')}
                className="inline-flex items-center gap-1 h-7 rounded-md px-2 text-xs font-medium text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

          {/* ─── Overview Tab ─── */}
          <TabsContent value="overview" className="space-y-3">
            {/* KPI Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              {loading ? (
                <>
                  <KpiSkeleton />
                  <KpiSkeleton />
                  <KpiSkeleton />
                  <KpiSkeleton />
                </>
              ) : (
                <>
                  <KpiCard
                    icon={Package}
                    label="Total Orders"
                    value={summary.total_orders?.toLocaleString() ?? 0}
                    sub={periodLabel}
                    color="bg-muted text-foreground"
                  />
                  <KpiCard
                    icon={Banknote}
                    label="Total Revenue"
                    value={`৳${(summary.total_revenue ?? 0).toLocaleString()}`}
                    sub={`Avg ৳${(summary.avg_order_value ?? 0).toLocaleString()}/order`}
                    color="bg-muted text-foreground"
                  />
                  <KpiCard
                    icon={CheckCircle}
                    label="Delivery Rate"
                    value={`${summary.delivery_rate ?? 0}%`}
                    sub={`${summary.delivered_count ?? 0} delivered`}
                    color="bg-muted text-foreground"
                  />
                  <KpiCard
                    icon={TrendingUp}
                    label="COD Collected"
                    value={`৳${(summary.total_cod_collected ?? 0).toLocaleString()}`}
                    sub={`৳${(summary.delivered_revenue ?? 0).toLocaleString()} delivered rev.`}
                    color="bg-muted text-foreground"
                  />
                </>
              )}
            </div>

            {/* Daily Trend */}
            <SectionCard title="Order & Revenue Trend" subtitle={periodLabel}>
              {loading ? (
                <ChartSkeleton />
              ) : dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colorPrimary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colorPrimary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v.toLocaleString()}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="count" name="Orders" stroke={colorPrimary} fill="url(#colorOrders)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (৳)" stroke="#475569" fill="url(#colorRevenue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-75 flex items-center justify-center text-sm text-muted-foreground">No data for this period</div>
              )}
            </SectionCard>

            {/* Quick Insights */}
            <SectionCard title="Quick Insights" subtitle={periodLabel}>
              {loading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => <InsightSkeleton key={i} />)}
                </div>
              ) : data && generateInsights(data).length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {generateInsights(data).map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-border p-3">
                      <span className="mt-0.5 text-sm">{insight.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{insight.title}</p>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">No insights available</p>
              )}
            </SectionCard>
          </TabsContent>

          {/* ─── Deliveries Tab ─── */}
          <TabsContent value="deliveries" className="space-y-3">
            {/* Orders by Status */}
            <SectionCard title="Orders by Status" subtitle={periodLabel}>
              {loading ? (
                <ChartSkeleton />
              ) : orderCountsArray.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orderCountsArray} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Orders" radius={[4, 4, 0, 0]}>
                      {orderCountsArray.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || colorPrimary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-75 flex items-center justify-center text-sm text-muted-foreground">No order data</div>
              )}
            </SectionCard>

            {/* Delivery Pipeline */}
            <SectionCard title="Delivery Pipeline" subtitle={periodLabel}>
              {loading ? (
                <ChartSkeleton />
              ) : pipeline.length > 0 ? (
                <div className="flex items-stretch gap-0">
                  {PIPELINE_STAGES.map((stage, idx) => {
                    const match = pipeline.find(p => p.from_status === stage.from && p.to_status === stage.to)
                    return (
                      <Fragment key={stage.from}>
                        {idx > 0 && (
                          <div className="flex items-center px-1 text-muted-foreground">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1 rounded-xl border-2 border-border p-3 space-y-1" style={{ borderTopColor: STATUS_COLORS[stage.to], borderTopWidth: '3px' }}>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            {stage.from.replace(/_/g, ' ')} → {stage.to.replace(/_/g, ' ')}
                          </p>
                          {match ? (
                            <>
                              <p className="text-lg font-bold tracking-tight">{fmtDuration(match.avg_minutes)}</p>
                              <p className="text-xs text-muted-foreground">{match.count} orders · {fmtDuration(match.min_minutes)}–{fmtDuration(match.max_minutes)}</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">—</p>
                          )}
                        </div>
                      </Fragment>
                    )
                  })}
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-sm text-muted-foreground">No pipeline data</div>
              )}
            </SectionCard>

            {/* Peak Hours & Parcel Types */}
            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard title="Orders by Hour" subtitle="When orders are placed">
                {loading ? (
                  <ChartSkeleton />
                ) : hourlyFull.some((d) => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={hourlyFull} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={2} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Orders" fill={colorPrimary} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">No data</div>
                )}
              </SectionCard>

              <SectionCard title="Parcel Types" subtitle="Breakdown by parcel category">
                {loading ? (
                  <ChartSkeleton />
                ) : parcelTypes.length > 0 ? (
                  <div className="space-y-2.5">
                    {(() => {
                      const maxCount = Math.max(...parcelTypes.map((p) => p.count), 1)
                      return parcelTypes.map((pt) => (
                        <div key={pt.type} className="flex items-center gap-3">
                          <span className="text-xs font-medium w-24 text-right text-muted-foreground truncate">
                            {PARCEL_LABELS[pt.type] || pt.type}
                          </span>
                          <div className="flex-1 h-6 rounded bg-muted/50 relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 rounded bg-primary/40" style={{ width: `${(pt.count / maxCount) * 100}%` }} />
                            <span className="relative px-2 text-xs font-semibold leading-6">{pt.count}</span>
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-20 text-right">৳{pt.revenue.toLocaleString()}</span>
                        </div>
                      ))
                    })()}
                  </div>
                ) : (
                  <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">No data</div>
                )}
              </SectionCard>
            </div>
          </TabsContent>

          {/* ─── Stores Tab ─── */}
          <TabsContent value="stores" className="space-y-3">
            {/* Inter-store Comparison Stats */}
            {loading ? (
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
              </div>
            ) : topStores.length > 1 && (() => {
              const sorted = [...topStores].sort((a, b) => b.order_count - a.order_count)
              const best = sorted[0]
              const avgRevenue = topStores.reduce((s, t) => s + t.revenue, 0) / topStores.length
              const avgRate = topStores.reduce((s, t) => s + t.delivery_rate, 0) / topStores.length
              const bestRate = topStores.reduce((b, t) => t.delivery_rate > b.delivery_rate ? t : b, topStores[0])
              const worstRate = topStores.filter(t => t.order_count > 0).reduce((w, t) => t.delivery_rate < w.delivery_rate ? t : w, topStores[0])
              return (
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  <KpiCard
                    icon={TrendingUp}
                    label="Top Store"
                    value={best.name}
                    sub={`${best.order_count} orders · ৳${best.revenue.toLocaleString()}`}
                    color="bg-muted text-foreground"
                  />
                  <KpiCard
                    icon={Package}
                    label="Avg Revenue / Store"
                    value={`৳${Math.round(avgRevenue).toLocaleString()}`}
                    sub={`Across ${topStores.length} stores`}
                    color="bg-muted text-foreground"
                  />
                  <KpiCard
                    icon={CheckCircle}
                    label="Best Delivery Rate"
                    value={`${bestRate.delivery_rate}%`}
                    sub={`${bestRate.name}${bestRate.branch ? ` (${bestRate.branch})` : ''}`}
                    color="bg-muted text-foreground"
                  />
                  <KpiCard
                    icon={Banknote}
                    label="Avg Delivery Rate"
                    value={`${avgRate.toFixed(1)}%`}
                    sub={worstRate.order_count > 0 ? `Lowest: ${worstRate.delivery_rate}% (${worstRate.name})` : ''}
                    color="bg-muted text-foreground"
                  />
                </div>
              )
            })()}

            {/* Top Stores Table */}
            <SectionCard title="Top Stores" subtitle="Ranked by order volume">
              {loading ? (
                <div className="space-y-0 divide-y divide-border/50">
                  {[1, 2, 3, 4].map((i) => <TableRowSkeleton key={i} />)}
                </div>
              ) : topStores.length > 0 ? (
                (() => {
                  const sorted = [...topStores].sort((a, b) => b.order_count - a.order_count)
                  const maxOrders = Math.max(...sorted.map((s) => s.order_count), 1)
                  return (
                    <div className="overflow-x-auto">
                    <div className="divide-y divide-border/50 min-w-[600px]">
                      <div className="grid grid-cols-[1fr_1fr_5rem_7rem_5.5rem_6rem] items-center px-4 pb-2.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Store</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Branch</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Orders</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Revenue</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Del. Rate</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Avg Value</span>
                      </div>
                      {sorted.map((store, i) => (
                        <div key={`${i}-${store.name}`} className="grid grid-cols-[1fr_1fr_5rem_7rem_5.5rem_6rem] items-center px-4 py-3 hover:bg-muted/40 transition-colors">
                          <span className="text-sm font-medium">{store.name}</span>
                          <span className="text-sm text-muted-foreground">{store.branch || '—'}</span>
                          <span className="relative text-sm font-bold tabular-nums text-right">
                            <span className="absolute inset-y-0 left-0 rounded bg-primary/10" style={{ width: `${(store.order_count / maxOrders) * 100}%` }} />
                            <span className="relative">{store.order_count}</span>
                          </span>
                          <span className="text-sm font-bold tabular-nums text-right">৳{Number(store.revenue).toLocaleString()}</span>
                          <span className={cn('text-sm font-bold tabular-nums text-right', store.delivery_rate >= 50 ? 'text-green-600' : store.delivery_rate >= 25 ? 'text-yellow-600' : 'text-red-600')}>
                            {store.delivery_rate}%
                          </span>
                          <span className="text-sm font-bold tabular-nums text-right">৳{Number(store.avg_order_value).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    </div>
                  )
                })()
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">No store data for this period</p>
              )}
            </SectionCard>

            {/* Store Comparison Charts */}
            {loading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="Store-wise Orders" subtitle={periodLabel}><ChartSkeleton /></SectionCard>
                <SectionCard title="Store-wise Revenue" subtitle={periodLabel}><ChartSkeleton /></SectionCard>
              </div>
            ) : topStores.length > 1 && (() => {
              const chartStores = topStores.slice(0, 8)
              return (
              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="Store-wise Orders" subtitle={periodLabel}>
                  <ResponsiveContainer width="100%" height={Math.max(200, chartStores.length * 50)}>
                    <BarChart data={chartStores.map(s => ({ name: s.name + (s.branch ? ` (${s.branch})` : ''), orders: s.order_count, delivered: s.delivered_count ?? 0 }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={130} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="orders" name="Total Orders" fill={colorPrimary} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="delivered" name="Delivered" fill="#64748b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </SectionCard>

                <SectionCard title="Store-wise Revenue" subtitle={periodLabel}>
                  <ResponsiveContainer width="100%" height={Math.max(200, chartStores.length * 50)}>
                    <BarChart data={chartStores.map(s => ({ name: s.name + (s.branch ? ` (${s.branch})` : ''), revenue: Number(s.revenue), avgValue: Number(s.avg_order_value) }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v.toLocaleString()}`} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={130} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" name="Revenue (৳)" fill={colorPrimary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </SectionCard>
              </div>
              )
            })()}
          </TabsContent>

          {/* ─── Payments Tab ─── */}
          <TabsContent value="payments" className="space-y-3">
            {/* Payment Methods Donut */}
            <SectionCard title="Payment Methods" subtitle={periodLabel}>
              {loading ? (
                <ChartSkeleton />
              ) : paymentMethods.length > 0 ? (
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
                  <ResponsiveContainer width="100%" height={280} className="max-w-xs">
                    <PieChart>
                      <Pie data={paymentMethods} dataKey="count" nameKey="method" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                        {paymentMethods.map((entry) => (
                          <Cell key={entry.method} fill={PAYMENT_COLORS[entry.method] || colorPrimary} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 py-4">
                    {paymentMethods.map((pm) => {
                      const pct = summary.total_orders > 0 ? Math.round((pm.count / summary.total_orders) * 100) : 0
                      return (
                        <div key={pm.method} className="flex items-center gap-3">
                          <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: PAYMENT_COLORS[pm.method] || colorPrimary }} />
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {pm.method === 'cod' ? 'Cash on Delivery' : pm.method === 'bkash' ? 'bKash' : pm.method === 'prepaid' ? 'Prepaid' : pm.method}
                            </p>
                            <p className="text-xs text-muted-foreground">{pm.count} orders ({pct}%) · ৳{pm.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-50 flex items-center justify-center text-sm text-muted-foreground">No data</div>
              )}
            </SectionCard>

            {/* COD Collection Summary */}
            {loading ? (
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
              </div>
            ) : summary.total_orders > 0 && (
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  icon={HandCoins}
                  label="COD Collected"
                  value={`৳${(summary.total_cod_collected ?? 0).toLocaleString()}`}
                  sub="From delivered orders"
                  color="bg-muted text-foreground"
                />
                <KpiCard
                  icon={Wallet}
                  label="Delivered Revenue"
                  value={`৳${(summary.delivered_revenue ?? 0).toLocaleString()}`}
                  sub={`${summary.delivered_count} orders delivered`}
                  color="bg-muted text-foreground"
                />
                <KpiCard
                  icon={TrendingUp}
                  label="COD Ratio"
                  value={`${summary.delivered_revenue > 0 ? Math.round((summary.total_cod_collected / summary.delivered_revenue) * 100) : 0}%`}
                  sub="COD / delivered revenue"
                  color="bg-muted text-foreground"
                />
                <KpiCard
                  icon={Package}
                  label="Avg Order Value"
                  value={`৳${(summary.avg_order_value ?? 0).toLocaleString()}`}
                  sub={`${summary.total_orders} total orders`}
                  color="bg-muted text-foreground"
                />
              </div>
            )}
          </TabsContent>
      </div>
    </Tabs>
  )
}
