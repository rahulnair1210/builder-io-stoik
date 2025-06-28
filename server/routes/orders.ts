import { RequestHandler } from "express";
import { Order, ApiResponse } from "@shared/types";
import { orderService } from "../services/orderService";
import { customerService } from "../services/customerService";

// Get all orders with filtering
export const getAllOrders: RequestHandler = async (req, res) => {
  try {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      customerId: req.query.customerId as string,
      minItems: req.query.minItems as string,
    };

    const orders = await orderService.getAllOrders(filters);

    // Populate customer information
    const ordersWithCustomers = await Promise.all(
      orders.map(async (order) => {
        if (order.customerId) {
          try {
            const customer = await customerService.getCustomerById(
              order.customerId,
            );
            return { ...order, customer };
          } catch (error) {
            console.warn(
              `Customer ${order.customerId} not found for order ${order.id}`,
            );
            // Return order without customer info if customer not found
            return { ...order, customer: null };
          }
        }
        return order;
      }),
    );

    const response: ApiResponse<Order[]> = {
      success: true,
      data: ordersWithCustomers,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    });
  }
};

// Get order by ID
export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Populate customer information
    let orderWithCustomer = order;
    if (order.customerId) {
      try {
        const customer = await customerService.getCustomerById(
          order.customerId,
        );
        orderWithCustomer = { ...order, customer };
      } catch (error) {
        console.warn(
          `Customer ${order.customerId} not found for order ${order.id}`,
        );
        // Return order without customer info if customer not found
        orderWithCustomer = { ...order, customer: null };
      }
    }

    const response: ApiResponse<Order> = {
      success: true,
      data: orderWithCustomer,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getOrderById:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch order",
    });
  }
};

// Create new order
export const createOrder: RequestHandler = async (req, res) => {
  try {
    const orderData = req.body;

    // Basic validation
    if (
      !orderData.items ||
      !Array.isArray(orderData.items) ||
      orderData.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Order must have at least one item",
      });
    }

    if (!orderData.customerId) {
      return res.status(400).json({
        success: false,
        error: "Customer ID is required",
      });
    }

    const order = await orderService.createOrder(orderData);

    // Populate customer information for response
    const customer = await customerService.getCustomerById(order.customerId);
    const orderWithCustomer = { ...order, customer };

    const response: ApiResponse<Order> = {
      success: true,
      data: orderWithCustomer,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    });
  }
};

// Update order
export const updateOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await orderService.updateOrder(id, updateData);

    // Populate customer information
    let orderWithCustomer = order;
    if (order.customerId) {
      const customer = await customerService.getCustomerById(order.customerId);
      orderWithCustomer = { ...order, customer };
    }

    const response: ApiResponse<Order> = {
      success: true,
      data: orderWithCustomer,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in updateOrder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update order",
    });
  }
};

// Update order status
export const updateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    const order = await orderService.updateOrderStatus(id, status);

    // Populate customer information
    let orderWithCustomer = order;
    if (order.customerId) {
      const customer = await customerService.getCustomerById(order.customerId);
      orderWithCustomer = { ...order, customer };
    }

    const response: ApiResponse<Order> = {
      success: true,
      data: orderWithCustomer,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update order status",
    });
  }
};

// Delete order
export const deleteOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await orderService.deleteOrder(id);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete order",
    });
  }
};

// Seed initial data (for development)
export const seedData: RequestHandler = async (req, res) => {
  try {
    await orderService.seedInitialData();

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in seedData:", error);
    res.status(500).json({
      success: false,
      error: "Failed to seed order data",
    });
  }
};
