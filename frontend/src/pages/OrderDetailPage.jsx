import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, updateOrderStatus, updateOrder } from "@/api/orders";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Clock,
  UserCheck,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Pencil,
  X,
} from "lucide-react";

// ── Status transitions ──
const VALID_TRANSITIONS = {
  pending: ["assigned"],
  assigned: ["picked_up"],
  picked_up: ["in_transit"],
  in_transit: ["delivered"],
  delivered: [],
};

// ── Status icon + color mapping ──
const STATUS_META = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending" },
  assigned: { icon: UserCheck, color: "text-violet-500", label: "Assigned" },
  picked_up: { icon: Package, color: "text-blue-400", label: "Picked Up" },
  in_transit: { icon: Truck, color: "text-blue-500", label: "In Transit" },
  delivered: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    label: "Delivered",
  },
  cancelled: { icon: XCircle, color: "text-red-500", label: "Cancelled" },
};

const statusBadgeVariant = {
  pending: "warning",
  assigned: "info",
  picked_up: "info",
  in_transit: "info",
  delivered: "success",
  cancelled: "destructive",
};

// ── Skeleton loader ──
function PageSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6 animate-pulse">
      <div className="h-5 w-40 rounded bg-muted" />
      <div className="h-8 w-56 rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 rounded-xl bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
      </div>
      <div className="h-60 rounded-xl bg-muted" />
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const {
    data: order,
    loading,
    refetch,
  } = useCachedQuery(`order-${orderId}`, () => getOrder(orderId));

  const [simulating, setSimulating] = useState(false);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Redirect on error ──
  // Since useCachedQuery doesn't redirect on 404 naturally, we can handle it if order is null and not loading:
  if (!loading && !order) {
    navigate("/deliveries");
    return null;
  }

  // ── Simulate status change ──
  async function handleSimulate(nextStatus) {
    setSimulating(true);
    try {
      await updateOrderStatus(orderId, nextStatus);
      refetch();
    } catch (err) {
      console.error("Status simulation failed:", err);
    } finally {
      setSimulating(false);
    }
  }

  // ── Edit order submit ──
  async function handleEditSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateOrder(orderId, editForm);
      refetch();
      setEditOpen(false);
    } catch (err) {
      console.error("Edit failed:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageSkeleton />;
  if (!order) return null;

  const nextStatuses = VALID_TRANSITIONS[order.status] || [];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* ── A. Back button ── */}
      <button
        onClick={() => navigate("/deliveries")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Deliveries
      </button>

      {/* ── B. Order header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-mono">
            {order.order_id}
          </h1>
          <Badge
            variant={statusBadgeVariant[order.status] || "secondary"}
            className="mt-1"
          >
            {(order.status || "unknown").replace(/_/g, " ")}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Created</span>{" "}
          {order.created_at
            ? new Date(order.created_at).toLocaleString()
            : "—"}
        </div>
      </div>

      {/* ── C. Two info cards ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recipient card */}
        <Card className="rounded-xl border-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recipient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              <span className="font-medium">
                {order.recipient_name || "—"}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span>{" "}
              {order.recipient_phone || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Address:</span>{" "}
              {order.recipient_address || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Area:</span>{" "}
              {order.destination_area || "—"}
            </p>
          </CardContent>
        </Card>

        {/* Parcel card */}
        <Card className="rounded-xl border-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Parcel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p>
              <span className="text-muted-foreground">Type:</span>{" "}
              {order.parcel_type
                ? order.parcel_type.replace(/_/g, " ")
                : "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Weight:</span>{" "}
              {order.item_weight || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Amount:</span>{" "}
              <span className="font-semibold">
                {order.amount != null ? `৳${order.amount}` : "—"}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Payment:</span>{" "}
              {order.payment_method
                ? order.payment_method.toUpperCase()
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── D. Status Timeline ── */}
      <Card className="rounded-xl border-2 border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {order.status_history && order.status_history.length > 0 ? (
            <div className="relative pl-6 space-y-4">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-1 bottom-1 w-px bg-border" />

              {order.status_history.map((h, i) => {
                const meta = STATUS_META[h.status] || STATUS_META.pending;
                const Icon = meta.icon;
                return (
                  <div key={i} className="relative flex gap-3 items-start">
                    {/* Icon dot */}
                    <div
                      className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-border ${meta.color}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium capitalize">
                        {(h.status || "").replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {h.changed_at
                          ? new Date(h.changed_at).toLocaleString()
                          : ""}
                      </p>
                      {h.note && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">
                          {h.note.replace(/_/g, " ")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No status history available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── E. Demo — Simulate Status Change ── */}
      {nextStatuses.length > 0 && (
        <Card className="rounded-xl border-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Demo — Simulate Status Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Click a button to simulate the next status transition for this
              order.
            </p>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((ns) => {
                const meta = STATUS_META[ns] || STATUS_META.pending;
                const Icon = meta.icon;
                return (
                  <Button
                    key={ns}
                    variant="outline"
                    disabled={simulating}
                    onClick={() => handleSimulate(ns)}
                    className="gap-2 capitalize cursor-pointer"
                  >
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                    {ns.replace(/_/g, " ")}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── G. Edit Order (only for pending orders) ── */}
      {order.status === "pending" && (
        <Card className="rounded-xl border-2 border-border bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Edit Order</CardTitle>
            {!editOpen && (
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
                    item_weight: order.item_weight || "",
                  });
                  setEditOpen(true);
                }}
                className="gap-1.5 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </CardHeader>

          {editOpen && (
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name">Recipient Name</Label>
                    <Input
                      id="edit-name"
                      value={editForm.recipient_name}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          recipient_name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone">Recipient Phone</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.recipient_phone}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          recipient_phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-address">Recipient Address</Label>
                    <Input
                      id="edit-address"
                      value={editForm.recipient_address}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          recipient_address: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-area">Destination Area</Label>
                    <Input
                      id="edit-area"
                      value={editForm.destination_area}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          destination_area: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-weight">Item Weight</Label>
                    <Input
                      id="edit-weight"
                      value={editForm.item_weight}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          item_weight: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-desc">Item Description</Label>
                    <Input
                      id="edit-desc"
                      value={editForm.item_description}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          item_description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditOpen(false)}
                    className="gap-1.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={saving}
                    className="cursor-pointer"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
