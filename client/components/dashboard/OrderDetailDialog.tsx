import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Truck,
  BarChart3,
  Edit,
  Trash2,
} from "lucide-react";
import { Order } from "@shared/types";
import { useCurrency } from "@/context/CurrencyContext";

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (id: string) => void;
}

export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: OrderDetailDialogProps) {
  const { formatCurrency } = useCurrency();

  if (!order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      pending: "secondary",
      processing: "default",
      shipped: "outline",
      delivered: "secondary",
      cancelled: "destructive",
    } as const;

    const colors = {
      pending: "bg-warning/20 text-warning",
      processing: "bg-primary/20 text-primary",
      shipped: "bg-blue-100 text-blue-700",
      delivered: "bg-accent/20 text-accent",
      cancelled: "bg-destructive/20 text-destructive",
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: Order["paymentStatus"]) => {
    const colors = {
      pending: "bg-warning/20 text-warning",
      paid: "bg-accent/20 text-accent",
      refunded: "bg-destructive/20 text-destructive",
    };

    return (
      <Badge variant="secondary" className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTotalQuantity = () => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Details - #{order.id.slice(-6)}
            </DialogTitle>
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(order)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to delete order #${order.id.slice(-6)}? This action cannot be undone.`,
                      )
                    ) {
                      onDelete(order.id);
                      onOpenChange(false);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Order Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      Order Status:
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      Payment Status:
                    </span>
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      Payment Method:
                    </span>
                    <Badge variant="outline">
                      {order.paymentMethod.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Order Date:</span>
                    <span className="text-sm text-slate-600">
                      {formatDate(order.orderDate)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-500 mb-1">
                      Total Amount
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(order.totalSelling)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-sm text-slate-500">Profit</div>
                      <div className="text-lg font-bold text-accent">
                        {formatCurrency(order.profit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Items</div>
                      <div className="text-lg font-bold text-slate-600">
                        {getTotalQuantity()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          {order.customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {order.customer.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{order.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{order.customer.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">
                        Shipping Address:
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 pl-6">
                      {order.shippingAddress.street}
                      <br />
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipCode}
                      <br />
                      {order.shippingAddress.country}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">
                          {item.name || `Item ${index + 1}`}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          Size: {item.size}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        Quantity: {item.quantity} ×{" "}
                        {formatCurrency(item.unitSelling)} each
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-900">
                        {formatCurrency(item.totalSelling)}
                      </div>
                      <div className="text-sm text-accent">
                        +{formatCurrency(item.profit)} profit
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profit:</span>
                    <span className="text-accent">
                      {formatCurrency(order.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(order.totalSelling)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <div className="font-medium">Order Placed</div>
                    <div className="text-sm text-slate-600">
                      {formatDate(order.orderDate)}
                    </div>
                  </div>
                </div>

                {order.paymentDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <div>
                      <div className="font-medium">Payment Received</div>
                      <div className="text-sm text-slate-600">
                        {formatDate(order.paymentDate)}
                      </div>
                    </div>
                  </div>
                )}

                {order.shippingDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Order Shipped</div>
                      <div className="text-sm text-slate-600">
                        {formatDate(order.shippingDate)}
                      </div>
                    </div>
                  </div>
                )}

                {order.deliveryDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Order Delivered</div>
                      <div className="text-sm text-slate-600">
                        {formatDate(order.deliveryDate)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
