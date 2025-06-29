import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Package } from "lucide-react";
import { Order } from "@shared/types";

interface EditOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSave: (orderId: string, updates: Partial<Order>) => void;
}

export function EditOrderDialog({
  open,
  onOpenChange,
  order,
  onSave,
}: EditOrderDialogProps) {
  const [formData, setFormData] = useState({
    status: order?.status || "pending",
    paymentStatus: order?.paymentStatus || "pending",
    paymentMethod: order?.paymentMethod || "card",
    notes: order?.notes || "",
  });

  const [saving, setSaving] = useState(false);

  // Update form data when order changes
  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        notes: order.notes || "",
      });
    }
  }, [order]);

  const handleInputChange = useCallback((field: string) => {
    return (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSaving(true);
    try {
      await onSave(order.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving order:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/20 text-warning";
      case "processing":
        return "bg-primary/20 text-primary";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "delivered":
        return "bg-accent/20 text-accent";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Edit Order #{order.id}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">{order.customer?.name}</h3>
                  <p className="text-sm text-slate-600">
                    {order.customer?.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${order.totalSelling.toFixed(2)}
                  </p>
                  <p className="text-sm text-accent">
                    +${order.profit.toFixed(2)} profit
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{order.items.length} items</Badge>
                <Badge className={getStatusColor(formData.status)}>
                  {formData.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleInputChange("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={handleInputChange("paymentStatus")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={handleInputChange("paymentMethod")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any notes about this order..."
                rows={3}
              />
            </div>
          </div>

          {/* Status Change Notifications */}
          {formData.status !== order.status && (
            <Card>
              <CardContent className="p-4 bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Status Change:</strong> {order.status} →{" "}
                  {formData.status}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {formData.status === "shipped" &&
                    "Customer will be notified that their order has been shipped."}
                  {formData.status === "delivered" &&
                    "Order will be marked as completed."}
                  {formData.status === "cancelled" &&
                    "Order will be cancelled and inventory restored."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
