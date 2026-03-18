import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '@/api/orders'
import { getStores } from '@/api/stores'
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, Package, PackageOpen, Box, FileText, ShieldAlert, Wallet, CreditCard, CheckCircle2, Smartphone, Check, MapPin, User, Receipt } from 'lucide-react'
import AddressPicker from '@/components/AddressPicker'
import RoutePreview from '@/components/RoutePreview'

const PARCEL_TYPES = new Set(['document', 'small_box', 'medium_parcel', 'large_parcel', 'fragile'])
const PAYMENT_METHODS = new Set(['cod', 'prepaid', 'bkash'])

// Weight-based delivery fee tiers
function getDeliveryFee(weightKg, parcelType) {
  if (parcelType === 'fragile') return weightKg <= 1 ? 100 : weightKg <= 3 ? 130 : 160
  if (parcelType === 'document') return 40
  if (weightKg <= 0.5) return 60
  if (weightKg <= 2) return 80
  if (weightKg <= 5) return 120
  return 150
}

function getWeightTier(weightKg) {
  if (weightKg <= 0.5) return 'Light (≤0.5 kg)'
  if (weightKg <= 2) return 'Standard (≤2 kg)'
  if (weightKg <= 5) return 'Heavy (≤5 kg)'
  return 'Extra Heavy (>5 kg)'
}
const DRAFT_KEY = 'create_parcel_wizard_draft_v1'
const INITIAL_FORM = {
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
  charge_delivery: true,
  notes: '',
}
const WIZARD_STEPS = [
  { id: 1, label: 'Pickup Info' },
  { id: 2, label: 'Receiver Info' },
  { id: 3, label: 'Parcel Info' },
  { id: 4, label: 'Payment & Charges' },
  { id: 5, label: 'Review & Confirm' },
]

