import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getPayments } from "@/api/payments"
import { getOrder } from "@/api/orders"
import { getStores } from "@/api/stores"
import { useCachedQuery } from "@/hooks/use-cached-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertCircle, Search, X, ArrowUp, ArrowDown,
  Loader2, LayoutList, Banknote, CreditCard, Wallet, Package,
  Eye, Download, CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const methodColors = {
  cod:     "warning",
  bkash:   "success",
  prepaid: "info",
  online:  "sky",
}

const methodIcons = {
  cod:     Banknote,
  bkash:   Wallet,
  prepaid: CreditCard,
  online:  CreditCard,
}

const PAYMENT_TABS = [
  {
    key: "all",
    label: "All",
    icon: LayoutList,
    activeClass: "bg-foreground text-background border border-foreground shadow-sm font-bold",
    activePillClass: "bg-background/30 text-background",
  },
  {
    key: "cod",
    label: "COD",
    icon: Banknote,
    activeClass: "bg-amber-500/30 text-foreground border border-amber-500/40 shadow-sm font-bold",
    activePillClass: "bg-background/80 text-foreground",
  },
  {
    key: "bkash",
    label: "bKash",
    icon: Wallet,
    activeClass: "bg-pink-500/30 text-foreground border border-pink-500/40 shadow-sm font-bold",
    activePillClass: "bg-background/80 text-foreground",
  },
  {
    key: "prepaid",
    label: "Prepaid",
    icon: CreditCard,
    activeClass: "bg-sky-500/30 text-foreground border border-sky-500/40 shadow-sm font-bold",
    activePillClass: "bg-background/80 text-foreground",
  },
]

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function formatPaymentDate(timestamp) {
  if (!timestamp) return "\u2014"
  const date = new Date(timestamp)
  const day = date.getDate()
  const mod100 = day % 100
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? "th"
    : day % 10 === 1 ? "st"
    : day % 10 === 2 ? "nd"
    : day % 10 === 3 ? "rd" : "th"
  const timePart = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  return `${day}${suffix} ${MONTH_ABBR[date.getMonth()]} \u2022 ${timePart}`
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return null
  if (sortDir === "asc") return <ArrowUp className="h-3 w-3 ml-1 text-primary/70 inline" />
  return <ArrowDown className="h-3 w-3 ml-1 text-primary/70 inline" />
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[0.85fr_1fr_0.85fr_1.1fr_0.75fr_0.95fr_auto] gap-x-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="py-3 px-4 flex items-center">
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export default function PaymentsPage() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const progressRef = useRef(null)
  const bottomBlurRef = useRef(null)
  const sentinelRef = useRef(null)
  const [page, setPage] = useState(1)
  const [allPayments, setAllPayments] = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [stores, setStores] = useState([])
  const [storeFilter, setStoreFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedDatePreset, setSelectedDatePreset] = useState(null)
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState("desc")
  const [previewItem, setPreviewItem] = useState(null)
  const [previewDetail, setPreviewDetail] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const tabCacheRef = useRef({})

  useEffect(() => {
    getStores()
      .then((data) => setStores(Array.isArray(data) ? data : data.stores || []))
      .catch(() => setStores([]))
  }, [])

  const fetchPayments = () => {
    const params = { page, limit: 20 }
    params.order_status = "delivered"
    if (filter !== "all") params.payment_method = filter
    if (storeFilter !== "all") params.store_id = storeFilter
    return getPayments(params).then((data) => ({
      payments: Array.isArray(data?.payments) ? data.payments : [],
      total: data?.total ?? 0,
      total_revenue: data?.total_revenue ?? 0,
      page: data?.page ?? page,
      pages: data?.pages ?? 0,
    }))
  }

  const { data: paymentsData, loading, error, refetch } = useCachedQuery(
    `payments-${page}-${filter}-${storeFilter}`,
    fetchPayments
  )

  useEffect(() => {
    if (!previewItem) { setPreviewDetail(null); return }
    setPreviewLoading(true)
    getOrder(previewItem.order_id)
      .then((res) => setPreviewDetail(res?.data || null))
      .catch(() => setPreviewDetail(null))
      .finally(() => setPreviewLoading(false))
  }, [previewItem])

  const downloadInvoice = (item) => {
    const d = previewDetail || item
    const method = d.payment_method === "cod" ? "COD" : d.payment_method === "bkash" ? "bKash" : (d.payment_method || "").toUpperCase()
    const date = d.created_at ? new Date(d.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${d.order_id}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:40px;color:#1a1a1a;max-width:700px;margin:0 auto}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #111;padding-bottom:20px;margin-bottom:24px}
.hdr h1{font-size:28px;font-weight:800;letter-spacing:-0.5px}.hdr .meta{text-align:right;font-size:13px;color:#666;line-height:1.6}
.section{margin-bottom:20px}.section h3{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:8px}
.row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;border-bottom:1px solid #eee}.row .label{color:#666}.row .value{font-weight:600}
.total{margin-top:16px;border-top:2px solid #111;padding-top:12px;display:flex;justify-content:space-between;font-size:18px;font-weight:800}
.footer{margin-top:40px;text-align:center;font-size:11px;color:#aaa}
@media print{body{padding:20px}}</style></head><body>
<div class="hdr"><div><h1>INVOICE</h1><p style="color:#666;font-size:13px;margin-top:4px">Pathao Courier</p></div>
<div class="meta"><div><strong>#${d.order_id}</strong></div><div>${date}</div><div style="margin-top:4px">Status: Delivered</div></div></div>
<div class="section"><h3>Recipient</h3>
<div class="row"><span class="label">Name</span><span class="value">${d.recipient_name || "—"}</span></div>
<div class="row"><span class="label">Phone</span><span class="value">${d.recipient_phone || "—"}</span></div>
<div class="row"><span class="label">Address</span><span class="value">${d.recipient_address || "—"}</span></div>
<div class="row"><span class="label">Area</span><span class="value">${d.destination_area || "—"}</span></div></div>
<div class="section"><h3>Pickup Store</h3>
<div class="row"><span class="label">Store</span><span class="value">${d.store_name || "—"}${d.store_branch ? " · " + d.store_branch : ""}</span></div>
<div class="row"><span class="label">Pickup Address</span><span class="value">${d.pickup_address || "—"}</span></div></div>
<div class="section"><h3>Parcel Details</h3>
<div class="row"><span class="label">Type</span><span class="value">${(d.parcel_type || "—").replace(/_/g, " ")}</span></div>
<div class="row"><span class="label">Description</span><span class="value">${d.item_description || "—"}</span></div>
<div class="row"><span class="label">Weight</span><span class="value">${d.item_weight ? d.item_weight + " kg" : "—"}</span></div>
${d.notes ? `<div class="row"><span class="label">Notes</span><span class="value">${d.notes}</span></div>` : ""}</div>
<div class="section"><h3>Payment</h3>
<div class="row"><span class="label">Method</span><span class="value">${method}</span></div>
<div class="row"><span class="label">COD Amount</span><span class="value">৳${Number(d.cod_amount || 0).toLocaleString()}</span></div></div>
<div class="total"><span>Total Amount</span><span>৳${Number(d.amount || 0).toLocaleString()}</span></div>
<div class="footer">This is a system-generated invoice from Pathao Courier.</div>
</body></html>`
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, "_blank")
    if (win) win.onload = () => { URL.revokeObjectURL(url); win.print() }
  }

  const handleClearFilters = () => {
    tabCacheRef.current = {}
    setAllPayments([])
    setFilter("all")
    setStoreFilter("all")
    setDateFrom("")
    setDateTo("")
    setSelectedDatePreset(null)
    setSearch("")
    setPage(1)
  }

  const payments = paymentsData?.payments || []
  const totalPages = paymentsData?.pages ?? 0
  const totalOrders = paymentsData?.total ?? 0
  const totalRevenue = paymentsData?.total_revenue ?? 0
  const hasNextPage = totalPages > 0 ? page < totalPages : payments.length === 20
  const loadingMore = loading && allPayments.length > 0
  const [autoLoadPhase, setAutoLoadPhase] = useState("idle")
  const showSkeletons = autoLoadPhase !== "idle"

  useEffect(() => {
    if (autoLoadPhase !== "pending") return
    const timer = setTimeout(() => {
      setPage((p) => p + 1)
      setAutoLoadPhase("fetching")
    }, 1000)
    return () => clearTimeout(timer)
  }, [autoLoadPhase])

  useEffect(() => {
    if (autoLoadPhase !== "fetching") return
    if (loading || loadingMore) return
    const timer = setTimeout(() => setAutoLoadPhase("idle"), 250)
    return () => clearTimeout(timer)
  }, [autoLoadPhase, loading, loadingMore])

  useEffect(() => {
    if (!payments.length) return
    setAllPayments((prev) => {
      let next
      if (page === 1) {
        next = payments
      } else {
        const existingIds = new Set(prev.map((o) => o.order_id))
        const newPayments = payments.filter((o) => !existingIds.has(o.order_id))
        next = newPayments.length > 0 ? [...prev, ...newPayments] : prev
      }
      const cacheKey = `${filter}__${storeFilter}`
      tabCacheRef.current[cacheKey] = { payments: next, page }
      return next
    })
  }, [payments, page, filter, storeFilter])

  const prevFilterRef = useRef({ filter, storeFilter })
  useEffect(() => {
    const prev = prevFilterRef.current
    if (prev.filter === filter && prev.storeFilter === storeFilter) return
    prevFilterRef.current = { filter, storeFilter }
    setAutoLoadPhase("idle")

    const cacheKey = `${filter}__${storeFilter}`
    const cached = tabCacheRef.current[cacheKey]
    if (cached) {
      setAllPayments(cached.payments)
      setPage(cached.page)
    } else {
      setAllPayments([])
      setPage(1)
    }
  }, [filter, storeFilter])

  const loadNextPage = useCallback(() => {
    if (!loading && hasNextPage && autoLoadPhase === "idle") setAutoLoadPhase("pending")
  }, [loading, hasNextPage, autoLoadPhase])

  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = scrollRef.current
    if (!sentinel || !container || !hasNextPage || loading || autoLoadPhase !== "idle") return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadNextPage() },
      { root: container, threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, loading, autoLoadPhase, loadNextPage, allPayments.length])

  const filtered = allPayments
    .filter((o) =>
      !search ||
      (o.recipient_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.recipient_phone || "").includes(search) ||
      (o.order_id || "").toLowerCase().includes(search.toLowerCase())
    )
    .filter((o) => {
      if (!dateFrom && !dateTo) return true
      const d = o.created_at ? new Date(o.created_at) : null
      if (!d) return true
      if (dateFrom && d < new Date(dateFrom + "T00:00:00")) return false
      if (dateTo && d > new Date(dateTo + "T23:59:59.999")) return false
      return true
    })

  const activeFilterCount = [
    search.trim() !== "",
    filter !== "all",
    storeFilter !== "all",
    dateFrom !== "" || dateTo !== "",
  ].filter(Boolean).length

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (!sortField) return 0
    let aVal, bVal
    if (sortField === "amount") {
      aVal = a.amount ?? 0
      bVal = b.amount ?? 0
    } else {
      aVal = a.created_at ? new Date(a.created_at).getTime() : 0
      bVal = b.created_at ? new Date(b.created_at).getTime() : 0
    }
    return sortDir === "asc" ? aVal - bVal : bVal - aVal
  })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const updateScrollIndicators = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const maxScroll = scrollHeight - clientHeight
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0
      if (progressRef.current) progressRef.current.style.width = `${progress * 100}%`
      if (bottomBlurRef.current) bottomBlurRef.current.style.opacity = scrollTop < maxScroll - 1 ? "1" : "0"
    }

    updateScrollIndicators()
    el.addEventListener("scroll", updateScrollIndicators, { passive: true })
    window.addEventListener("resize", updateScrollIndicators)
    return () => {
      el.removeEventListener("scroll", updateScrollIndicators)
      window.removeEventListener("resize", updateScrollIndicators)
    }
  }, [loading, filtered.length, page])

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 lg:p-6 gap-4">
      <div className="shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Invoices</span>
            <span className="text-sm font-bold tabular-nums">{totalOrders.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Revenue</span>
            <span className="text-sm font-bold tabular-nums">\u09F3{totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 rounded-xl border-2 border-border bg-card p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative w-56 xl:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Name, phone, or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 h-8 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setPage(1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select
            value={storeFilter}
            onValueChange={(v) => { setStoreFilter(v); setPage(1) }}
          >
            <SelectTrigger className={cn("h-8 w-40 text-xs", storeFilter !== "all" && "border-primary bg-primary/10 text-primary")}>
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}{s.branch ? " \u2014 " + s.branch : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-auto inline-flex items-center gap-1 h-7 rounded-md px-2.5 text-xs font-medium text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Today", key: "today", from: 0, to: 0 },
            { label: "Yesterday", key: "yesterday", from: 1, to: 1 },
            { label: "7d", key: "7d", from: 6, to: 0 },
            { label: "30d", key: "30d", from: 29, to: 0 },
          ].map(({ label, key, from, to }) => {
            const isPresetActive = selectedDatePreset === key
            const apply = () => {
              if (isPresetActive) {
                setDateFrom(""); setDateTo(""); setSelectedDatePreset(null); setPage(1)
                return
              }
              const fmt = (d) => d.toISOString().split("T")[0]
              const today = new Date(); today.setHours(0, 0, 0, 0)
              const start = new Date(today); start.setDate(start.getDate() - from)
              const end = new Date(today); end.setDate(end.getDate() - to)
              setDateFrom(fmt(start)); setDateTo(fmt(end)); setSelectedDatePreset(key); setPage(1)
            }
            return (
              <button
                key={label}
                type="button"
                onClick={apply}
                className={cn(
                  "h-7 rounded-md border px-2.5 text-xs font-medium transition-colors cursor-pointer",
                  isPresetActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            )
          })}

          <div className="h-5 w-px bg-border" />

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setSelectedDatePreset(null); setPage(1) }}
            className={cn(
              "h-8 rounded-md border bg-background px-2 text-xs cursor-pointer",
              dateFrom ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground"
            )}
            title="From date"
          />
          <span className="text-xs text-muted-foreground">\u2013</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setSelectedDatePreset(null); setPage(1) }}
            className={cn(
              "h-8 rounded-md border bg-background px-2 text-xs cursor-pointer",
              dateTo ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground"
            )}
            title="To date"
          />
        </div>

        <div className="border-t border-border" />

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {PAYMENT_TABS.map(({ key, label, icon: Icon, activeClass, activePillClass }) => {
            let count
            if (filter === "all") {
              count = key === "all" ? filtered.length : filtered.filter((o) => o.payment_method === key).length
            } else if (key === filter) {
              count = filtered.length
            } else {
              count = "\u2013"
            }
            const isActive = filter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => { setFilter(key); setPage(1) }}
                className={cn(
                  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold font-mono uppercase leading-none whitespace-nowrap transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:ring-offset-2",
                  isActive
                    ? activeClass
                    : "border-border text-muted-foreground bg-transparent hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5 stroke-[2.4]" />
                {label}
                <span
                  className={cn(
                    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    isActive ? activePillClass : "bg-muted text-muted-foreground"
                  )}
                  title={count === "\u2013" ? "Count unavailable" : undefined}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-xl border-2 border-border bg-card">
        <div className="relative shrink-0 bg-muted/40 dark:bg-muted/30">
          <div className="grid grid-cols-[0.85fr_1fr_0.85fr_1.1fr_0.75fr_0.95fr_auto] gap-x-2 items-center px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-foreground/60">
            <div className="text-left pl-2">Invoice #</div>
            <div className="text-left">Recipient</div>
            <div className="text-left pl-1">Method</div>
            <div className="text-left">Store</div>
            <button
              type="button"
              onClick={() => toggleSort("amount")}
              className="flex items-center justify-end pr-3 gap-1 cursor-pointer hover:text-foreground/90 transition-colors text-right"
            >
              Amount <SortIcon field="amount" sortField={sortField} sortDir={sortDir} />
            </button>
            <button
              type="button"
              onClick={() => toggleSort("created_at")}
              className="flex items-center justify-center gap-1 cursor-pointer hover:text-foreground/90 transition-colors"
            >
              Time <SortIcon field="created_at" sortField={sortField} sortDir={sortDir} />
            </button>
            <div className="text-center">Actions</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.75 overflow-hidden bg-border">
            <div
              ref={progressRef}
              className="h-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: "0%" }}
            />
          </div>
        </div>
        <div className="relative flex-1 min-h-0">
          <div ref={scrollRef} className="h-full overflow-y-auto scrollbar-hidden">
            <div className="min-w-full text-sm">
              {loading && allPayments.length === 0 ? (
                <div className="divide-y divide-border/50">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <p className="mt-3 text-sm font-medium text-foreground">Could not load payments</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error?.message || "Please try again."}</p>
                  <button
                    type="button"
                    onClick={() => refetch?.({ preserveData: false })}
                    className="mt-4 inline-flex items-center rounded-md border-2 border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : filtered.length > 0 ? (
                <>
                <div className="divide-y divide-border/50">
                  {sortedFiltered.map((item) => (
                    <div
                      key={item.order_id}
                      className="grid grid-cols-[0.85fr_1fr_0.85fr_1.1fr_0.75fr_0.95fr_auto] gap-x-2 items-center px-4 py-3 border-l-2 border-l-transparent hover:border-l-primary hover:bg-muted/80 transition-all duration-150"
                    >
                      <div className="font-mono text-xs font-semibold text-left pl-2">
                        {item.order_id}
                      </div>
                      <div className="text-sm font-medium truncate text-left">
                        {item.recipient_name || "\u2014"}
                      </div>
                      <div className="flex justify-start pl-1">
                        {(() => {
                          const MethodIcon = methodIcons[item.payment_method]
                          return (
                            <Badge variant={methodColors[item.payment_method] || "secondary"} className="uppercase text-[10px] font-bold font-mono min-w-20 justify-center gap-1">
                              {MethodIcon && <MethodIcon className="h-3.5 w-3.5 stroke-[2.4]" />}
                              {item.payment_method === "cod" ? "COD" : item.payment_method === "bkash" ? "bKash" : (item.payment_method || "unknown").toUpperCase()}
                            </Badge>
                          )
                        })()}
                      </div>
                      <div className="text-sm text-muted-foreground truncate text-left">
                        {item.store_name || "—"}{item.store_branch ? ` · ${item.store_branch}` : ""}
                      </div>
                      <div className="text-sm font-medium text-right tabular-nums pr-3">
                        {item.amount != null ? `\u09F3${Number(item.amount).toLocaleString()}` : "\u2014"}
                      </div>
                      <div className="relative flex items-center justify-center text-sm font-medium text-muted-foreground">
                        <span className="text-center">{formatPaymentDate(item.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                          title="View invoice"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); downloadInvoice(item) }}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                          title="Download invoice"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {showSkeletons && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Loading more...</span>
                  </div>
                )}
                {hasNextPage ? (
                  <div ref={sentinelRef} className="h-1" />
                ) : allPayments.length > 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">All payments loaded</p>
                ) : null}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {activeFilterCount > 0 ? "No payments match your filters" : "No payment records found"}
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-md border-2 border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div ref={bottomBlurRef} className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-6 bg-linear-to-t from-card to-transparent opacity-0 transition-opacity duration-200" />
        </div>
      </div>

      <Dialog open={!!previewItem} onOpenChange={(open) => { if (!open) setPreviewItem(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              Invoice #{previewItem?.order_id}
            </DialogTitle>
            <DialogDescription>
              {previewItem?.created_at ? new Date(previewItem.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </DialogDescription>
          </DialogHeader>
          {previewLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : previewItem && (
            <div className="space-y-4 text-sm">
              {(() => { const d = previewDetail || previewItem; return (<>
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recipient</h4>
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{d.recipient_name || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium font-mono">{d.recipient_phone || "—"}</span></div>
                {d.recipient_address && <div className="flex justify-between gap-4"><span className="text-muted-foreground shrink-0">Address</span><span className="font-medium text-right">{d.recipient_address}</span></div>}
                {d.destination_area && <div className="flex justify-between"><span className="text-muted-foreground">Area</span><span className="font-medium">{d.destination_area}</span></div>}
              </div>
              <div className="border-t border-border" />
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pickup Store</h4>
                <div className="flex justify-between"><span className="text-muted-foreground">Store</span><span className="font-medium">{d.store_name || "—"}{d.store_branch ? ` · ${d.store_branch}` : ""}</span></div>
                {d.pickup_address && <div className="flex justify-between gap-4"><span className="text-muted-foreground shrink-0">Address</span><span className="font-medium text-right">{d.pickup_address}</span></div>}
              </div>
              <div className="border-t border-border" />
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Parcel Details</h4>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{(d.parcel_type || "—").replace(/_/g, " ")}</span></div>
                {d.item_description && <div className="flex justify-between gap-4"><span className="text-muted-foreground shrink-0">Description</span><span className="font-medium text-right">{d.item_description}</span></div>}
                {d.item_weight && <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span className="font-medium">{d.item_weight} kg</span></div>}
                {d.notes && <div className="flex justify-between gap-4"><span className="text-muted-foreground shrink-0">Notes</span><span className="font-medium text-right">{d.notes}</span></div>}
              </div>
              <div className="border-t border-border" />
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Payment</h4>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Method</span>
                  {(() => {
                    const MethodIcon = methodIcons[d.payment_method]
                    return (
                      <Badge variant={methodColors[d.payment_method] || "secondary"} className="uppercase text-[10px] font-bold font-mono gap-1">
                        {MethodIcon && <MethodIcon className="h-3.5 w-3.5 stroke-[2.4]" />}
                        {d.payment_method === "cod" ? "COD" : d.payment_method === "bkash" ? "bKash" : (d.payment_method || "").toUpperCase()}
                      </Badge>
                    )
                  })()}
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">COD Amount</span><span className="font-medium tabular-nums">৳{Number(d.cod_amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="success" className="uppercase text-[10px] font-bold font-mono"><CheckCircle className="h-3 w-3" /> Delivered</Badge></div>
              </div>
              <div className="border-t-2 border-foreground pt-3 flex justify-between items-center">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-lg tabular-nums">৳{Number(d.amount || 0).toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={() => downloadInvoice(previewItem)}
                className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              </>)})()} 
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
