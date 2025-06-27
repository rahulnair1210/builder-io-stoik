import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";
import { Order } from "@shared/types";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      pending: {
        variant: "secondary" as const,
        className: "bg-warning/20 text-warning",
        icon: Clock,
      },
      processing: {
        variant: "default" as const,
        className: "bg-primary/20 text-primary",
        icon: Package,
      },
      shipped: {
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-700",
        icon: Truck,
      },
      delivered: {
        variant: "secondary" as const,
        className: "bg-accent/20 text-accent",
        icon: CheckCircle,
      },
      cancelled: {
        variant: "destructive" as const,
        className: "bg-destructive/20 text-destructive",
        icon: XCircle,
      },
    };

    const { variant, className, icon: Icon } = variants[status];

    return (
      <Badge
        variant={variant}
        className={`${className} flex items-center gap-1`}
      >
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details - #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Summary</span>
                {getStatusBadge(order.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="text-xl font-bold">
                    ${order.totalSelling.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Package className="h-5 w-5 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm text-slate-600">Items</p>
                  <p className="text-xl font-bold">{order.items.length}</p>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-slate-600">Profit</p>
                  <p className="text-xl font-bold text-accent">
                    ${order.profit.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm text-slate-600">Order Date</p>
                  <p className="text-sm font-medium">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Contact Details</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> {order.customer?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.customer?.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.customer?.phone}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </h4>
                  <div className="text-sm text-slate-600">
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {item.tshirt?.name || `Product #${item.tshirtId}`}
                          </p>
                          {item.tshirt && (
                            <p className="text-sm text-slate-600">
                              {item.tshirt.size} • {item.tshirt.color}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.unitSelling.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">
                        ${item.totalSelling.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-accent font-medium">
                        ${item.profit.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium capitalize">
                      {order.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "secondary" : "outline"
                      }
                      className={
                        order.paymentStatus === "paid"
                          ? "bg-accent/20 text-accent"
                          : ""
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.shippingDate && (
                    <div className="flex justify-between">
                      <span>Shipped:</span>
                      <span className="font-medium">
                        {formatDate(order.shippingDate)}
                      </span>
                    </div>
                  )}
                  {order.deliveryDate && (
                    <div className="flex justify-between">
                      <span>Delivered:</span>
                      <span className="font-medium">
                        {formatDate(order.deliveryDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span className="font-medium">
                      {formatDate(order.orderDate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
