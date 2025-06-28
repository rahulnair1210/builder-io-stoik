import { RequestHandler } from "express";
import { ApiResponse } from "@shared/types";
import { analyticsService } from "../services/analyticsService";

// Get dashboard analytics
export const getDashboardAnalytics: RequestHandler = async (req, res) => {
  try {
    const stats = await analyticsService.getDashboardStats();

    const response: ApiResponse<any> = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getDashboardAnalytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard analytics",
    });
  }
};

// Get recent orders
export const getRecentOrders: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const orders = await analyticsService.getRecentOrders(limit);

    const response: ApiResponse<any[]> = {
      success: true,
      data: orders,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getRecentOrders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent orders",
    });
  }
};

// Get low stock alerts
export const getLowStockAlerts: RequestHandler = async (req, res) => {
  try {
    const products = await analyticsService.getLowStockAlerts();

    const response: ApiResponse<any[]> = {
      success: true,
      data: products,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getLowStockAlerts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch low stock alerts",
    });
  }
};
