import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getOrder, updateOrderStatus, updateOrder } from "@/api/orders"
import { useCachedQuery } from "@/hooks/use-cached-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft, Clock, UserCheck, Package, Truck, CheckCircle2, XCircle,
  Pencil, X, MapPin, Phone, User, Wallet, Banknote, FileText,
  Scale, ShoppingBag, Calendar, Hash, Store, CreditCard, StickyNote,
  Eye, Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

// \u2500\u2500 Status transitions \u2500\u2500
const VALID_TRANSITIONS = {
  pending: ["assigned"],
  assigned: ["picked_up"],
  picked_up: ["in_transit"],
  in_transit: ["delivered"],
  delivered: [],
}

// \u2500\u2500 Status meta (icon, timeline colors, label) \u2500\u2500
const STATUS_META = {
  pending: {
    icon: Clock,
    label: "Pending",
    badgeVariant: "warning",
    color: "text-foreground bg-amber-500/35 dark:bg-amber-400/45",
    borderColor: "border-amber-500/55 dark:border-amber-400/40",
  },
  assigned: {
    icon: UserCheck,
    label: "Assigned",
    badgeVariant: "info",
    color: "text-foreground bg-indigo-500/35 dark:bg-indigo-400/45",
    borderColor: "border-indigo-500/55 dark:border-indigo-400/40",
  },
  picked_up: {
    icon: Package,
    label: "Picked Up",
    badgeVariant: "info",
    color: "text-foreground bg-blue-500/35 dark:bg-blue-400/45",
    borderColor: "border-blue-500/55 dark:border-blue-400/40",
  },
  in_transit: {
    icon: Truck,
    label: "In Transit",
    badgeVariant: "info",
    color: "text-foreground bg-cyan-500/35 dark:bg-cyan-400/45",
    borderColor: "border-cyan-500/55 dark:border-cyan-400/40",
  },
  delivered: {
    icon: CheckCircle2,
    label: "Delivered",
    badgeVariant: "success",
    color: "text-foreground bg-emerald-500/35 dark:bg-emerald-400/45",
    borderColor: "border-emerald-500/55 dark:border-emerald-400/40",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    badgeVariant: "destructive",
    color: "text-foreground bg-red-500/35 dark:bg-red-400/45",
    borderColor: "border-red-500/55 dark:border-red-400/40",
  },
}

const FALLBACK_META = STATUS_META.pending

// \u2500\u2500 Helpers \u2500\u2500
function formatDetailDate(timestamp) {
  if (!timestamp) return "\u2014"
  const d = new Date(timestamp)
  const day = d.getDate()
  const mod = day % 100
  const suffix = mod >= 11 && mod <= 13 ? "th" : day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th"
  const month = d.toLocaleDateString([], { month: "long" })
  const year = d.getFullYear()
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  return `${day}${suffix} ${month}, ${year} \u2022 ${time}`
}

function formatShortDate(timestamp) {
  if (!timestamp) return "\u2014"
  const d = new Date(timestamp)
  const day = d.getDate()
  const mod = day % 100
  const suffix = mod >= 11 && mod <= 13 ? "th" : day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th"
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  return `${day}${suffix} ${months[d.getMonth()]} \u2022 ${time}`
}

function formatWeight(value) {
  if (value == null || value === "") return "\u2014"
  const raw = String(value).trim()
  if (!raw) return "\u2014"
  return /kg$/i.test(raw) ? raw : `${raw} kg`
}

function getDisplayWeight(order) {
  if (order?.item_weight_kg != null && order.item_weight_kg !== "") {
    return formatWeight(order.item_weight_kg)
  }
  return formatWeight(order?.item_weight)
}

function formatPaymentMethod(method) {
  if (!method) return "\u2014"
  if (method === "cod") return "COD"
  if (method === "bkash") return "bKash"
  return method.toUpperCase()
}

