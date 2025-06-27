import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Package,
  DollarSign,
  ShoppingBag,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import { Customer, Order } from "@shared/types";

interface CustomerHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
}

export function CustomerHistory({
  open,
  onOpenChange,
  customer,
}: CustomerHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && customer.id) {
      fetchCustomerOrders();
    }
  }, [open, customer.id]);

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/${customer.id}/orders`);
      const data = await response.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      // Mock data for development
      setOrders([
        {
          id: "ORD001",
          customerId: customer.id,
          customer,
          items: [
            {
              id: "1",
              tshirtId: "1",
              quantity: 2,
              unitCost: 8.5,
              unitSelling: 19.99,
              totalCost: 17.0,
              totalSelling: 39.98,
              profit: 22.98,
            },
          ],
          status: "delivered",
          totalCost: 17.0,
          totalSelling: 39.98,
          profit: 22.98,
          orderDate: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          deliveryDate: new Date(
            Date.now() - 28 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          shippingAddress: customer.address,
          paymentMethod: "card",
          paymentStatus: "paid",
          createdAt: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 28 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: "ORD002",
          customerId: customer.id,
          customer,
          items: [
            {
              id: "2",
              tshirtId: "2",
              quantity: 1,
              unitCost: 12.0,
              unitSelling: 24.99,
              totalCost: 12.0,
              totalSelling: 24.99,
              profit: 12.99,
            },
          ],
          status: "processing",
          totalCost: 12.0,
          totalSelling: 24.99,
          profit: 12.99,
          orderDate: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          shippingAddress: customer.address,
          paymentMethod: "paypal",
          paymentStatus: "paid",
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getOrderStats = () => {
    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalSelling, 0),
      averageOrder:
        orders.length > 0
          ? orders.reduce((sum, order) => sum + order.totalSelling, 0) /
            orders.length
          : 0,
      lastOrder:
        orders.length > 0
          ? Math.max(
              ...orders.map((order) => new Date(order.orderDate).getTime()),
            )
          : null,
    };
  };

  const stats = getOrderStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Customer History - {customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{customer.name}</h3>
                  <p className="text-slate-600">{customer.email}</p>
                  <p className="text-slate-600">{customer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Member since</p>
                  <p className="font-medium">
                    {formatDate(customer.createdAt)}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-slate-600">Total Orders</p>
                  <p className="text-xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-sm text-slate-600">Total Spent</p>
                  <p className="text-xl font-bold text-accent">
                    ${stats.totalSpent.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-slate-600">Avg Order</p>
                  <p className="text-xl font-bold">
                    ${stats.averageOrder.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-600">Last Order</p>
                  <p className="text-xl font-bold">
                    {stats.lastOrder
                      ? formatDate(new Date(stats.lastOrder).toISOString())
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order History */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order History</h3>
            {loading ? (
              <div className="text-center py-8">Loading order history...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No orders found for this customer</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-medium">#{order.id}</span>
                      </TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>
                        <span className="text-slate-600">
                          {order.items.length} items
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ${order.totalSelling.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.paymentStatus === "paid"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            order.paymentStatus === "paid"
                              ? "bg-accent/20 text-accent"
                              : ""
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
