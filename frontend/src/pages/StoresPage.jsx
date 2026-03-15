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

function StoreFormFields({ form, onChange }) {
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  const fetchStores = () => {
    return getStores()
      .then((data) => setStores(Array.isArray(data) ? data : []))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStores();
  }, []);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreateModal() {
    setForm(BLANK_FORM);
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
    setEditTarget(store);
    setEditOpen(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Store Name is required.");
      return;
    }
    setSaving(true);
    try {
      await createStore(form);
      setCreateOpen(false);
      setForm(BLANK_FORM);
      await fetchStores();
    } catch (err) {
      alert(err.message || "Failed to create store.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Store Name is required.");
      return;
    }
    setSaving(true);
    try {
      await updateStore(editTarget.id, form);
      setEditOpen(false);
      await fetchStores();
    } catch (err) {
      alert(err.message || "Failed to update store.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(store) {
    if (!window.confirm(`Deactivate ${store.name}?`)) return;
    try {
      await deleteStore(store.id);
      await fetchStores();
    } catch (err) {
      alert(err.message || "Failed to deactivate store.");
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
                        onClick={() => handleDeactivate(store)}
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
            <StoreFormFields form={form} onChange={updateField} />
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
            <StoreFormFields form={form} onChange={updateField} />
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
    </div>
  );
}
