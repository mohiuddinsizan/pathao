import { useEffect, useState } from "react";
import { getStores, createStore, updateStore, deleteStore, reactivateStore, permanentlyDeleteStore } from "@/api/stores";
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
import { MapPin, Phone, Plus, Pencil, PowerOff, Power, Trash2, Search, X, SlidersHorizontal } from "lucide-react";
import AddressPicker from "@/components/AddressPicker";

const BLANK_FORM = {
  name: "",
  branch: "",
  address: "",
  city: "",
  zone: "",
  phone: "",
};

function StoreInfoRow({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-1.5 py-0.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
      <span className="w-16 shrink-0 text-[11px] leading-4 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-sm leading-snug wrap-break-word">{value}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card className="gap-0 rounded-lg border border-border bg-card py-0">
      <CardHeader className="px-3.5 pb-0 pt-2">
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-2 px-3.5 pb-2.5 pt-1">
        <div className="h-3.5 w-full rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-5/6 rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-2/3 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  );
}

function StoreFormFields({ form, onChange, nameError, addressError, phoneError }) {
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
        <Label htmlFor="form-address">
          Address <span className="text-destructive">*</span>
        </Label>
        <AddressPicker
          label="Store Address"
          value={form.address}
          onChange={(addr) => onChange("address", addr)}
        />
        {addressError ? (
          <p className="text-xs text-destructive">{addressError}</p>
        ) : null}
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
        <Label htmlFor="form-phone">
          Phone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="form-phone"
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="e.g. 01700000000"
        />
        {phoneError ? (
          <p className="text-xs text-destructive">{phoneError}</p>
        ) : null}
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
  const [formErrors, setFormErrors] = useState({ name: "", address: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [reactivating, setReactivating] = useState(null);
  const [deletePermOpen, setDeletePermOpen] = useState(false);
  const [deletePermTarget, setDeletePermTarget] = useState(null);
  const [deletingPerm, setDeletingPerm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"
  const [filtersVisible, setFiltersVisible] = useState(false);

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
    if (key === "name" || key === "address" || key === "phone") {
      setFormErrors((prev) => ({ ...prev, [key]: "" }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreateModal() {
    setForm(BLANK_FORM);
    setFormErrors({ name: "", address: "", phone: "" });
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
    setFormErrors({ name: "", address: "", phone: "" });
    setEditTarget(store);
    setEditOpen(true);
  }

  function validateForm() {
    const errors = { name: "", address: "", phone: "" };
    if (!form.name.trim()) {
      errors.name = "Store Name is required.";
    }
    if (!form.address.trim()) {
      errors.address = "Address is required.";
    }
    if (!form.phone.trim()) {
      errors.phone = "Phone is required.";
    }
    setFormErrors(errors);
    return !errors.name && !errors.address && !errors.phone;
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

  async function handleReactivate(store) {
    setReactivating(store.id);
    try {
      await reactivateStore(store.id);
      setNotice({ type: "success", message: `${store.name || "Store"} reactivated.` });
      await fetchStores();
    } catch (err) {
      setNotice({
        type: "error",
        message: err?.message || "Failed to reactivate store.",
      });
    } finally {
      setReactivating(null);
    }
  }

  function requestPermanentDelete(store) {
    setDeletePermTarget(store);
    setDeletePermOpen(true);
  }

  async function handlePermanentDelete() {
    if (!deletePermTarget) return;
    setDeletingPerm(true);
    try {
      await permanentlyDeleteStore(deletePermTarget.id);
      setDeletePermOpen(false);
      setDeletePermTarget(null);
      setNotice({ type: "success", message: "Store permanently deleted." });
      await fetchStores();
    } catch (err) {
      setNotice({
        type: "error",
        message: err?.message || "Failed to delete store.",
      });
    } finally {
      setDeletingPerm(false);
    }
  }

  const filteredStores = stores
    .filter((s) => {
      if (statusFilter === "active") return s.is_active !== false;
      if (statusFilter === "inactive") return s.is_active === false;
      return true;
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (s.name || "").toLowerCase().includes(q) ||
        (s.branch || "").toLowerCase().includes(q) ||
        (s.address || "").toLowerCase().includes(q) ||
        (s.phone || "").includes(q) ||
        (s.city || "").toLowerCase().includes(q)
      );
    });

  const activeFilterCount = [
    searchQuery.trim() !== "",
    statusFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-4 lg:p-6">
      {/* Sticky header */}
      <div className="shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`h-9 gap-1.5 cursor-pointer ${filtersVisible || activeFilterCount > 0 ? "border-primary text-primary" : ""}`}
            onClick={() => setFiltersVisible((v) => !v)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {activeFilterCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 inline-flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button size="sm" onClick={openCreateModal} className="h-9 gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" />
            Add Store
          </Button>
        </div>
      </div>

      {/* Collapsible filter bar */}
      {filtersVisible && (
        <div className="shrink-0 rounded-lg border border-border bg-card px-3 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Name, address, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center rounded-md border border-border text-xs">
              {[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`px-3 py-1.5 cursor-pointer transition-colors ${
                    statusFilter === value
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  } ${value === "all" ? "rounded-l-md" : ""} ${value === "inactive" ? "rounded-r-md" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="ml-auto inline-flex items-center gap-1 h-7 rounded-md px-2.5 text-xs font-medium text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {notice ? (
        <div
          className={`shrink-0 rounded-md border px-3 py-2 text-sm ${
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
        <div className="shrink-0 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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

      {/* Scrollable store cards */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <Card
              key={store.id}
              className={`gap-0 rounded-lg border border-border bg-card py-0 transition-shadow duration-200 ${
                store.is_active === false ? "opacity-55" : "hover:shadow-sm"
              }`}
            >
              <CardHeader className="px-3.5 pb-0 pt-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-bold uppercase tracking-wide text-foreground/75">
                      {store.branch || store.name || "Unnamed Store"}
                    </CardTitle>
                    <CardDescription className="pt-0.5 text-[11px] leading-4 text-muted-foreground">
                      {store.branch && store.name
                        ? store.name
                        : store.zone && store.city
                          ? `${store.zone}, ${store.city}`
                          : store.zone || store.city || ""}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {store.is_active === false && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase tracking-wide">Inactive</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6.5 w-6.5 cursor-pointer"
                      onClick={() => openEditModal(store)}
                      title="Edit store"
                    >
                      <Pencil className="h-3.25 w-3.25" />
                    </Button>
                    {store.is_active !== false && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6.5 w-6.5 cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => requestDeactivate(store)}
                        title="Deactivate store"
                      >
                        <PowerOff className="h-3.25 w-3.25" />
                      </Button>
                    )}
                    {store.is_active === false && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6.5 w-6.5 cursor-pointer text-emerald-600 hover:text-emerald-600"
                        onClick={() => handleReactivate(store)}
                        disabled={reactivating === store.id}
                        title="Reactivate store"
                      >
                        <Power className="h-3.25 w-3.25" />
                      </Button>
                    )}
                    {store.is_active === false && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6.5 w-6.5 cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => requestPermanentDelete(store)}
                        title="Permanently delete store"
                      >
                        <Trash2 className="h-3.25 w-3.25" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-0 px-3.5 pb-2.5 pt-1">
                {store.branch ? <StoreInfoRow icon={MapPin} label="Store" value={store.name || ""} /> : null}
                <StoreInfoRow
                  icon={MapPin}
                  label="Area"
                  value={store.zone && store.city ? `${store.zone}, ${store.city}` : store.zone || store.city || ""}
                />
                <StoreInfoRow icon={MapPin} label="Address" value={store.address} />
                <StoreInfoRow icon={Phone} label="Phone" value={store.phone} />
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full gap-0 rounded-lg border border-border bg-card py-0">
            <CardContent className="px-3.5 py-8 text-center text-sm text-muted-foreground">
              {activeFilterCount > 0
                ? "No stores match your filters."
                : "No stores found. Click \"Add Store\" to create your first pickup location."}
            </CardContent>
          </Card>
        )}
        </div>
      </div>

      {/* Create Store Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
            <DialogDescription className="sr-only">Fill in the store details below</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <StoreFormFields
              form={form}
              onChange={updateField}
              nameError={formErrors.name}
              addressError={formErrors.address}
              phoneError={formErrors.phone}
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
            <DialogDescription className="sr-only">Update the store details below</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <StoreFormFields
              form={form}
              onChange={updateField}
              nameError={formErrors.name}
              addressError={formErrors.address}
              phoneError={formErrors.phone}
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

      <Dialog
        open={deletePermOpen}
        onOpenChange={(open) => {
          setDeletePermOpen(open);
          if (!open) setDeletePermTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Store</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data for{" "}
              <strong>{deletePermTarget?.name || "this store"}</strong> will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletePermOpen(false)}
              disabled={deletingPerm}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePermanentDelete}
              disabled={deletingPerm}
              className="cursor-pointer"
            >
              {deletingPerm ? "Deleting…" : "Delete Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