export default function CreateParcelPage() {
  const navigate = useNavigate()

  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(true)
  const [storesError, setStoresError] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(INITIAL_FORM)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.form && typeof parsed.form === 'object') {
        setForm((prev) => ({ ...prev, ...parsed.form }))
      }
      if (Number.isInteger(parsed?.step) && parsed.step >= 1 && parsed.step <= 5) {
        setStep(parsed.step)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }))
    } catch {}
  }, [form, step])

  const loadStores = useCallback(() => {
    setStoresLoading(true)
    setStoresError('')
    getStores()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.stores || []
        setStores(list.filter((s) => s?.is_active !== false))
      })
      .catch(() => {
        setStores([])
        setStoresError('Could not load stores. You can still use manual pickup address.')
      })
      .finally(() => setStoresLoading(false))
  }, [])

  useEffect(() => {
    loadStores()
  }, [loadStores])

  function validate() {
    const errs = {}
    if (!form.store_id && !form.pickup_address.trim()) errs.pickup_address = 'Pickup address is required when store is not selected'
    if (!form.recipient_name.trim()) errs.recipient_name = 'Recipient name is required'
    if (!/^01[3-9]\d{8}$/.test(form.recipient_phone))
      errs.recipient_phone = 'Enter a valid BD mobile number (01X-XXXXXXXX)'
    if (!form.recipient_address.trim()) errs.recipient_address = 'Recipient address is required'
    if (!PARCEL_TYPES.has(form.parcel_type)) errs.parcel_type = 'Invalid parcel type selected'
    if (!form.item_weight || Number(form.item_weight) <= 0) errs.item_weight = 'Item weight is required'
    else if (Number(form.item_weight) > 100) errs.item_weight = 'Weight cannot exceed 100 kg'
    if (!PAYMENT_METHODS.has(form.payment_method)) errs.payment_method = 'Invalid payment method selected'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Product value must be greater than 0'
    else if (Number(form.amount) > 99999999) errs.amount = 'Product value cannot exceed ৳99,999,999'
    return errs
  }

  function validateStep(currentStep) {
    const errs = {}
    if (currentStep === 1) {
      if (!form.store_id && !form.pickup_address.trim()) {
        errs.pickup_address = 'Pickup address is required when store is not selected'
      }
    }
    if (currentStep === 2) {
      if (!form.recipient_name.trim()) errs.recipient_name = 'Recipient name is required'
      if (!/^01[3-9]\d{8}$/.test(form.recipient_phone)) {
        errs.recipient_phone = 'Enter a valid BD mobile number (01X-XXXXXXXX)'
      }
      if (!form.recipient_address.trim()) errs.recipient_address = 'Recipient address is required'
    }
    if (currentStep === 3) {
      if (!PARCEL_TYPES.has(form.parcel_type)) errs.parcel_type = 'Invalid parcel type selected'
      if (!form.item_weight || Number(form.item_weight) <= 0) errs.item_weight = 'Item weight is required'
      else if (Number(form.item_weight) > 100) errs.item_weight = 'Weight cannot exceed 100 kg'
    }
    if (currentStep === 4) {
      if (!PAYMENT_METHODS.has(form.payment_method)) errs.payment_method = 'Invalid payment method selected'
      if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Product value must be greater than 0'
      else if (Number(form.amount) > 99999999) errs.amount = 'Product value cannot exceed ৳99,999,999'
    }
    return errs
  }

  function focusFirstError(errs) {
    const firstField = Object.keys(errs)[0]
    requestAnimationFrame(() => {
      const candidates = Array.from(document.querySelectorAll(`[id="${firstField}"]`))
      const firstInput = candidates.find((el) => el.offsetParent !== null) || candidates[0]
      if (!firstInput) return
      firstInput.scrollIntoView({ block: 'center', behavior: 'smooth' })
      setTimeout(() => firstInput.focus(), 0)
    })
  }

  function handleNextStep() {
    const errs = validateStep(step)
    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }))
      focusFirstError(errs)
      return
    }
    setErrors((prev) => ({ ...prev, submit: undefined }))
    setStep((prev) => Math.min(5, prev + 1))
  }

  function handlePrevStep() {
    setStep((prev) => Math.max(1, prev - 1))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      focusFirstError(errs)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const fee = getDeliveryFee(Number(form.item_weight) || 0, form.parcel_type)
      const productValue = Number(form.amount)
      const codAmount = form.payment_method === 'cod'
        ? productValue + (form.charge_delivery ? fee : 0)
        : 0
      const payload = {
        ...form,
        amount: productValue,
        cod_amount: codAmount,
        item_weight: form.item_weight ? String(form.item_weight) : '',
      }
      delete payload.charge_delivery
      if (!payload.store_id) {
        delete payload.store_id
      } else {
        const parsedStoreId = Number(payload.store_id)
        payload.store_id = Number.isNaN(parsedStoreId) ? payload.store_id : parsedStoreId
        delete payload.pickup_address
      }
      if (!payload.pickup_address?.trim()) delete payload.pickup_address

      const orderData = await createOrder(payload)
      const orderId = orderData?.order_id
      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {}
      setRedirecting(true)
      setTimeout(() => {
        navigate(orderId ? `/deliveries/${orderId}` : '/deliveries')
      }, 900)
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

  function handleStoreChange(value) {
    if (value === '__manual__') {
      setForm((prev) => ({ ...prev, store_id: '' }))
    } else {
      setForm((prev) => ({ ...prev, store_id: value, pickup_address: '' }))
    }
    setErrors((prev) => ({ ...prev, pickup_address: undefined, store_id: undefined }))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-border">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/deliveries')}
          className="cursor-pointer shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Create Parcel</h1>
        </div>
      </div>

      {/* Wizard Stepper — fixed above scroll area */}
      <Card className="shrink-0 mx-4 lg:mx-6 mt-4 lg:mt-6 px-4 sm:px-6 py-4">
        <ol className="grid grid-cols-5" aria-label="Order progress">
          {WIZARD_STEPS.map((s, i) => {
            const isCompleted = step > s.id
            const isCurrent = step === s.id
            const isLast = i === WIZARD_STEPS.length - 1
            const Icon = s.id === 1 ? MapPin : s.id === 2 ? User : s.id === 3 ? Package : s.id === 4 ? Wallet : Receipt
            return (
              <li key={s.id} className="relative flex flex-col items-center">
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={`absolute top-[17px] left-1/2 w-full h-1 transition-colors duration-300 ${
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <button
                  type="button"
                  onClick={() => s.id < step && setStep(s.id)}
                  disabled={s.id > step}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground cursor-pointer'
                      : isCurrent
                      ? 'border-primary bg-card text-primary ring-4 ring-primary/15'
                      : 'border-muted-foreground/30 bg-card text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </button>
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs font-medium text-center leading-tight ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </li>
            )
          })}
        </ol>
      </Card>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 space-y-4">
      {/* Submit error banner */}
      {errors.submit && (
        <div role="alert" aria-live="assertive" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <form id="parcel-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1 — Pickup Info */}
        {step === 1 && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Pickup Info</CardTitle>
                  <CardDescription>Where should we pick up the parcel?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">

            <div className="space-y-2">
              <Label htmlFor="store_id">Store (optional)</Label>
              <Select value={form.store_id || '__manual__'} onValueChange={handleStoreChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__manual__">No store (use manual pickup address)</SelectItem>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}{s.branch ? ` — ${s.branch}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {storesLoading && <p className="text-xs text-muted-foreground">Loading stores...</p>}
              {storesError && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-destructive">{storesError}</p>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={loadStores}
                    className="h-auto p-0 cursor-pointer"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>

            {!form.store_id && (
              <div className="space-y-2">
                <Label htmlFor="pickup_address">Pickup Address *</Label>
                <AddressPicker
                  label="Pickup Address"
                  value={form.pickup_address}
                  onChange={(addr) => setField('pickup_address', addr)}
                />
                {errors.pickup_address && (
                  <p id="pickup_address_error" className="text-sm text-destructive">{errors.pickup_address}</p>
                )}
              </div>
            )}
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Receiver Info */}
        {step === 2 && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Receiver Info</CardTitle>
                  <CardDescription>Who will receive this parcel?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_name">Recipient Name *</Label>
                <Input
                  id="recipient_name"
                  aria-invalid={Boolean(errors.recipient_name)}
                  aria-describedby={errors.recipient_name ? 'recipient_name_error' : undefined}
                  value={form.recipient_name}
                  onChange={(e) => setField('recipient_name', e.target.value)}
                />
                {errors.recipient_name && (
                  <p id="recipient_name_error" className="text-sm text-destructive">{errors.recipient_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_phone">Recipient Phone *</Label>
                <Input
                  id="recipient_phone"
                  aria-invalid={Boolean(errors.recipient_phone)}
                  aria-describedby={errors.recipient_phone ? 'recipient_phone_error' : undefined}
                  value={form.recipient_phone}
                  onChange={(e) => setField('recipient_phone', e.target.value)}
                />
                {errors.recipient_phone && (
                  <p id="recipient_phone_error" className="text-sm text-destructive">{errors.recipient_phone}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="recipient_address">Recipient Address *</Label>
                <AddressPicker
                  label="Recipient Address"
                  value={form.recipient_address}
                  onChange={(addr) => setField('recipient_address', addr)}
                />
                {errors.recipient_address && (
                  <p id="recipient_address_error" className="text-sm text-destructive">{errors.recipient_address}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Additional Note</Label>
                <Input
                  placeholder="e.g. Near Bashundhara gate, beside Jamuna Future Park..."
                  value={form.destination_area}
                  onChange={(e) => setField('destination_area', e.target.value)}
                />
              </div>
            </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Parcel Info */}
        {step === 3 && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Parcel Info</CardTitle>
                  <CardDescription>What are you sending?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary">Parcel Type *</Label>
              <div role="radiogroup" aria-label="Parcel Type" className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { value: 'document', label: 'Document', icon: FileText },
                  { value: 'small_box', label: 'Small Box', icon: Package },
                  { value: 'medium_parcel', label: 'Medium', icon: Box },
                  { value: 'large_parcel', label: 'Large', icon: PackageOpen },
                  { value: 'fragile', label: 'Fragile', icon: ShieldAlert },
                ].map((type) => {
                  const isSelected = form.parcel_type === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setField('parcel_type', type.value)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground'
                      }`}
                    >
                      <type.icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-bold ${isSelected ? 'text-foreground' : ''}`}>{type.label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.parcel_type && (
                <p className="text-sm text-destructive">{errors.parcel_type}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="item_weight">Item Weight (kg) *</Label>
                <Input
                  id="item_weight"
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  aria-invalid={Boolean(errors.item_weight)}
                  aria-describedby={errors.item_weight ? 'item_weight_error' : undefined}
                  value={form.item_weight}
                  onChange={(e) => setField('item_weight', e.target.value)}
                  placeholder="e.g. 1.5"
                />
                {form.item_weight && Number(form.item_weight) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {getWeightTier(Number(form.item_weight))} — Est. delivery fee: ৳{getDeliveryFee(Number(form.item_weight), form.parcel_type)}
                  </p>
                )}
                {errors.item_weight && (
                  <p id="item_weight_error" className="text-sm text-destructive">{errors.item_weight}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Item Description</Label>
                <Textarea
                  value={form.item_description}
                  onChange={(e) => setField('item_description', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                />
              </div>
            </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 — Payment & Charges */}
        {step === 4 && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Payment & Charges</CardTitle>
                  <CardDescription>How will this be paid?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">

            <div className="space-y-2">
              <Label htmlFor="amount">Product Value (BDT) *</Label>
              <Input
                id="amount"
                type="number"
                max="99999999"
                min="1"
                step="1"
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? 'amount_error' : undefined}
                value={form.amount}
                onChange={(e) => setField('amount', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Value of the product being shipped.</p>
              {errors.amount && (
                <p id="amount_error" className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary">Payment Method *</Label>
              <div role="radiogroup" aria-label="Payment Method" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery', subtitle: 'Collect on delivery', icon: Wallet },
                  { value: 'prepaid', label: 'Prepaid', subtitle: 'Already paid online', icon: CreditCard },
                  { value: 'bkash', label: 'bKash', subtitle: 'Collect via bKash', icon: Smartphone },
                ].map((method) => {
                  const isSelected = form.payment_method === method.value
                  return (
                    <button
                      key={method.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setField('payment_method', method.value)}
                      className={`flex items-center gap-2 rounded-lg border p-4 transition-all duration-200 cursor-pointer text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        <method.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${isSelected ? 'text-foreground' : 'text-foreground'}`}>{method.label}</p>
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

            {/* Delivery fee charge toggle */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary">Delivery Fee</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: true, label: 'Charge Customer', subtitle: 'Customer pays delivery fee' },
                  { value: false, label: 'Free Delivery', subtitle: 'Merchant absorbs delivery fee' },
                ].map((opt) => {
                  const isSelected = form.charge_delivery === opt.value
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => setField('charge_delivery', opt.value)}
                      className={`flex flex-col rounded-lg border px-3 py-2.5 transition-all duration-200 cursor-pointer text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      <span className={`text-sm font-bold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.subtitle}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cost Summary */}
            {(() => {
              const fee = getDeliveryFee(Number(form.item_weight) || 0, form.parcel_type)
              const productValue = Number(form.amount) || 0
              const collectAmount = form.payment_method === 'cod'
                ? productValue + (form.charge_delivery ? fee : 0)
                : (form.charge_delivery ? fee : 0)
              return (
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Product Value</span>
                    <span className="font-medium">৳{productValue || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee {!form.charge_delivery && '(Merchant pays)'}</span>
                    <span className={`font-medium ${!form.charge_delivery ? 'line-through text-muted-foreground' : ''}`}>৳{fee}</span>
                  </div>
                  <Separator />
                  {form.payment_method === 'cod' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">Collect from Customer</span>
                      <span className="text-sm font-bold text-primary">৳{collectAmount}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Total Delivery Cost</span>
                    <span className="text-sm font-bold text-foreground">৳{fee}</span>
                  </div>
                </div>
              )
            })()}
            </CardContent>
          </Card>
        )}

        {/* Step 5 — Review & Confirm */}
        {step === 5 && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Review & Confirm</CardTitle>
                  <CardDescription>Please verify your parcel details before submitting</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

            {/* Route Map Preview */}
            <RoutePreview
              pickupAddress={form.store_id
                ? (stores.find(s => String(s.id) === form.store_id)?.address || stores.find(s => String(s.id) === form.store_id)?.name || '')
                : form.pickup_address}
              dropoffAddress={form.recipient_address}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Pickup
                  </h3>
                  <Button type="button" variant="link" size="xs" onClick={() => setStep(1)} className="h-auto p-0 cursor-pointer">Edit</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {form.store_id ? stores.find(s => String(s.id) === form.store_id)?.name || 'Selected Store' : form.pickup_address || '—'}
                </p>
              </Card>

              {/* Receiver Summary */}
              <Card className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Receiver
                  </h3>
                  <Button type="button" variant="link" size="xs" onClick={() => setStep(2)} className="h-auto p-0 cursor-pointer">Edit</Button>
                </div>
                <p className="text-sm font-medium">{form.recipient_name || '—'}</p>
                <p className="text-sm text-muted-foreground">{form.recipient_phone || '—'}</p>
                <p className="text-sm text-muted-foreground">{form.recipient_address || '—'}</p>
              </Card>

              {/* Parcel Summary */}
              <Card className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" /> Parcel
                  </h3>
                  <Button type="button" variant="link" size="xs" onClick={() => setStep(3)} className="h-auto p-0 cursor-pointer">Edit</Button>
                </div>
                <p className="text-sm">
                  <span className="font-medium capitalize">{form.parcel_type?.replace('_', ' ')}</span>
                  {form.item_weight && <span className="text-muted-foreground"> • {form.item_weight} kg</span>}
                </p>
                {form.item_weight && Number(form.item_weight) > 0 && (
                  <p className="text-xs text-muted-foreground">{getWeightTier(Number(form.item_weight))}</p>
                )}
                {form.item_description && <p className="text-sm text-muted-foreground">{form.item_description}</p>}
                {form.notes && <p className="text-sm text-muted-foreground italic">Note: {form.notes}</p>}
              </Card>

              {/* Payment Summary */}
              <Card className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" /> Payment
                  </h3>
                  <Button type="button" variant="link" size="xs" onClick={() => setStep(4)} className="h-auto p-0 cursor-pointer">Edit</Button>
                </div>
                <p className="text-sm">
                  <span className="font-medium capitalize">{form.payment_method === 'cod' ? 'Cash on Delivery' : form.payment_method === 'bkash' ? 'bKash' : 'Prepaid'}</span>
                </p>
                <p className="text-sm">Product Value: <span className="font-medium">৳{form.amount || '0'}</span></p>
                <p className="text-sm">Delivery: <span className="font-medium">{form.charge_delivery ? 'Customer pays' : 'Free (Merchant pays)'}</span></p>
              </Card>
            </div>

            {/* Final Cost Summary */}
            {(() => {
              const fee = getDeliveryFee(Number(form.item_weight) || 0, form.parcel_type)
              const productValue = Number(form.amount) || 0
              const collectAmount = form.payment_method === 'cod'
                ? productValue + (form.charge_delivery ? fee : 0)
                : (form.charge_delivery ? fee : 0)
              return (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Product Value</span>
                    <span className="font-medium">৳{productValue}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee {!form.charge_delivery && '(Merchant pays)'}</span>
                    <span className={`font-medium ${!form.charge_delivery ? 'line-through text-muted-foreground' : ''}`}>৳{fee}</span>
                  </div>
                  {form.payment_method === 'cod' && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">Collect from Customer</span>
                        <span className="text-sm font-bold text-primary">৳{collectAmount}</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-foreground">Delivery Cost</span>
                    <span className="text-lg font-bold text-foreground">৳{fee}</span>
                  </div>
                </div>
              )
            })()}
            </CardContent>
          </Card>
        )}
      </form>
      </div>

      {/* Fixed Navigation Footer */}
      <div className="shrink-0 flex items-center justify-end gap-3 py-3 px-4 lg:px-6 border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/deliveries')}
          className="cursor-pointer mr-auto"
        >
          Cancel
        </Button>
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            className="cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        {step < 5 ? (
          <Button type="button" onClick={handleNextStep} className="cursor-pointer min-w-[120px]">
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" form="parcel-form" disabled={loading} className="cursor-pointer min-w-[120px]">
            {loading ? 'Creating…' : 'Confirm'}
          </Button>
        )}
      </div>

      {/* Redirect loading overlay */}
      {redirecting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="relative flex items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <Package className="absolute h-7 w-7 text-primary" />
          </div>
          <p className="mt-4 text-lg font-medium text-foreground">Creating your parcel...</p>
          <p className="mt-1 text-sm text-muted-foreground">Redirecting to delivery details</p>
        </div>
      )}
    </div>
  )
}