function buildInvoiceHtml(order) {
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "\u2014"

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${order.order_id}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:40px;color:#1a1a1a;max-width:700px;margin:0 auto}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #111;padding-bottom:20px;margin-bottom:24px}
.hdr h1{font-size:28px;font-weight:800;letter-spacing:-0.5px}.hdr .meta{text-align:right;font-size:13px;color:#666;line-height:1.6}
.section{margin-bottom:20px}.section h3{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:8px}
.row{display:flex;justify-content:space-between;gap:16px;padding:6px 0;font-size:14px;border-bottom:1px solid #eee}.row .label{color:#666}.row .value{font-weight:600;text-align:right}
.total{margin-top:16px;border-top:2px solid #111;padding-top:12px;display:flex;justify-content:space-between;font-size:18px;font-weight:800}
.footer{margin-top:40px;text-align:center;font-size:11px;color:#aaa}
@media print{body{padding:20px}}</style></head><body>
<div class="hdr"><div><h1>INVOICE</h1><p style="color:#666;font-size:13px;margin-top:4px">Pathao Courier</p></div>
<div class="meta"><div><strong>#${order.order_id}</strong></div><div>${date}</div><div style="margin-top:4px">Status: ${STATUS_META[order.status]?.label || "Order"}</div></div></div>
<div class="section"><h3>Recipient</h3>
<div class="row"><span class="label">Name</span><span class="value">${order.recipient_name || "—"}</span></div>
<div class="row"><span class="label">Phone</span><span class="value">${order.recipient_phone || "—"}</span></div>
<div class="row"><span class="label">Address</span><span class="value">${order.recipient_address || "—"}</span></div>
<div class="row"><span class="label">Area</span><span class="value">${order.destination_area || "—"}</span></div></div>
<div class="section"><h3>Pickup Store</h3>
<div class="row"><span class="label">Store</span><span class="value">${order.store_name || "—"}${order.store_branch ? " · " + order.store_branch : ""}</span></div>
<div class="row"><span class="label">Pickup Address</span><span class="value">${order.pickup_address || "—"}</span></div></div>
<div class="section"><h3>Parcel Details</h3>
<div class="row"><span class="label">Type</span><span class="value">${(order.parcel_type || "—").replace(/_/g, " ")}</span></div>
<div class="row"><span class="label">Product</span><span class="value">${order.item_description || "—"}</span></div>
<div class="row"><span class="label">Weight</span><span class="value">${getDisplayWeight(order)}</span></div>
<div class="row"><span class="label">Additional Info</span><span class="value">${order.notes || "—"}</span></div></div>
<div class="section"><h3>Payment</h3>
<div class="row"><span class="label">Method</span><span class="value">${formatPaymentMethod(order.payment_method)}</span></div>
<div class="row"><span class="label">COD Amount</span><span class="value">৳${Number(order.cod_amount || 0).toLocaleString()}</span></div></div>
<div class="total"><span>Total Amount</span><span>৳${Number(order.amount || 0).toLocaleString()}</span></div>
<div class="footer">This is a system-generated invoice from Pathao Courier.</div>
</body></html>`
}

function downloadInvoice(order) {
  const blob = new Blob([buildInvoiceHtml(order)], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const popup = window.open(url, "_blank")
  if (popup) {
    popup.onload = () => {
      URL.revokeObjectURL(url)
      popup.print()
    }
  }
}

// \u2500\u2500 Info row \u2500\u2500
function InfoRow({ icon: Icon, label, value, mono, bold }) {
  return (
    <div className="flex items-start gap-1.5 py-0.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
      <span className="w-20 shrink-0 text-[11px] leading-4 text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 flex-1 text-sm leading-snug wrap-break-word", mono && "font-mono", bold && "font-semibold")}>
        {value || "\u2014"}
      </span>
    </div>
  )
}

// \u2500\u2500 Section wrapper \u2500\u2500
function Section({ title, icon: Icon, children, className, actions, stretch = false, contentClassName }) {
  return (
    <Card className={cn(stretch ? "h-full self-stretch" : "self-start", "gap-0 rounded-lg border border-border bg-card py-0", className)}>
      <CardHeader className="px-3.5 pb-0 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-foreground/75">{title}</CardTitle>
          </div>
          {actions ? <div className="flex flex-wrap items-center justify-end gap-1.5">{actions}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={cn("px-3.5 pb-2.5 pt-1", stretch && "flex-1", contentClassName)}>{children}</CardContent>
    </Card>
  )
}

// \u2500\u2500 Skeleton loader \u2500\u2500
function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-border">
        <div className="h-8 w-8 rounded bg-muted" />
        <div className="h-6 w-40 rounded bg-muted" />
      </div>
      <div className="space-y-3 p-4 lg:p-6">
        <div className="h-8 rounded-lg bg-muted" />
        <div className="grid items-start gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-40 rounded-lg bg-muted" />
          <div className="h-40 rounded-lg bg-muted" />
          <div className="h-40 rounded-lg bg-muted" />
        </div>
        <div className="h-60 rounded-lg bg-muted" />
      </div>
    </div>
  )
}

// \u2500\u2500 Timeline item (dashboard-style) \u2500\u2500
function TimelineItem({ entry, isFirst, isLast }) {
  const meta = STATUS_META[entry.status] || FALLBACK_META
  const Icon = meta.icon

  const noteText = entry.note
    ? entry.note.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase())
    : meta.label

  return (
    <div className="group grid grid-cols-[2.75rem_1fr] gap-4">
      {/* Left: icon on vertical line */}
      <div className="relative flex h-full items-center justify-center self-stretch">
        {isFirst && (
          <div className="absolute bottom-[calc(50%+1rem)] left-1/2 top-0 z-1 w-3 -translate-x-1/2 rounded-full bg-card" />
        )}
        {isLast && (
          <div className="absolute bottom-0 left-1/2 top-[calc(50%+1rem)] z-1 w-3 -translate-x-1/2 rounded-full bg-card" />
        )}
        <div className="absolute left-1/2 top-1/2 z-1 h-10 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card" />
        <div className={cn(
          "relative z-10 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-4 bg-background transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100",
          isLast ? "" : "grayscale opacity-55",
          meta.borderColor
        )}>
          <div className={cn("flex h-full w-full items-center justify-center rounded-full", meta.color)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Right: card */}
      <div className="rounded-lg border border-border/80 px-4 py-2.5 transition-all duration-300 ease-out group-hover:border-border group-hover:shadow-sm">
        <p className="text-sm font-semibold leading-snug text-foreground">{meta.label}</p>
        <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDetailDate(entry.changed_at)}
        </div>
        {entry.note && (
          <p className="mt-1 text-xs text-muted-foreground italic">{noteText}</p>
        )}
      </div>
    </div>
  )
}

function InvoiceRow({ label, value, mono, className }) {
  return (
    <div className={cn("grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-3 border-b border-border/70 px-3 py-2.5 last:border-b-0", className)}>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 text-right text-sm font-medium leading-snug wrap-break-word", mono && "font-mono")}>{value || "\u2014"}</span>
    </div>
  )
}

function InvoiceSection({ title, children }) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-foreground/75">{title}</h4>
      <div className="overflow-hidden rounded-lg border border-border bg-card">{children}</div>
    </div>
  )
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Main Component
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const { data: order, loading, refetch } = useCachedQuery(`order-${orderId}`, () => getOrder(orderId))

  const [simulating, setSimulating] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !order) {
      navigate("/deliveries")
    }
  }, [loading, navigate, order])

  useEffect(() => {
    const scrollHosts = Array.from(document.querySelectorAll(".scrollbar-thin"))
      .map((node) => ({
        node,
        rect: node.getBoundingClientRect(),
      }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 200)
      .map(({ node }) => node)

    scrollHosts.forEach((node) => node.classList.add("scrollbar-hidden"))

    return () => {
      scrollHosts.forEach((node) => node.classList.remove("scrollbar-hidden"))
    }
  }, [])

  async function handleSimulate(nextStatus) {
    setSimulating(true)
    try {
      await updateOrderStatus(orderId, nextStatus)
      refetch()
    } catch (err) {
      console.error("Status simulation failed:", err)
    } finally {
      setSimulating(false)
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateOrder(orderId, editForm)
      refetch()
      setEditOpen(false)
    } catch (err) {
      console.error("Edit failed:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSkeleton />
  if (!order) return null

  const nextStatuses = VALID_TRANSITIONS[order.status] || []
  const meta = STATUS_META[order.status] || FALLBACK_META
  const StatusIcon = meta.icon
  const history = order.status_history || []
  const hasDriver = order.driver_name || order.driver_phone
  const hasStore = order.store_name
  const canInvoice = order.status === "delivered"
  const paymentMethodLabel = formatPaymentMethod(order.payment_method)

  return (
    <div>
      {/* \u2500\u2500 Fixed Header \u2500\u2500 */}
      <div className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-border">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/deliveries")}
          className="cursor-pointer shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h1 className="text-lg font-bold tracking-tight font-mono truncate">{order.order_id}</h1>
          <Badge variant={meta.badgeVariant} className="uppercase text-[10px] font-bold font-mono gap-1 shrink-0">
            <StatusIcon className="h-3.5 w-3.5 stroke-[2.4]" />
            {meta.label}
          </Badge>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <Calendar className="h-3.5 w-3.5" />
          {formatShortDate(order.created_at)}
        </div>
      </div>

      {/* \u2500\u2500 Scrollable Content \u2500\u2500 */}
      <div className="p-4 lg:p-6 space-y-3">

        {/* \u2500\u2500 Quick Stats Row \u2500\u2500 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1">
            <Banknote className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Amount</span>
            <span className="text-xs font-bold tabular-nums">
              {order.amount != null ? `\u09F3${Number(order.amount).toLocaleString()}` : "\u2014"}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1">
            <CreditCard className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Payment</span>
            <span className="text-xs font-bold uppercase">{order.payment_method || "\u2014"}</span>
          </div>
          {(order.item_weight || order.item_weight_kg != null) && (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1">
              <Scale className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Weight</span>
              <span className="text-xs font-bold">{getDisplayWeight(order)}</span>
            </div>
          )}
          {order.parcel_type && (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1">
              <ShoppingBag className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Type</span>
              <span className="text-xs font-bold capitalize">{(order.parcel_type || "").replace(/_/g, " ")}</span>
            </div>
          )}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)] xl:items-stretch">
          <div className="space-y-2.5">
            <Section title="Recipient" icon={User}>
              <div className="space-y-0.5">
                <InfoRow icon={User} label="Name" value={order.recipient_name} bold />
                <InfoRow icon={Phone} label="Phone" value={order.recipient_phone} mono />
                <InfoRow icon={MapPin} label="Address" value={order.recipient_address} />
                {order.destination_area && (
                  <InfoRow icon={StickyNote} label="Area / Note" value={order.destination_area} />
                )}
              </div>
            </Section>

            <Section title={hasStore ? "Pickup Store" : "Pickup"} icon={Store}>
              <div className="space-y-0.5">
                {hasStore && (
                  <>
                    <InfoRow icon={Store} label="Store" value={order.store_name} bold />
                    {order.store_branch && (
                      <InfoRow icon={Hash} label="Branch" value={order.store_branch} />
                    )}
                  </>
                )}
                {order.pickup_address && (
                  <InfoRow icon={MapPin} label="Pickup Address" value={order.pickup_address} />
                )}
                {!hasStore && !order.pickup_address && (
                  <p className="py-2 text-sm text-muted-foreground">No pickup info available</p>
                )}
              </div>
            </Section>

            <Section
              title="Payment"
              icon={Wallet}
              actions={canInvoice ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInvoiceOpen(true)}
                    className="h-7 gap-1.5 px-2.5 text-[11px] cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Show Invoice
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(order)}
                    className="h-7 gap-1.5 px-2.5 text-[11px] cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </>
              ) : null}
            >
              <div className="space-y-0.5">
                <InfoRow icon={CreditCard} label="Method" value={paymentMethodLabel} bold />
                <InfoRow icon={Banknote} label="Amount" value={order.amount != null ? `\u09F3${Number(order.amount).toLocaleString()}` : null} bold />
                {order.cod_amount != null && Number(order.cod_amount) > 0 && (
                  <InfoRow icon={Banknote} label="COD Amount" value={`\u09F3${Number(order.cod_amount).toLocaleString()}`} />
                )}
                {!canInvoice && (
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    Invoice actions appear after the parcel reaches a delivered state.
                  </p>
                )}
              </div>
            </Section>

            <Section title="Parcel Details" icon={Package}>
              <div className="space-y-0.5">
                {order.parcel_type && (
                  <InfoRow icon={Package} label="Type" value={(order.parcel_type || "").replace(/_/g, " ")} />
                )}
                {order.item_description && (
                  <InfoRow icon={FileText} label="Product" value={order.item_description} />
                )}
                {(order.item_weight || order.item_weight_kg != null) && (
                  <InfoRow icon={Package} label="Weight" value={getDisplayWeight(order)} />
                )}
                {order.notes && (
                  <InfoRow icon={StickyNote} label="Additional Info" value={order.notes} />
                )}
                {!order.parcel_type && !order.item_description && order.item_weight_kg == null && !order.item_weight && !order.notes && (
                  <p className="py-1 text-xs text-muted-foreground">No parcel details available</p>
                )}
              </div>
            </Section>

            {hasDriver && (
              <Section title="Assigned Driver" icon={Truck}>
                <div className="space-y-0.5">
                  <InfoRow icon={User} label="Driver Name" value={order.driver_name} bold />
                  <InfoRow icon={Phone} label="Driver Phone" value={order.driver_phone} mono />
                </div>
              </Section>
            )}

            {nextStatuses.length > 0 && (
              <Section title="Simulate Status Change" icon={Truck}>
                <p className="mb-3 text-xs text-muted-foreground">
                  Click to simulate the next status transition for this order.
                </p>
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((ns) => {
                    const nsMeta = STATUS_META[ns] || FALLBACK_META
                    const NsIcon = nsMeta.icon
                    return (
                      <Button
                        key={ns}
                        variant="outline"
                        disabled={simulating}
                        onClick={() => handleSimulate(ns)}
                        className="gap-2 capitalize cursor-pointer"
                      >
                        <NsIcon className="h-4 w-4" />
                        {ns.replace(/_/g, " ")}
                      </Button>
                    )
                  })}
                </div>
              </Section>
            )}

            {order.status === "pending" && (
              <Section title="Edit Order" icon={Pencil}>
            {!editOpen ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditForm({
                    recipient_name: order.recipient_name || "",
                    recipient_phone: order.recipient_phone || "",
                    recipient_address: order.recipient_address || "",
                    destination_area: order.destination_area || "",
                    item_description: order.item_description || "",
                    item_weight: order.item_weight_kg ?? (order.item_weight || ""),
                  })
                  setEditOpen(true)
                }}
                className="gap-1.5 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Details
              </Button>
            ) : (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name">Recipient Name</Label>
                    <Input
                      id="edit-name"
                      value={editForm.recipient_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, recipient_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone">Recipient Phone</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.recipient_phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, recipient_phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-address">Recipient Address</Label>
                    <Input
                      id="edit-address"
                      value={editForm.recipient_address}
                      onChange={(e) => setEditForm((f) => ({ ...f, recipient_address: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-area">Area / Note</Label>
                    <Input
                      id="edit-area"
                      value={editForm.destination_area}
                      onChange={(e) => setEditForm((f) => ({ ...f, destination_area: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-weight">Item Weight</Label>
                    <Input
                      id="edit-weight"
                      value={editForm.item_weight}
                      onChange={(e) => setEditForm((f) => ({ ...f, item_weight: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-desc">Product Name</Label>
                    <Input
                      id="edit-desc"
                      value={editForm.item_description}
                      onChange={(e) => setEditForm((f) => ({ ...f, item_description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(false)} className="gap-1.5 cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={saving} className="cursor-pointer">
                    {saving ? "Saving\u2026" : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
              </Section>
            )}
          </div>

          <div className="space-y-2.5 self-stretch">
            <Section title="Delivery Timeline" icon={Clock} className="overflow-hidden" stretch contentClassName="flex">
              {history.length > 0 ? (
                <div className="relative w-full space-y-4 py-2">
                  <div className="pointer-events-none absolute bottom-4 left-5.5 top-4 z-0 w-1 rounded-full bg-slate-500/45 dark:bg-slate-400/25" />
                  {history.map((h, i) => (
                    <TimelineItem
                      key={`${h.status}-${h.changed_at}-${i}`}
                      entry={h}
                      isFirst={i === 0}
                      isLast={i === history.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">No status history available</p>
              )}
            </Section>
          </div>
        </div>

        {/* bottom spacer */}
        <div className="h-4" />
      </div>

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Invoice #{order.order_id}
            </DialogTitle>
            <DialogDescription>
              {order.created_at ? new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "\u2014"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Invoice</div>
                  <div className="mt-1 font-semibold">#{order.order_id}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</div>
                  <div className="mt-1 font-semibold">{meta.label}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</div>
                  <div className="mt-1 font-semibold tabular-nums">৳{Number(order.amount || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <InvoiceSection title="Recipient">
              <InvoiceRow label="Name" value={order.recipient_name} />
              <InvoiceRow label="Phone" value={order.recipient_phone} mono />
              <InvoiceRow label="Address" value={order.recipient_address} />
              {order.destination_area && <InvoiceRow label="Area" value={order.destination_area} />}
            </InvoiceSection>

            <InvoiceSection title="Pickup">
              <InvoiceRow label="Store" value={`${order.store_name || "\u2014"}${order.store_branch ? ` · ${order.store_branch}` : ""}`} />
              {order.pickup_address && <InvoiceRow label="Address" value={order.pickup_address} />}
            </InvoiceSection>

            <InvoiceSection title="Parcel Details">
              <InvoiceRow label="Type" value={(order.parcel_type || "\u2014").replace(/_/g, " ")} />
              <InvoiceRow label="Product" value={order.item_description || "\u2014"} />
              <InvoiceRow label="Weight" value={getDisplayWeight(order)} />
              <InvoiceRow label="Additional Info" value={order.notes || "\u2014"} />
            </InvoiceSection>

            <InvoiceSection title="Payment">
              <InvoiceRow label="Method" value={paymentMethodLabel} />
              <InvoiceRow label="COD Amount" value={`৳${Number(order.cod_amount || 0).toLocaleString()}`} />
              <InvoiceRow label="Status" value={meta.label} />
            </InvoiceSection>

            <Button type="button" onClick={() => downloadInvoice(order)} className="w-full gap-2 cursor-pointer">
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
