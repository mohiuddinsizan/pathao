import { useEffect, useState } from "react";
import { getStores } from "@/api/stores";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Package, CreditCard, Store } from "lucide-react";

const STORAGE_KEY = "pathao-merchant-settings";

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const PARCEL_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "documents", label: "Documents" },
  { value: "fragile", label: "Fragile" },
  { value: "large", label: "Large / Bulky" },
];

const PAYMENT_MODES = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "prepaid", label: "Prepaid" },
];

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [stores, setStores] = useState([]);
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    getStores()
      .then((data) => setStores(Array.isArray(data) ? data : data.stores || []))
      .catch(() => setStores([]));
  }, []);

  const update = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure defaults and preferences for your merchant account.
        </p>
      </div>

      {/* Defaults */}
      <div className="rounded-xl border-2 border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
          <Store className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Defaults</h2>
        </div>
        <div className="divide-y divide-border/50 px-5">
          <SettingRow
            label="Default Store"
            description="Pre-selected store when creating new parcels"
          >
            <Select
              value={settings.defaultStore || "none"}
              onValueChange={(v) => update("defaultStore", v === "none" ? "" : v)}
            >
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                    {s.branch ? ` — ${s.branch}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            label="Default Parcel Type"
            description="Pre-selected parcel type for new deliveries"
          >
            <Select
              value={settings.defaultParcelType || "standard"}
              onValueChange={(v) => update("defaultParcelType", v)}
            >
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARCEL_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            label="Default Payment Mode"
            description="Pre-selected payment mode for new deliveries"
          >
            <Select
              value={settings.defaultPaymentMode || "cod"}
              onValueChange={(v) => update("defaultPaymentMode", v)}
            >
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border-2 border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Notifications</h2>
        </div>
        <div className="divide-y divide-border/50 px-5">
          <SettingRow
            label="Parcel created"
            description="When a new parcel is created on your account"
          >
            <Toggle
              checked={settings.notifParcelCreated !== false}
              onChange={(v) => update("notifParcelCreated", v)}
            />
          </SettingRow>

          <SettingRow
            label="Status changes"
            description="When a parcel status is updated (assigned, picked up, etc.)"
          >
            <Toggle
              checked={settings.notifStatusChange !== false}
              onChange={(v) => update("notifStatusChange", v)}
            />
          </SettingRow>

          <SettingRow
            label="Delivery completed"
            description="When a parcel is successfully delivered"
          >
            <Toggle
              checked={settings.notifDeliveryComplete !== false}
              onChange={(v) => update("notifDeliveryComplete", v)}
            />
          </SettingRow>

          <SettingRow
            label="Store events"
            description="When a store is activated, deactivated, or modified"
          >
            <Toggle
              checked={settings.notifStoreEvents !== false}
              onChange={(v) => update("notifStoreEvents", v)}
            />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}
