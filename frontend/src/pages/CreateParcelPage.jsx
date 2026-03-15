import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Package, PackageOpen, Box, FileText, ShieldAlert, Wallet, CreditCard, CheckCircle2, Smartphone, Clock3, Copy } from 'lucide-react'

const PARCEL_TYPES = new Set(['document', 'small_box', 'medium_parcel', 'large_parcel', 'fragile'])
const PAYMENT_METHODS = new Set(['cod', 'prepaid', 'bkash'])

export default function CreateParcelPage() {
  const navigate = useNavigate()

  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successOrder, setSuccessOrder] = useState(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    store_id: '',
    pickup_address: '',
    recipient_name: '',
    recipient_phone: '',
    recipient_address: '',
    destination_area: '',
    parcel_type: 'small_box',
    item_description: '',
    item_weight: '',
    amount: '',
    payment_method: 'cod',
    cod_amount: '',
    notes: '',
  })

  useEffect(() => {
    api.cachedGet('/api/stores')
      .then(setStores)
      .catch(() => setStores([]))
  }, [])

  function validate() {
    const errs = {}
    if (!form.store_id && !form.pickup_address.trim()) errs.pickup_address = 'Pickup address is required when store is not selected'
    if (!form.recipient_name.trim()) errs.recipient_name = 'Recipient name is required'
    if (!/^01[3-9]\d{8}$/.test(form.recipient_phone))
      errs.recipient_phone = 'Enter a valid BD mobile number (01X-XXXXXXXX)'
    if (!form.recipient_address.trim()) errs.recipient_address = 'Recipient address is required'
    if (!PARCEL_TYPES.has(form.parcel_type)) errs.parcel_type = 'Invalid parcel type selected'
    if (!PAYMENT_METHODS.has(form.payment_method)) errs.payment_method = 'Invalid payment method selected'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Amount must be greater than 0'
    else if (Number(form.amount) > 99999999) errs.amount = 'Amount cannot exceed ৳99,999,999'
    if (form.payment_method === 'cod' && (!form.cod_amount || Number(form.cod_amount) < 0))
      errs.cod_amount = 'COD amount is required'
    else if (form.payment_method === 'cod' && Number(form.cod_amount) > 99999999)
      errs.cod_amount = 'COD amount cannot exceed ৳99,999,999'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        cod_amount: form.payment_method === 'cod' ? (Number(form.cod_amount) || 0) : 0,
      }
      if (!payload.store_id) delete payload.store_id
      if (!payload.pickup_address?.trim()) delete payload.pickup_address

      const createdOrder = await api.post('/api/orders', payload)
      const orderData = createdOrder?.data ?? createdOrder
      setSuccessOrder({
        orderId: orderData?.order_id,
        createdAt: orderData?.created_at,
      })
      setCopied(false)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function closeSuccessModal() {
    setSuccessOrder(null)
    navigate('/deliveries')
  }

  async function copyOrderId() {
    if (!successOrder?.orderId) return
    try {
      await navigator.clipboard?.writeText(successOrder.orderId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/deliveries')}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Create New Parcel</h1>
        </div>
      </div>

      {/* Submit error banner */}
      {errors.submit && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cards row: Pickup + Recipient */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 — Pickup Info */}
          <div className="rounded-xl border-2 border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Pickup Info</h2>

            <div className="space-y-2">
              <Label>Store (optional)</Label>
              <Select value={form.store_id} onValueChange={(val) => setField('store_id', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}{s.branch ? ` — ${s.branch}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!form.store_id && (
              <div className="space-y-2">
                <Label>Pickup Address</Label>
                <Input
                  value={form.pickup_address}
                  onChange={(e) => setField('pickup_address', e.target.value)}
                  placeholder="Enter pickup address"
                />
                {errors.pickup_address && (
                  <p className="text-sm text-destructive">{errors.pickup_address}</p>
                )}
              </div>
            )}
          </div>

          {/* Card 2 — Recipient Info */}
          <div className="rounded-xl border-2 border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Recipient Info</h2>

            <div className="space-y-2">
              <Label>Recipient Name *</Label>
              <Input
                value={form.recipient_name}
                onChange={(e) => setField('recipient_name', e.target.value)}
                placeholder="Full name"
              />
              {errors.recipient_name && (
                <p className="text-sm text-destructive">{errors.recipient_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Recipient Phone *</Label>
              <Input
                value={form.recipient_phone}
                onChange={(e) => setField('recipient_phone', e.target.value)}
                placeholder="01XXXXXXXXX"
              />
              {errors.recipient_phone && (
                <p className="text-sm text-destructive">{errors.recipient_phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Recipient Address *</Label>
              <Input
                value={form.recipient_address}
                onChange={(e) => setField('recipient_address', e.target.value)}
                placeholder="Full delivery address"
              />
              {errors.recipient_address && (
                <p className="text-sm text-destructive">{errors.recipient_address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Destination Area</Label>
              <Input
                value={form.destination_area}
                onChange={(e) => setField('destination_area', e.target.value)}
                placeholder="e.g. Mirpur, Dhanmondi"
              />
            </div>
          </div>
        </div>

        {/* Card 3 — Parcel & Payment (full width) */}
        <div className="rounded-xl border-2 border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Parcel &amp; Payment</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary">Parcel Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { value: 'small_box', label: 'Small', weight: '0.5kg', price: '৳60', icon: Package },
                  { value: 'medium_parcel', label: 'Medium', weight: '2kg', price: '৳80', icon: Box },
                  { value: 'large_parcel', label: 'Large', weight: '5kg', price: '৳120', icon: PackageOpen },
                  { value: 'document', label: 'Document', weight: '0.5kg', price: '৳40', icon: FileText },
                  { value: 'fragile', label: 'Fragile', weight: '1kg', price: '৳100', icon: ShieldAlert },
                ].map((type) => {
                  const isSelected = form.parcel_type === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setField('parcel_type', type.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <type.icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-semibold ${isSelected ? 'text-foreground' : ''}`}>{type.label}</span>
                      <span className="text-xs opacity-70">{type.weight}</span>
                      <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{type.price}</span>
                    </button>
                  )
                })}
              </div>
              {errors.parcel_type && (
                <p className="text-sm text-destructive">{errors.parcel_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Item Weight</Label>
              <Input
                value={form.item_weight}
                onChange={(e) => setField('item_weight', e.target.value)}
                placeholder="e.g. 0-1kg, 1-5kg"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Item Description</Label>
              <Textarea
                value={form.item_description}
                onChange={(e) => setField('item_description', e.target.value)}
                placeholder="Describe the item(s)"
              />
            </div>

            <div className="space-y-2">
              <Label>Order Amount (BDT) *</Label>
              <Input
                type="number"
                max="99999999"
                value={form.amount}
                onChange={(e) => setField('amount', e.target.value)}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary">Payment Method</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery', subtitle: 'Pay when delivered', icon: Wallet },
                  { value: 'prepaid', label: 'Prepaid', subtitle: 'Pay now with card', icon: CreditCard },
                  { value: 'bkash', label: 'bKash', subtitle: 'Collect via bKash payment', icon: Smartphone },
                ].map((method) => {
                  const isSelected = form.payment_method === method.value
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setField('payment_method', method.value)}
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer text-left ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        <method.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-foreground' : 'text-foreground'}`}>{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.subtitle}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
              {errors.payment_method && (
                <p className="text-sm text-destructive">{errors.payment_method}</p>
              )}
            </div>

            {form.payment_method === 'cod' && (
              <div className="space-y-2 md:col-span-2">
                <Label>COD Amount (BDT)</Label>
                <Input
                  type="number"
                  max="99999999"
                  value={form.cod_amount}
                  onChange={(e) => setField('cod_amount', e.target.value)}
                  placeholder="0.00"
                />
                {errors.cod_amount && (
                  <p className="text-sm text-destructive">{errors.cod_amount}</p>
                )}
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Any special instructions"
              />
            </div>

            {/* Cost Summary */}
            <div className="md:col-span-2 rounded-xl border-2 border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">
                  ৳{{
                    small_box: '60', medium_parcel: '80', large_parcel: '120',
                    document: '40', fragile: '100',
                  }[form.parcel_type] || '60'}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Total</span>
                <span className="text-sm font-bold text-primary">
                  ৳{{
                    small_box: '60', medium_parcel: '80', large_parcel: '120',
                    document: '40', fragile: '100',
                  }[form.parcel_type] || '60'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/deliveries')}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? 'Creating…' : 'Create Parcel'}
          </Button>
        </div>
      </form>

      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <p className="mb-5 text-center text-lg font-medium">Your parcel request has been placed</p>

            <div className="mb-5 rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-center text-xs uppercase tracking-wide text-muted-foreground">Order ID</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-mono text-3xl font-bold tracking-wide">{successOrder.orderId || '—'}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyOrderId}
                  className="border-border bg-background text-foreground hover:bg-muted"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && <p className="mt-2 text-xs text-emerald-300">Copied to clipboard</p>}
            </div>

            <p className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              Estimated pickup: 15-30 minutes
            </p>

            <Button type="button" onClick={closeSuccessModal} className="w-full cursor-pointer">
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
