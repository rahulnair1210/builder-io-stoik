import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from "./routes/inventory";
import { getDashboardStats } from "./routes/analytics";
import { getAllOrders, getOrderById, updateOrderStatus } from "./routes/orders";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Inventory routes
  app.get("/api/inventory", getAllProducts);
  app.get("/api/inventory/:id", getProductById);
  app.post("/api/inventory", createProduct);
  app.put("/api/inventory/:id", updateProduct);
  app.delete("/api/inventory/:id", deleteProduct);
  app.patch("/api/inventory/:id/stock", updateStock);

  // Analytics routes
  app.get("/api/analytics/dashboard", getDashboardStats);

  // Orders routes
  app.get("/api/orders", getAllOrders);
  app.get("/api/orders/:id", getOrderById);
  app.patch("/api/orders/:id/status", updateOrderStatus);

  // Export placeholder routes
  app.post("/api/export/:type", (_req, res) => {
    res.json({ message: "Export functionality coming soon" });
  });

  return app;
}
