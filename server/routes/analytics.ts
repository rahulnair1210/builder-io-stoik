import { RequestHandler } from "express";
import { DashboardStats, ApiResponse } from "@shared/types";

// Mock data for analytics
const mockDashboardStats: DashboardStats = {
  inventory: {
    totalItems: 4,
    totalValue: 12850.45,
    lowStockItems: 1,
    outOfStockItems: 1,
    totalProfit: 3245.67,
    profitMargin: 25.2,
  },
  orders: {
    totalOrders: 42,
    pendingOrders: 3,
    completedOrders: 37,
    totalRevenue: 15689.32,
    totalProfit: 4567.89,
    averageOrderValue: 373.56,
  },
  customers: {
    totalCustomers: 28,
    newCustomersThisMonth: 5,
    topCustomers: [
      {
        customer: {
          id: "1",
          name: "John Smith",
          email: "john@example.com",
          phone: "+1-555-0123",
          address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
          },
          totalOrders: 8,
          totalSpent: 1245.67,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          preferredContactMethod: "email",
        },
        totalSpent: 1245.67,
        orderCount: 8,
      },
    ],
  },
  monthlyProfitTrend: [
    { month: "2024-01", profit: 1200, revenue: 4800 },
    { month: "2024-02", profit: 1450, revenue: 5200 },
    { month: "2024-03", profit: 1680, revenue: 5800 },
    { month: "2024-04", profit: 1590, revenue: 5600 },
    { month: "2024-05", profit: 1820, revenue: 6200 },
    { month: "2024-06", profit: 2100, revenue: 7000 },
  ],
  topSellingItems: [
    {
      tshirt: {
        id: "1",
        name: "Classic Cotton Tee",
        design: "Vintage Logo",
        size: "M",
        color: "Black",
        stockLevel: 15,
        minStockLevel: 10,
        costPrice: 8.5,
        sellingPrice: 19.99,
        category: "Casual",
        tags: ["cotton", "classic", "logo"],
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      quantitySold: 25,
      revenue: 499.75,
    },
    {
      tshirt: {
        id: "2",
        name: "Sport Performance Tee",
        design: "Athletic Stripe",
        size: "L",
        color: "Navy",
        stockLevel: 3,
        minStockLevel: 5,
        costPrice: 12.0,
        sellingPrice: 24.99,
        category: "Sports",
        tags: ["athletic", "performance", "moisture-wicking"],
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      quantitySold: 18,
      revenue: 449.82,
    },
  ],
};

export const getDashboardStats: RequestHandler = (req, res) => {
  try {
    const response: ApiResponse<DashboardStats> = {
      data: mockDashboardStats,
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};
