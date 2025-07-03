import { db, COLLECTIONS } from "../config/firebase";
import { orderService } from "./orderService";
import { inventoryService } from "./inventoryService";
import { customerService } from "./customerService";

export class AnalyticsService {
  async getDashboardStats() {
    try {
      const [orders, products, customers] = await Promise.all([
        orderService.getAllOrders(),
        inventoryService.getAllProducts(),
        customerService.getAllCustomers(),
      ]);

      // Calculate order statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, order) => sum + order.totalSelling,
        0,
      );
      const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0);

      const pendingOrders = orders.filter(
        (order) => order.status === "pending",
      ).length;
      const completedOrders = orders.filter(
        (order) => order.status === "delivered",
      ).length;

      // Calculate inventory statistics
      const totalItems = products.length;
      const lowStockItems = products.filter(
        (product) => product.stockLevel <= (product.minStockLevel || 10),
      ).length;
      const outOfStockItems = products.filter(
        (product) => product.stockLevel === 0,
      ).length;
      const totalInventoryValue = products.reduce(
        (sum, product) => sum + product.stockLevel * product.sellingPrice,
        0,
      );

      // Calculate customer statistics
      const totalCustomers = customers.length;
      const vipCustomers = customers.filter(
        (customer) => customer.totalSpent > 1000,
      ).length;

      // Calculate monthly profit trend (last 6 months)
      const monthlyProfitTrend = this.calculateMonthlyTrend(orders);

      // Calculate top selling items
      const topSellingItems = this.calculateTopSellingItems(orders);

      return {
        orders: {
          totalOrders,
          totalRevenue,
          totalProfit,
          pendingOrders,
          completedOrders,
        },
        inventory: {
          totalItems,
          lowStockItems,
          outOfStockItems,
          totalInventoryValue,
        },
        customers: {
          totalCustomers,
          vipCustomers,
        },
        monthlyProfitTrend,
        topSellingItems,
      };
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      throw error;
    }
  }

  private calculateMonthlyTrend(
    orders: any[],
  ): Array<{ month: string; profit: number; revenue: number }> {
    const monthlyData: { [key: string]: { profit: number; revenue: number } } =
      {};

    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      monthlyData[monthKey] = { profit: 0, revenue: 0 };
    }

    // Aggregate order data by month
    orders.forEach((order) => {
      const orderDate = new Date(order.orderDate);
      const monthKey = orderDate.toISOString().slice(0, 7);

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].profit += order.profit;
        monthlyData[monthKey].revenue += order.totalSelling;
      }
    });

    // Convert to array format
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      profit: data.profit,
      revenue: data.revenue,
    }));
  }

  private calculateTopSellingItems(
    orders: any[],
  ): Array<{ tshirt: any; quantitySold: number; revenue: number }> {
    const itemStats: {
      [key: string]: { tshirt: any; quantitySold: number; revenue: number };
    } = {};

    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        // Use tshirtId as the key for grouping
        const itemKey = item.tshirtId || item.id;
        if (!itemStats[itemKey]) {
          itemStats[itemKey] = {
            tshirt: item.tshirt || {
              id: item.tshirtId,
              name: item.name || "Unknown Product",
              size: item.size || "N/A",
              color: item.color || "N/A",
              category: item.category || "N/A",
            },
            quantitySold: 0,
            revenue: 0,
          };
        }
        itemStats[itemKey].quantitySold += item.quantity;
        itemStats[itemKey].revenue += item.totalSelling;
      });
    });

    // Convert to array and sort by quantity sold
    return Object.values(itemStats)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5); // Top 5 items
  }

  async getRecentOrders(limit: number = 5) {
    try {
      const orders = await orderService.getAllOrders();
      return orders
        .sort(
          (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
        )
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting recent orders:", error);
      throw error;
    }
  }

  async getLowStockAlerts() {
    try {
      return await inventoryService.getLowStockProducts();
    } catch (error) {
      console.error("Error getting low stock alerts:", error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
