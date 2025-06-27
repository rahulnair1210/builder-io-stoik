import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { Order } from "@shared/types";

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch(
        "/api/orders?limit=5&sort=createdAt&dir=desc",
      );
      const data = await response.json();
      setOrders(data.data);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No recent orders
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-900">
                      Order #{order.id.slice(-6)}
                    </p>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-slate-600">
                    {order.customer?.name || "Unknown Customer"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">
                    ${order.totalSelling.toLocaleString()}
                  </p>
                  <p className="text-sm text-accent">
                    +${order.profit.toFixed(2)} profit
                  </p>
                  <Button variant="ghost" size="sm" className="mt-1 h-6 px-2">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
