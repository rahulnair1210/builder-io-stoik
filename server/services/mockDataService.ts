import { TShirt, Customer, Order } from "@shared/types";

// Mock data for development when Firebase is not available
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
    name: "Graphic Print Tee",
    design: "Abstract Art",
    size: "M",
    color: "Blue",
    stockLevel: 22,
    minStockLevel: 15,
    costPrice: 10.0,
    sellingPrice: 22.99,
    category: "Graphic",
    tags: ["graphic", "art", "modern"],
    photos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockCustomers: Customer[] = [
  {
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
    totalSpent: 145.5,
    totalOrders: 3,
    preferredContactMethod: "email",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1-555-0124",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    totalSpent: 89.99,
    totalOrders: 2,
    preferredContactMethod: "phone",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Mike Davis",
    email: "mike@example.com",
    phone: "+1-555-0125",
    address: {
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA",
    },
    totalSpent: 234.97,
    totalOrders: 5,
    preferredContactMethod: "email",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockOrders: Order[] = [
  {
    id: "1",
    customerId: "1",
    customer: mockCustomers[0],
    items: [
      {
        tshirtId: "1",
        name: "Classic Cotton Tee",
        size: "M",
        color: "Black",
        quantity: 2,
        cost: 8.5,
        price: 19.99,
        unitSelling: 19.99,
        totalSelling: 39.98,
        profit: 22.98,
      },
    ],
    totalCost: 17.0,
    totalSelling: 39.98,
    profit: 22.98,
    status: "pending",
    paymentMethod: "card",
    paymentStatus: "pending",
    paymentDate: undefined,
    orderDate: new Date().toISOString(),
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    customerId: "2",
    customer: mockCustomers[1],
    items: [
      {
        tshirtId: "2",
        name: "Sport Performance Tee",
        size: "L",
        color: "Navy",
        quantity: 1,
        cost: 12.0,
        price: 24.99,
        unitSelling: 24.99,
        totalSelling: 24.99,
        profit: 12.99,
      },
    ],
    totalCost: 12.0,
    totalSelling: 24.99,
    profit: 12.99,
    status: "delivered",
    paymentMethod: "cash",
    paymentStatus: "paid",
    paymentDate: new Date().toISOString(),
    orderDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockSettings = {
  business: {
    businessName: "Stoik T-Shirt Store",
    address: "",
    phone: "",
    email: "",
    currency: "USD",
    taxRate: 0,
    defaultMinStock: 5,
  },
  notifications: {
    lowStock: true,
    outOfStock: true,
    newOrders: true,
    orderStatusUpdates: false,
    paymentUpdates: false,
    whatsappEnabled: false,
    whatsappNumber: "",
    emailEnabled: true,
    emailAddress: "",
    lowStockThreshold: 5,
  },
};

// Helper functions for mock data manipulation
export class MockDataStore {
  private static products = [...mockProducts];
  private static customers = [...mockCustomers];
  private static orders = [...mockOrders];
  private static settings = { ...mockSettings };

  // Products
  static getProducts() {
    return [...this.products];
  }

  static getProductById(id: string) {
    return this.products.find((p) => p.id === id) || null;
  }

  static addProduct(product: TShirt) {
    this.products.push(product);
    return product;
  }

  static updateProduct(id: string, updates: Partial<TShirt>) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates };
      return this.products[index];
    }
    throw new Error("Product not found");
  }

  static deleteProduct(id: string) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
    }
  }

  // Customers
  static getCustomers() {
    return [...this.customers];
  }

  static getCustomerById(id: string) {
    return this.customers.find((c) => c.id === id) || null;
  }

  static addCustomer(customer: Customer) {
    this.customers.push(customer);
    return customer;
  }

  static updateCustomer(id: string, updates: Partial<Customer>) {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...updates };
      return this.customers[index];
    }
    console.warn(`Customer ${id} not found for update`);
    return null;
  }

  static deleteCustomer(id: string) {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.customers.splice(index, 1);
    }
  }

  // Orders
  static getOrders() {
    return [...this.orders];
  }

  static getOrderById(id: string) {
    return this.orders.find((o) => o.id === id) || null;
  }

  static addOrder(order: Order) {
    this.orders.push(order);
    return order;
  }

  static updateOrder(id: string, updates: Partial<Order>) {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...updates };
      return this.orders[index];
    }
    throw new Error("Order not found");
  }

  // Settings
  static getSettings() {
    return { ...this.settings };
  }

  static updateSettings(updates: any) {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }
}
