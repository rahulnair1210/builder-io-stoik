import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  Download,
  Loader2,
} from "lucide-react";
import { DashboardStats, NotificationPreferences } from "@shared/types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProfitChart } from "@/components/dashboard/ProfitChart";
import { TopSellingItems } from "@/components/dashboard/TopSellingItems";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { RecentRetailOrders } from "@/components/dashboard/RecentRetailOrders";
import { LowStockAlerts } from "@/components/dashboard/LowStockAlerts";
import { Navigation } from "@/components/layout/Navigation";
import { useCurrency } from "@/context/CurrencyContext";

export default function Dashboard() {
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    lowStock: true,
    outOfStock: true,
    newOrders: true,
    orderStatusUpdates: true,
    paymentUpdates: false,
  });

  useEffect(() => {
    fetchDashboardStats();

    // Auto-refresh dashboard data every 30 seconds to keep profit trends dynamic
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/dashboard");
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportAllData = async () => {
    try {
      setExporting(true);

      // Fetch all data
      const [ordersRes, inventoryRes, customersRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/inventory"),
        fetch("/api/customers"),
      ]);

      const [ordersData, inventoryData, customersData] = await Promise.all([
        ordersRes.json(),
        inventoryRes.json(),
        customersRes.json(),
      ]);

      // Prepare data for CSV export
      const exportData = {
        orders: ordersData.data || [],
        inventory: inventoryData.data || [],
        customers: customersData.data || [],
      };

      // Create comprehensive CSV content
      let csvContent = "STOIK INVENTORY SYSTEM - COMPLETE DATA EXPORT\n";
      csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

      // Orders section
      csvContent += "=== ORDERS ===\n";
      csvContent +=
        "Order ID,Customer Name,Customer Email,Customer Phone,Items Count,Total Quantity,Total Cost,Total Selling,Profit,Status,Order Date,Payment Date,Delivery Address\n";

      exportData.orders.forEach((order: any) => {
        const totalQuantity = order.items.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        );
        const customerName = order.customer?.name || "Unknown";
        const customerEmail = order.customer?.email || "";
        const customerPhone = order.customer?.phone || "";
        const deliveryAddress = order.customer?.address
          ? `"${order.customer.address.street} ${order.customer.address.city} ${order.customer.address.state} ${order.customer.address.zipCode}"`
          : "";

        csvContent += `${order.id},"${customerName}","${customerEmail}","${customerPhone}",${order.items.length},${totalQuantity},${order.totalCost},${order.totalSelling},${order.profit},${order.status},${order.orderDate},${order.paymentDate || "Pending"},"${deliveryAddress}"\n`;
      });

      // Order items details
      csvContent += "\n=== ORDER ITEMS DETAILS ===\n";
      csvContent +=
        "Order ID,Product Name,Size,Color,Quantity,Unit Cost,Unit Price,Item Total\n";

      exportData.orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          csvContent += `${order.id},"${item.name}",${item.size},${item.color},${item.quantity},${item.cost},${item.price},${item.quantity * item.price}\n`;
        });
      });

      // Inventory section
      csvContent += "\n=== INVENTORY ===\n";
      csvContent +=
        "Product ID,Name,Description,Category,Size,Color,Stock Quantity,Cost Price,Selling Price,Profit Margin,Status,Last Updated\n";

      exportData.inventory.forEach((product: any) => {
        const profitMargin =
          product.sellingPrice > 0
            ? (
                ((product.sellingPrice - product.costPrice) /
                  product.costPrice) *
                100
              ).toFixed(2)
            : "0";
        const status =
          product.stock <= 0
            ? "Out of Stock"
            : product.stock <= 10
              ? "Low Stock"
              : "In Stock";

        csvContent += `${product.id},"${product.name}","${product.description || ""}","${product.category}",${product.size},${product.color},${product.stock},${product.costPrice},${product.sellingPrice},${profitMargin}%,${status},${product.updatedAt || ""}\n`;
      });

      // Customers section
      csvContent += "\n=== CUSTOMERS ===\n";
      csvContent +=
        "Customer ID,Name,Email,Phone,Address,Total Orders,Total Spent,Registration Date,Last Order Date,Customer Type\n";

      exportData.customers.forEach((customer: any) => {
        const customerOrders = exportData.orders.filter(
          (order: any) => order.customerId === customer.id,
        );
        const totalOrders = customerOrders.length;
        const totalSpent = customerOrders.reduce(
          (sum: number, order: any) => sum + order.totalSelling,
          0,
        );
        const lastOrderDate =
          customerOrders.length > 0
            ? Math.max(
                ...customerOrders.map((o: any) =>
                  new Date(o.orderDate).getTime(),
                ),
              )
            : null;
        const customerType =
          totalSpent > 1000 ? "VIP" : totalOrders > 5 ? "Regular" : "New";
        const fullAddress = customer.address
          ? `"${customer.address.street} ${customer.address.city} ${customer.address.state} ${customer.address.zipCode}"`
          : "";

        csvContent += `${customer.id},"${customer.name}","${customer.email}","${customer.phone}","${fullAddress}",${totalOrders},${totalSpent.toFixed(2)},${customer.createdAt || ""},${lastOrderDate ? new Date(lastOrderDate).toLocaleDateString() : "Never"},${customerType}\n`;
      });

      // Business summary
      csvContent += "\n=== BUSINESS SUMMARY ===\n";
      const totalRevenue = exportData.orders.reduce(
        (sum: number, order: any) => sum + order.totalSelling,
        0,
      );
      const totalProfit = exportData.orders.reduce(
        (sum: number, order: any) => sum + order.profit,
        0,
      );
      const totalProducts = exportData.inventory.length;
      const totalCustomers = exportData.customers.length;
      const lowStockItems = exportData.inventory.filter(
        (p: any) => p.stock <= 10,
      ).length;
      const profitMargin =
        totalRevenue > 0
          ? ((totalProfit / totalRevenue) * 100).toFixed(2)
          : "0";

      csvContent += `Total Revenue,$${totalRevenue.toFixed(2)}\n`;
      csvContent += `Total Profit,$${totalProfit.toFixed(2)}\n`;
      csvContent += `Profit Margin,${profitMargin}%\n`;
      csvContent += `Total Orders,${exportData.orders.length}\n`;
      csvContent += `Total Products,${totalProducts}\n`;
      csvContent += `Total Customers,${totalCustomers}\n`;
      csvContent += `Low Stock Items,${lowStockItems}\n`;
      csvContent += `Out of Stock Items,${exportData.inventory.filter((p: any) => p.stock <= 0).length}\n`;
      csvContent += `Export Date,${new Date().toISOString()}\n`;

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `stoik-complete-data-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification
      window.dispatchEvent(
        new CustomEvent("addNotification", {
          detail: {
            type: "export_success",
            message: "Complete data exported successfully to CSV file",
          },
        }),
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const exportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/export/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: "excel",
          dateRange: {
            start: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            end: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="p-6 text-center">
          <p className="text-slate-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">
              Welcome back! Here's your business overview.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardStats}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              Refresh Data
            </Button>
            <Button
              onClick={exportAllData}
              disabled={exporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? "Exporting..." : "Export All Data"}
            </Button>
            <Button variant="outline" onClick={() => exportReport("profit")}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.orders.totalRevenue)}
            icon={DollarSign}
            trend={12.5}
            className="border-l-4 border-l-primary"
          />
          <StatsCard
            title="Total Profit"
            value={formatCurrency(stats.orders.totalProfit)}
            icon={TrendingUp}
            trend={8.2}
            className="border-l-4 border-l-accent"
          />
          <StatsCard
            title="Total Orders"
            value={stats.orders.totalOrders.toString()}
            icon={ShoppingCart}
            trend={-2.1}
            className="border-l-4 border-l-warning"
          />
          <StatsCard
            title="Inventory Items"
            value={stats.inventory.totalItems.toString()}
            icon={Package}
            trend={5.3}
            className="border-l-4 border-l-destructive"
          />
        </div>

        {/* Alerts */}
        {(stats.inventory.lowStockItems > 0 ||
          stats.inventory.outOfStockItems > 0) && (
          <Card className="border-l-4 border-l-warning bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {stats.inventory.lowStockItems > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-warning/20 text-warning"
                  >
                    {stats.inventory.lowStockItems} Low Stock
                  </Badge>
                )}
                {stats.inventory.outOfStockItems > 0 && (
                  <Badge variant="destructive">
                    {stats.inventory.outOfStockItems} Out of Stock
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Profit Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfitChart data={stats.monthlyProfitTrend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Selling Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopSellingItems items={stats.topSellingItems} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Retail Orders */}
        <RecentRetailOrders />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders />
          <LowStockAlerts />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Package className="h-6 w-6 mb-2" />
                Add Product
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <ShoppingCart className="h-6 w-6 mb-2" />
                New Order
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Add Customer
              </Button>
              <Button
                onClick={exportAllData}
                disabled={exporting}
                variant="outline"
                className="h-20 flex-col"
              >
                {exporting ? (
                  <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                ) : (
                  <Download className="h-6 w-6 mb-2" />
                )}
                {exporting ? "Exporting..." : "Export Data"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
