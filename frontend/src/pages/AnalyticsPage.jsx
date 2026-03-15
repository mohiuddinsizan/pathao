import { getAnalytics } from '@/api/analytics'
import { useCachedQuery } from '@/hooks/use-cached-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

//Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
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
          <span className="font-semibold ml-auto pl-3">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

//Skeleton helpers
function ChartSkeleton() {
  return <div className="h-[260px] rounded-lg bg-muted animate-pulse" />
}
// Grid-based skeleton row (4 columns, matches TopStores grid)
function GridRowSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_1fr_6rem_8rem] items-center px-4 py-3 animate-pulse">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="h-4 w-20 rounded bg-muted" />
      <div className="h-4 w-10 rounded bg-muted" />
      <div className="h-4 w-20 rounded bg-muted justify-self-end" />
    </div>
  )
}

//Card wrapper
function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border-2 border-border bg-card p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

//Main Page
export default function AnalyticsPage() {
  const { data, loading } = useCachedQuery('analytics', getAnalytics)

  //Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 lg:p-6 overflow-y-auto space-y-6">
        {/* Header skeleton */}
        <div className="shrink-0 space-y-2">
          <div className="h-8 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded bg-muted animate-pulse" />
        </div>

        {/* Two chart skeletons */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border-2 border-border bg-card p-5 space-y-4">
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            <ChartSkeleton />
          </div>
          <div className="rounded-xl border-2 border-border bg-card p-5 space-y-4">
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            <ChartSkeleton />
          </div>
        </div>

        {/* Grid-based table skeleton */}
        <div className="rounded-xl border-2 border-border bg-card p-5 space-y-4">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="divide-y divide-border">
            {/* Header skeleton */}
            <div className="grid grid-cols-[1fr_1fr_6rem_8rem] items-center px-4 pb-2 animate-pulse">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-10 rounded bg-muted" />
              <div className="h-3 w-14 rounded bg-muted justify-self-end" />
            </div>
            <GridRowSkeleton />
            <GridRowSkeleton />
            <GridRowSkeleton />
          </div>
        </div>
      </div>
    )
  }

  //Error / null data state
  if (!data) {
    return (
      <div className="flex flex-col h-full p-4 lg:p-6 overflow-y-auto">
        <div className="flex items-center gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load analytics. Make sure the backend is running and you are
          logged in.
        </div>
      </div>
    )
  }
  //Derive chart / table data from backend response
  //Orders by Status — convert order_counts dict → array for Recharts
  const orderCountsArray = Object.entries(data.order_counts || {}).map(
    ([status, count]) => ({ status, count })
  )

  //Last 7 Days — daily_data is already [{date, count, revenue}] from backend
  const dailyData = (data.daily_data || []).slice(-7)

  //Top Stores — use top_stores from the backend
  const topStores = data.top_stores || []

  //Chart colors using CSS variables so they respect light/dark mode
  const colorPrimary = 'hsl(var(--primary))'
  const colorInfo = 'hsl(var(--chart-2, 217 91% 60%))'

  return (
    <div className="flex flex-col h-full p-4 lg:p-6 overflow-y-auto space-y-6">

      {/*Page header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Order performance overview for your stores
        </p>
      </div>

      {/*Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Orders by Status */}
        <Card
          title="Orders by Status"
          subtitle="Distribution of orders across all statuses"
        >
          {orderCountsArray.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={orderCountsArray}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.replace(/_/g, ' ')}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Orders" fill={colorPrimary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
              No order data available
            </div>
          )}
        </Card>
        {/*Last 7 Days — count + revenue */}
        <Card
          title="Last 7 Days"
          subtitle="Daily order count and revenue (all stores combined)"
        >
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={dailyData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.slice(5)} // show MM-DD only
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `৳${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="Orders"
                  fill={colorPrimary}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  name="Revenue (৳)"
                  fill={colorInfo}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
              No daily data available
            </div>
          )}
        </Card>
      </div>

      {/*Top Stores*/}
      <Card
        title="Top Stores"
        subtitle="Stores ranked by delivery volume"
      >
        {topStores.length > 0 ? (
          <div className="divide-y divide-border/50">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_1fr_6rem_8rem] items-center px-4 pb-2.5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                Store Name
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                Location
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground text-right">
                Orders
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground text-right">
                Revenue
              </span>
            </div>

            {/* Data rows */}
            {topStores.map((store, i) => (
              <div
                key={`${i}-${store.name}`}
                className="grid grid-cols-[1fr_1fr_6rem_8rem] items-center px-4 py-3 hover:bg-muted/40 transition-colors duration-200 cursor-default"
              >
                <span className="text-sm font-medium">{store.name}</span>
                <span className="text-sm text-muted-foreground">
                  {store.branch || '—'}
                </span>
                <span className="text-sm font-bold tabular-nums text-right">
                  {store.order_count}
                </span>
                <span className="text-sm font-bold tabular-nums text-right">
                  ৳{Number(store.revenue).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No store data yet
          </p>
        )}
      </Card>
    </div>
  )
}
