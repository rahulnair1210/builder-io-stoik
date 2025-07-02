import express from "express";
import cors from "cors";
import path from "path";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  bulkUpdateMinStock,
  seedData as seedInventoryData,
} from "./routes/inventory";
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
  seedData as seedCustomerData,
} from "./routes/customers";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  seedData as seedOrderData,
} from "./routes/orders";
import {
  getDashboardAnalytics,
  getRecentOrders,
  getLowStockAlerts,
} from "./routes/analytics";
import {
  getSettings,
  updateSettings,
  updateCurrency,
  testWhatsAppNotification,
  getBusinessSettings,
  getNotificationSettings,
} from "./routes/settings";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Stoik T-Shirt Inventory Management API",
    version: "2.0.0",
    database: "Firebase Firestore",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Inventory/Products routes
app.get("/api/inventory", getAllProducts);
app.get("/api/inventory/:id", getProductById);
app.post("/api/inventory", createProduct);
app.put("/api/inventory/:id", updateProduct);
app.delete("/api/inventory/:id", deleteProduct);
app.patch("/api/inventory/:id/stock", updateStock);
app.get("/api/inventory/alerts/low-stock", getLowStockProducts);
app.patch("/api/inventory/bulk-update-min-stock", bulkUpdateMinStock);
app.post("/api/inventory/seed", seedInventoryData);

// Customer routes
app.get("/api/customers", getAllCustomers);
app.get("/api/customers/:id", getCustomerById);
app.post("/api/customers", createCustomer);
app.put("/api/customers/:id", updateCustomer);
app.delete("/api/customers/:id", deleteCustomer);
app.get("/api/customers/:id/orders", getCustomerOrders);
app.post("/api/customers/seed", seedCustomerData);

// Order routes
app.get("/api/orders", getAllOrders);
app.get("/api/orders/:id", getOrderById);
app.post("/api/orders", createOrder);
app.put("/api/orders/:id", updateOrder);
app.patch("/api/orders/:id/status", updateOrderStatus);
app.patch("/api/orders/:id/payment", updatePaymentStatus);
app.delete("/api/orders/:id", deleteOrder);
app.post("/api/orders/seed", seedOrderData);

// Analytics routes
app.get("/api/analytics/dashboard", getDashboardAnalytics);
app.get("/api/analytics/recent-orders", getRecentOrders);
app.get("/api/analytics/low-stock", getLowStockAlerts);

// Settings routes
app.get("/api/settings", getSettings);
app.post("/api/settings", updateSettings);
app.patch("/api/settings/currency", updateCurrency);
app.get("/api/settings/business", getBusinessSettings);
app.get("/api/settings/notifications", getNotificationSettings);

// Notification routes
app.post("/api/notifications/test-whatsapp", testWhatsAppNotification);

// Seed all data endpoint (for development)
app.post("/api/seed-all", async (req, res) => {
  try {
    // Import services to trigger seeding
    const { inventoryService } = await import("./services/inventoryService");
    const { customerService } = await import("./services/customerService");
    const { orderService } = await import("./services/orderService");

    await inventoryService.seedInitialData();
    await customerService.seedInitialData();
    await orderService.seedInitialData();

    res.json({
      success: true,
      message: "All data seeded successfully",
    });
  } catch (error) {
    console.error("Error seeding all data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to seed data",
    });
  }
});

// Serve static files for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist/spa"));
}

// Only handle client-side routing in production
if (process.env.NODE_ENV === "production") {
  // Handle client-side routing - serve index.html for non-API routes
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) {
      return next();
    }

    // Serve index.html for client-side routing
    res.sendFile(path.join(__dirname, "../spa/index.html"));
  });
}

// 404 handler for API routes only
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.method} ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Using Firebase Firestore as database`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}`);
  console.log(`💾 Health check: http://localhost:${PORT}/health`);
});

export default app;

// Export createServer function for vite config
export function createServer() {
  return app;
}
