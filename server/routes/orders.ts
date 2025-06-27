import { RequestHandler } from "express";
import { Order, ApiResponse, PaginatedResponse } from "@shared/types";

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: "ORD001",
    customerId: "1",
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
    items: [
      {
        id: "1",
        tshirtId: "1",
        quantity: 2,
        unitCost: 8.5,
        unitSelling: 19.99,
        totalCost: 17.0,
        totalSelling: 39.98,
        profit: 22.98,
      },
    ],
    status: "delivered",
    totalCost: 17.0,
    totalSelling: 39.98,
    profit: 22.98,
    orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    shippingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date().toISOString(),
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    paymentMethod: "card",
    paymentStatus: "paid",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ORD002",
    customerId: "2",
    customer: {
      id: "2",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+1-555-0124",
      address: {
        street: "456 Oak Ave",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        country: "USA",
      },
      totalOrders: 3,
      totalSpent: 789.45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferredContactMethod: "phone",
    },
    items: [
      {
        id: "2",
        tshirtId: "2",
        quantity: 1,
        unitCost: 12.0,
        unitSelling: 24.99,
        totalCost: 12.0,
        totalSelling: 24.99,
        profit: 12.99,
      },
    ],
    status: "pending",
    totalCost: 12.0,
    totalSelling: 24.99,
    profit: 12.99,
    orderDate: new Date().toISOString(),
    shippingAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    paymentMethod: "paypal",
    paymentStatus: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getAllOrders: RequestHandler = (req, res) => {
  try {
    const {
      status,
      customerId,
      sortField = "createdAt",
      sortDir = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    let filteredOrders = [...mockOrders];

    // Apply filters
    if (status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === status,
      );
    }

    if (customerId) {
      filteredOrders = filteredOrders.filter(
        (order) => order.customerId === customerId,
      );
    }

    // Apply sorting
    filteredOrders.sort((a, b) => {
      const field = sortField as keyof Order;
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
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const response: PaginatedResponse<Order[]> = {
      data: paginatedOrders,
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limitNum),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      data: [],
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getOrderById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const order = mockOrders.find((o) => o.id === id);

    if (!order) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Order not found",
      });
    }

    const response: ApiResponse<Order> = {
      data: order,
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const updateOrderStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderIndex = mockOrders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Order not found",
      });
    }

    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Order> = {
      data: mockOrders[orderIndex],
      success: true,
      message: "Order status updated successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to update order status",
    });
  }
};
