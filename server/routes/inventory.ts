import { RequestHandler } from "express";
import { TShirt, ApiResponse, PaginatedResponse } from "@shared/types";

// Mock data for development
export const mockProducts: TShirt[] = [
  {
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
  {
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
  {
    id: "3",
    name: "Premium Cotton Blend",
    design: "Minimalist",
    size: "S",
    color: "White",
    stockLevel: 0,
    minStockLevel: 8,
    costPrice: 15.0,
    sellingPrice: 34.99,
    category: "Premium",
    tags: ["premium", "soft", "blend"],
    photos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Vintage Band Tee",
    design: "Rock Concert",
    size: "XL",
    color: "Gray",
    stockLevel: 8,
    minStockLevel: 5,
    costPrice: 10.0,
    sellingPrice: 28.99,
    category: "Vintage",
    tags: ["vintage", "band", "retro"],
    photos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getAllProducts: RequestHandler = (req, res) => {
  try {
    const {
      search,
      category,
      size,
      stockStatus,
      sortField = "name",
      sortDir = "asc",
      page = "1",
      limit = "50",
    } = req.query;

    let filteredProducts = [...mockProducts];

    // Apply filters
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.design.toLowerCase().includes(searchTerm) ||
          product.color.toLowerCase().includes(searchTerm) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category,
      );
    }

    if (size) {
      filteredProducts = filteredProducts.filter(
        (product) => product.size === size,
      );
    }

    if (stockStatus) {
      filteredProducts = filteredProducts.filter((product) => {
        switch (stockStatus) {
          case "in_stock":
            return product.stockLevel > product.minStockLevel;
          case "low_stock":
            return (
              product.stockLevel <= product.minStockLevel &&
              product.stockLevel > 0
            );
          case "out_of_stock":
            return product.stockLevel === 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      const field = sortField as keyof TShirt;
      const aValue = a[field];
      const bValue = b[field];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDir === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDir === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const response: PaginatedResponse<TShirt[]> = {
      data: paginatedProducts,
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limitNum),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      data: [],
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getProductById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const product = mockProducts.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Product not found",
      });
    }

    const response: ApiResponse<TShirt> = {
      data: product,
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const createProduct: RequestHandler = (req, res) => {
  try {
    const productData = req.body;
    const newProduct: TShirt = {
      ...productData,
      id: Date.now().toString(),
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProducts.push(newProduct);

    const response: ApiResponse<TShirt> = {
      data: newProduct,
      success: true,
      message: "Product created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to create product",
    });
  }
};

export const updateProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const productIndex = mockProducts.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Product not found",
      });
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<TShirt> = {
      data: mockProducts[productIndex],
      success: true,
      message: "Product updated successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to update product",
    });
  }
};

export const deleteProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = mockProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Product not found",
      });
    }

    mockProducts.splice(productIndex, 1);

    const response: ApiResponse<void> = {
      data: undefined,
      success: true,
      message: "Product deleted successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to delete product",
    });
  }
};

export const updateStock: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { stockLevel } = req.body;

    const productIndex = mockProducts.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Product not found",
      });
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      stockLevel: parseInt(stockLevel),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<TShirt> = {
      data: mockProducts[productIndex],
      success: true,
      message: "Stock updated successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to update stock",
    });
  }
};
