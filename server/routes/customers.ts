import { RequestHandler } from "express";
import { Customer, ApiResponse, PaginatedResponse } from "@shared/types";

// Helper function to calculate customer totals from orders
const calculateCustomerTotals = (customerId: string) => {
  const { mockOrders } = require("./orders");
  const customerOrders = mockOrders.filter(
    (order: any) => order.customerId === customerId,
  );
  return {
    totalOrders: customerOrders.length,
    totalSpent: customerOrders.reduce(
      (sum: number, order: any) => sum + order.totalSelling,
      0,
    ),
  };
};

// Mock data for customers
let mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    phone: "+91 98765 43210",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    totalOrders: 0, // Will be calculated dynamically
    totalSpent: 0, // Will be calculated dynamically
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferredContactMethod: "email",
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+91 87654 32109",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    totalOrders: 0, // Will be calculated dynamically
    totalSpent: 0, // Will be calculated dynamically
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferredContactMethod: "phone",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+91 76543 21098",
    address: {
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA",
    },
    totalOrders: 0, // Will be calculated dynamically
    totalSpent: 0, // Will be calculated dynamically
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferredContactMethod: "email",
  },
];

export const getAllCustomers: RequestHandler = (req, res) => {
  try {
    const {
      search,
      sortField = "name",
      sortDir = "asc",
      page = "1",
      limit = "50",
    } = req.query;

    // Update customer totals from orders before filtering
    let filteredCustomers = mockCustomers.map((customer) => {
      try {
        const totals = calculateCustomerTotals(customer.id);
        return {
          ...customer,
          totalOrders: totals.totalOrders,
          totalSpent: totals.totalSpent,
        };
      } catch (error) {
        // If orders calculation fails, return customer as is
        return customer;
      }
    });

    // Apply search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredCustomers = filteredCustomers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm) ||
          customer.phone.includes(searchTerm),
      );
    }

    // Apply sorting
    filteredCustomers.sort((a, b) => {
      const field = sortField as keyof Customer;
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
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    const response: PaginatedResponse<Customer[]> = {
      data: paginatedCustomers,
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredCustomers.length,
        totalPages: Math.ceil(filteredCustomers.length / limitNum),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      data: [],
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

export const getCustomerById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const customer = mockCustomers.find((c) => c.id === id);

    if (!customer) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Customer not found",
      });
    }

    const response: ApiResponse<Customer> = {
      data: customer,
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

export const createCustomer: RequestHandler = (req, res) => {
  try {
    const customerData = req.body;
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCustomers.push(newCustomer);

    const response: ApiResponse<Customer> = {
      data: newCustomer,
      success: true,
      message: "Customer created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to create customer",
    });
  }
};

export const updateCustomer: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const customerIndex = mockCustomers.findIndex((c) => c.id === id);
    if (customerIndex === -1) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Customer not found",
      });
    }

    mockCustomers[customerIndex] = {
      ...mockCustomers[customerIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Customer> = {
      data: mockCustomers[customerIndex],
      success: true,
      message: "Customer updated successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to update customer",
    });
  }
};

export const deleteCustomer: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const customerIndex = mockCustomers.findIndex((c) => c.id === id);

    if (customerIndex === -1) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Customer not found",
      });
    }

    mockCustomers.splice(customerIndex, 1);

    const response: ApiResponse<void> = {
      data: undefined,
      success: true,
      message: "Customer deleted successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to delete customer",
    });
  }
};

export const getCustomerOrders: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const customer = mockCustomers.find((c) => c.id === id);

    if (!customer) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Customer not found",
      });
    }

    // Mock order data for the customer
    const customerOrders = [
      {
        id: "ORD001",
        customerId: id,
        customer,
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
        orderDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        deliveryDate: new Date(
          Date.now() - 28 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        shippingAddress: customer.address,
        paymentMethod: "card",
        paymentStatus: "paid",
        createdAt: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 28 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];

    const response: ApiResponse<any[]> = {
      data: customerOrders,
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({
      data: [],
      success: false,
      message: "Failed to fetch customer orders",
    });
  }
};

export const getPendingDeliveries: RequestHandler = (req, res) => {
  try {
    // Mock data for customers with pending deliveries
    const pendingDeliveries = mockCustomers.filter(
      (customer) => customer.totalOrders > 0, // Mock condition - in real app, check for shipped but not delivered orders
    );

    const response: ApiResponse<Customer[]> = {
      data: pendingDeliveries.slice(0, 2), // Mock: 2 customers with pending deliveries
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching pending deliveries:", error);
    res.status(500).json({
      data: [],
      success: false,
      message: "Failed to fetch pending deliveries",
    });
  }
};
