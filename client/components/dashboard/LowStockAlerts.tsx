import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, Plus } from "lucide-react";
import { TShirt } from "@shared/types";

export function LowStockAlerts() {
  const [lowStockItems, setLowStockItems] = useState<TShirt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      const response = await fetch(
        "/api/inventory?stockStatus=low_stock&limit=10",
      );
      const data = await response.json();
      setLowStockItems(data.data);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRestock = async (
    productId: string,
    currentStock: number,
  ) => {
    try {
      const newStock = currentStock + 10; // Add 10 units as quick restock
      await fetch(`/api/inventory/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockLevel: newStock }),
      });

      // Update local state
      setLowStockItems(
        lowStockItems.map((item) =>
          item.id === productId ? { ...item, stockLevel: newStock } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const getStockStatus = (item: TShirt) => {
    if (item.stockLevel === 0) return "out_of_stock";
    if (item.stockLevel <= item.minStockLevel) return "low_stock";
    return "in_stock";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Stock Alerts
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
        ) : lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>All items are well stocked!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lowStockItems.slice(0, 8).map((item) => {
              const status = getStockStatus(item);
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    status === "out_of_stock"
                      ? "border-destructive/20 bg-destructive/5"
                      : "border-warning/20 bg-warning/5"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {item.size}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {item.color} • {item.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          status === "out_of_stock"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          status === "low_stock"
                            ? "bg-warning/20 text-warning"
                            : ""
                        }
                      >
                        {item.stockLevel === 0
                          ? "Out of Stock"
                          : `${item.stockLevel} left`}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Min: {item.minStockLevel}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleQuickRestock(item.id, item.stockLevel)
                      }
                      className="h-7 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      +10
                    </Button>
                    <span className="text-xs text-slate-500 text-center">
                      Quick
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
