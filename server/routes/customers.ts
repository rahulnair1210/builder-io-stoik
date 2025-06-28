import { RequestHandler } from "express";
import { Customer, ApiResponse } from "@shared/types";
import { customerService } from "../services/customerService";
import { orderService } from "../services/orderService";

// Get all customers
export const getAllCustomers: RequestHandler = async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();

    // Calculate dynamic totals from actual orders
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const customerOrders = await orderService.getOrdersByCustomer(
          customer.id,
        );
        const totalSpent = customerOrders.reduce(
          (sum, order) => sum + order.totalSelling,
          0,
        );
        const orderCount = customerOrders.length;

        return {
          ...customer,
          totalSpent,
          orderCount,
        };
      }),
    );

    const response: ApiResponse<Customer[]> = {
      success: true,
      data: customersWithStats,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch customers",
    });
  }
};

// Get customer by ID
export const getCustomerById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    // Get customer orders and calculate stats
    const customerOrders = await orderService.getOrdersByCustomer(id);
    const totalSpent = customerOrders.reduce(
      (sum, order) => sum + order.totalSelling,
      0,
    );
    const orderCount = customerOrders.length;

    const customerWithStats = {
      ...customer,
      totalSpent,
      orderCount,
    };

    const response: ApiResponse<Customer> = {
      success: true,
      data: customerWithStats,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getCustomerById:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch customer",
    });
  }
};

// Create new customer
export const createCustomer: RequestHandler = async (req, res) => {
  try {
    const customerData = req.body;

    // Basic validation
    if (!customerData.name || !customerData.email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, email",
      });
    }

    const customer = await customerService.createCustomer(customerData);

    const response: ApiResponse<Customer> = {
      success: true,
      data: customer,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in createCustomer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create customer",
    });
  }
};

// Update customer
export const updateCustomer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await customerService.updateCustomer(id, updateData);

    const response: ApiResponse<Customer> = {
      success: true,
      data: customer,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in updateCustomer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update customer",
    });
  }
};

// Delete customer
export const deleteCustomer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await customerService.deleteCustomer(id);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in deleteCustomer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete customer",
    });
  }
};

// Get customer orders
export const getCustomerOrders: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await orderService.getOrdersByCustomer(id);

    const response: ApiResponse<any[]> = {
      success: true,
      data: orders,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getCustomerOrders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch customer orders",
    });
  }
};

// Seed initial data (for development)
export const seedData: RequestHandler = async (req, res) => {
  try {
    await customerService.seedInitialData();

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in seedData:", error);
    res.status(500).json({
      success: false,
      error: "Failed to seed customer data",
    });
  }
};
