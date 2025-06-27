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
} from "lucide-react";
import { DashboardStats, NotificationPreferences } from "@shared/types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProfitChart } from "@/components/dashboard/ProfitChart";
import { TopSellingItems } from "@/components/dashboard/TopSellingItems";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { LowStockAlerts } from "@/components/dashboard/LowStockAlerts";
import { Navigation } from "@/components/layout/Navigation";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    lowStock: true,
    outOfStock: true,
    newOrders: true,
    orderStatusUpdates: true,
    paymentUpdates: false,
  });

  useEffect(() => {
    fetchDashboardStats();
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
            <Button variant="outline" onClick={() => exportReport("profit")}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={`$${stats.orders.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={12.5}
            className="border-l-4 border-l-primary"
          />
          <StatsCard
            title="Total Profit"
            value={`$${stats.orders.totalProfit.toLocaleString()}`}
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
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
