import { useEffect, useState } from "react";
import { getStores, createStore, updateStore, deleteStore } from "@/api/stores";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Phone, Plus, Pencil, PowerOff } from "lucide-react";

const BLANK_FORM = {
  name: "",
  branch: "",
  address: "",
  city: "",
  zone: "",
  phone: "",
};

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="h-4 w-36 rounded bg-muted animate-pulse" />
        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  );
}

function StoreFormFields({ form, onChange, nameError }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="form-name">
          Store Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="form-name"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="e.g. Main Warehouse"
          required
        />
        {nameError ? (
          <p className="text-xs text-destructive">{nameError}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="form-branch">Branch</Label>
        <Input
          id="form-branch"
          value={form.branch}
          onChange={(e) => onChange("branch", e.target.value)}
          placeholder="e.g. North Branch"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="form-address">Address</Label>
        <Input
          id="form-address"
          value={form.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Street address"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="form-city">City</Label>
          <Input
            id="form-city"
            value={form.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="e.g. Dhaka"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="form-zone">Zone</Label>
          <Input
            id="form-zone"
            value={form.zone}
            onChange={(e) => onChange("zone", e.target.value)}
            placeholder="e.g. Zone 1"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="form-phone">Phone</Label>
        <Input
          id="form-phone"
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="e.g. 01700000000"
        />
      </div>
    </>
  );
}

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [formErrors, setFormErrors] = useState({ name: "" });
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const fetchStores = () => {
    setLoadError("");
    return getStores()
      .then((data) => setStores(Array.isArray(data) ? data : []))
      .catch((err) => {
        setStores([]);
        setLoadError(err?.message || "Failed to load stores.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStores();
  }, []);

  function updateField(key, value) {
    if (key === "name") {
      setFormErrors((prev) => ({ ...prev, name: "" }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreateModal() {
    setForm(BLANK_FORM);
    setFormErrors({ name: "" });
    setCreateOpen(true);
  }

  function openEditModal(store) {
    setForm({
      name: store.name || "",
      branch: store.branch || "",
      address: store.address || "",
      city: store.city || "",
      zone: store.zone || "",
      phone: store.phone || "",
    });
    setFormErrors({ name: "" });
    setEditTarget(store);
    setEditOpen(true);
  }

  function validateForm() {
    const errors = { name: "" };
    if (!form.name.trim()) {
      errors.name = "Store Name is required.";
    }
    setFormErrors(errors);
    return !errors.name;
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      await createStore(form);
      setCreateOpen(false);
      setForm(BLANK_FORM);
      setNotice({ type: "success", message: "Store created successfully." });
      await fetchStores();
    } catch (err) {
      setNotice({
        type: "error",
        message: err?.message || "Failed to create store.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      await updateStore(editTarget.id, form);
      setEditOpen(false);
      setNotice({ type: "success", message: "Store updated successfully." });
      await fetchStores();
    } catch (err) {
      setNotice({
        type: "error",
        message: err?.message || "Failed to update store.",
      });
    } finally {
      setSaving(false);
    }
  }

  function requestDeactivate(store) {
    setDeactivateTarget(store);
    setConfirmOpen(true);
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await deleteStore(deactivateTarget.id);
      setConfirmOpen(false);
      setDeactivateTarget(null);
      setNotice({ type: "success", message: "Store deactivated." });
      await fetchStores();
    } catch (err) {
      setNotice({
        type: "error",
        message: err?.message || "Failed to deactivate store.",
      });
    } finally {
      setDeactivating(false);
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your registered pickup locations
          </p>
        </div>
        <Button onClick={openCreateModal} className="shrink-0 cursor-pointer">
          <Plus className="h-4 w-4" />
          Add Store
        </Button>
      </div>

      {notice ? (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-medium opacity-80 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {!loading && loadError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <div className="flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                fetchStores();
              }}
              className="h-7 cursor-pointer"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : null}

      {/* Store Card Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : stores.length > 0 ? (
          stores.map((store) => (
            <Card
              key={store.id}
              className={`transition-shadow duration-200 ${
                store.is_active === false ? "opacity-50" : "hover:shadow-md"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">
                      {store.branch || store.name || "Unnamed Store"}
                    </CardTitle>
                    <CardDescription>
                      {store.zone && store.city
                        ? `${store.zone}, ${store.city}`
                        : store.zone || store.city || ""}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {store.is_active === false && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 cursor-pointer"
                      onClick={() => openEditModal(store)}
                      title="Edit store"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {store.is_active !== false && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive cursor-pointer"
                        onClick={() => requestDeactivate(store)}
                        title="Deactivate store"
                      >
                        <PowerOff className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                {store.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No stores found. Click &quot;Add Store&quot; to create your first
              pickup location.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Store Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <StoreFormFields
              form={form}
              onChange={updateField}
              nameError={formErrors.name}
            />
            <Button
              type="submit"
              disabled={saving}
              className="w-full cursor-pointer"
            >
              {saving ? "Creating…" : "Create Store"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Store Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <StoreFormFields
              form={form}
              onChange={updateField}
              nameError={formErrors.name}
            />
            <Button
              type="submit"
              disabled={saving}
              className="w-full cursor-pointer"
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setDeactivateTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Store</DialogTitle>
            <DialogDescription>
              {deactivateTarget
                ? `Are you sure you want to deactivate ${deactivateTarget.name || "this store"}?`
                : "Are you sure you want to deactivate this store?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deactivating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivating}
              className="cursor-pointer"
            >
              {deactivating ? "Deactivating…" : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
