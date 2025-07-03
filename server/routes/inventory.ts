import { RequestHandler } from "express";
import { TShirt, ApiResponse, PaginatedResponse } from "@shared/types";
import { inventoryService } from "../services/inventoryService";

// Get all products with filtering
export const getAllProducts: RequestHandler = async (req, res) => {
  try {
    // Auto-cleanup empty IDs on first request
    if (req.query.cleanup !== "false") {
      await inventoryService.cleanupEmptyIds();
    }

    const filters = {
      search: req.query.search as string,
      category: req.query.category as string,
      stockStatus: req.query.stockStatus as string,
    };

    const products = await inventoryService.getAllProducts(filters);

    const response: PaginatedResponse<TShirt> = {
      success: true,
      data: products,
      pagination: {
        page: 1,
        limit: products.length,
        total: products.length,
        totalPages: 1,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
};

// Get product by ID
export const getProductById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await inventoryService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    const response: ApiResponse<TShirt> = {
      success: true,
      data: product,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getProductById:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
};

// Create new product
export const createProduct: RequestHandler = async (req, res) => {
  try {
    const productData = req.body;

    // Basic validation
    if (
      !productData.name ||
      !productData.sellingPrice ||
      !productData.costPrice
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, sellingPrice, costPrice",
      });
    }

    const product = await inventoryService.createProduct(productData);

    const response: ApiResponse<TShirt> = {
      success: true,
      data: product,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create product",
    });
  }
};

// Update product
export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await inventoryService.updateProduct(id, updateData);

    const response: ApiResponse<TShirt> = {
      success: true,
      data: product,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update product",
    });
  }
};

// Delete product
export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await inventoryService.deleteProduct(id);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete product",
    });
  }
};

// Update stock level
export const updateStock: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockLevel, stock } = req.body;

    // Accept both stockLevel and stock for compatibility
    const newStock = stockLevel !== undefined ? stockLevel : stock;

    if (typeof newStock !== "number" || newStock < 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid stock value",
      });
    }

    const product = await inventoryService.updateStock(id, newStock);

    const response: ApiResponse<TShirt> = {
      success: true,
      data: product,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in updateStock:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update stock",
    });
  }
};

// Get low stock products
export const getLowStockProducts: RequestHandler = async (req, res) => {
  try {
    const products = await inventoryService.getLowStockProducts();

    const response: ApiResponse<TShirt[]> = {
      success: true,
      data: products,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getLowStockProducts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch low stock products",
    });
  }
};

// Bulk update minimum stock level for all products
export const bulkUpdateMinStock: RequestHandler = async (req, res) => {
  try {
    const { minStockLevel } = req.body;

    if (typeof minStockLevel !== "number" || minStockLevel < 1) {
      return res.status(400).json({
        success: false,
        error: "Invalid minimum stock level",
      });
    }

    const result = await inventoryService.bulkUpdateMinStock(minStockLevel);

    const response: ApiResponse<{ updatedCount: number }> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in bulkUpdateMinStock:", error);
    res.status(500).json({
      success: false,
      error: "Failed to bulk update minimum stock levels",
    });
  }
};

// Seed initial data (for development)
export const seedData: RequestHandler = async (req, res) => {
  try {
    await inventoryService.seedInitialData();

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in seedData:", error);
    res.status(500).json({
      success: false,
      error: "Failed to seed inventory data",
    });
  }
};
