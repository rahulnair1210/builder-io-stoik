import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, MoreHorizontal } from "lucide-react";
import { Order } from "@shared/types";
import { useCurrency } from "@/context/CurrencyContext";

export function RecentRetailOrders() {
  const { formatCurrency } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRetailOrders();
  }, []);

  const fetchRetailOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (data.success) {
        // Filter for retail orders (total quantity < 20)
        const retailOrders = data.data.filter((order: Order) => {
          const totalQuantity = order.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          return totalQuantity < 20;
        });

        // Sort by date and take latest 5
        const sortedOrders = retailOrders
          .sort(
            (a: Order, b: Order) =>
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
          )
          .slice(0, 5);

        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error("Error fetching retail orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
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
          Recent Retail Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No retail orders yet</p>
            <p className="text-sm">
              Retail orders have less than 20 items total
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const totalQuantity = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900">
                        Order #{order.id.slice(-6)}
                      </p>
                      <Badge
                        className={getStatusColor(order.status)}
                        variant="secondary"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {order.customer?.name || "Unknown Customer"}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-slate-500">
                        {totalQuantity} items
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(order.orderDate)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">
                      {formatCurrency(order.totalSelling)}
                    </p>
                    <p className="text-sm text-accent">
                      +{formatCurrency(order.profit)}
                    </p>
                  </div>
                </div>
              );
            })}

            {orders.length > 0 && (
              <div className="pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => (window.location.href = "/orders")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
