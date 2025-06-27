/**
 * Shared types for T-Shirt Inventory Management Application
 */

export interface TShirt {
  id: string;
  name: string;
  design: string;
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
  color: string;
  stockLevel: number;
  minStockLevel: number;
  costPrice: number;
  sellingPrice: number;
  category: string;
  tags: string[];
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  preferredContactMethod: "email" | "phone" | "sms";
}

export interface Order {
  id: string;
  customerId: string;
  customer?: Customer;
  items: OrderItem[];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalCost: number;
  totalSelling: number;
  profit: number;
  orderDate: string;
  shippingDate?: string;
  deliveryDate?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: "cash" | "card" | "bank_transfer" | "paypal" | "other";
  paymentStatus: "pending" | "paid" | "refunded";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  tshirtId: string;
  tshirt?: TShirt;
  quantity: number;
  unitCost: number;
  unitSelling: number;
  totalCost: number;
  totalSelling: number;
  profit: number;
}

export interface Photo {
  id: string;
  url: string;
  filename: string;
  alt: string;
  caption?: string;
  type: "design" | "product" | "customer" | "reference";
  entityId: string; // ID of the entity this photo belongs to
  uploadDate: string;
  size: number; // file size in bytes
  dimensions: {
    width: number;
    height: number;
  };
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalProfit: number;
  profitMargin: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalProfit: number;
  averageOrderValue: number;
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  topCustomers: Array<{
    customer: Customer;
    totalSpent: number;
    orderCount: number;
  }>;
}

export interface DashboardStats {
  inventory: InventoryStats;
  orders: OrderStats;
  customers: CustomerStats;
  monthlyProfitTrend: Array<{
    month: string;
    profit: number;
    revenue: number;
  }>;
  topSellingItems: Array<{
    tshirt: TShirt;
    quantitySold: number;
    revenue: number;
  }>;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationPreferences {
  lowStock: boolean;
  outOfStock: boolean;
  newOrders: boolean;
  orderStatusUpdates: boolean;
  paymentUpdates: boolean;
}

export interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  dateRange?: {
    start: string;
    end: string;
  };
  includePhotos?: boolean;
  fields?: string[];
}

// API endpoint interfaces
export interface InventoryAPI {
  getAll: (
    filters?: FilterOptions,
    sort?: SortOptions,
    pagination?: PaginationOptions,
  ) => Promise<PaginatedResponse<TShirt[]>>;
  getById: (id: string) => Promise<ApiResponse<TShirt>>;
  create: (
    tshirt: Omit<TShirt, "id" | "createdAt" | "updatedAt">,
  ) => Promise<ApiResponse<TShirt>>;
  update: (id: string, tshirt: Partial<TShirt>) => Promise<ApiResponse<TShirt>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  updateStock: (id: string, newStock: number) => Promise<ApiResponse<TShirt>>;
}

export interface OrderAPI {
  getAll: (
    filters?: FilterOptions,
    sort?: SortOptions,
    pagination?: PaginationOptions,
  ) => Promise<PaginatedResponse<Order[]>>;
  getById: (id: string) => Promise<ApiResponse<Order>>;
  create: (
    order: Omit<Order, "id" | "createdAt" | "updatedAt" | "profit">,
  ) => Promise<ApiResponse<Order>>;
  update: (id: string, order: Partial<Order>) => Promise<ApiResponse<Order>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  updateStatus: (
    id: string,
    status: Order["status"],
  ) => Promise<ApiResponse<Order>>;
}

export interface CustomerAPI {
  getAll: (
    filters?: FilterOptions,
    sort?: SortOptions,
    pagination?: PaginationOptions,
  ) => Promise<PaginatedResponse<Customer[]>>;
  getById: (id: string) => Promise<ApiResponse<Customer>>;
  create: (
    customer: Omit<
      Customer,
      "id" | "createdAt" | "updatedAt" | "totalOrders" | "totalSpent"
    >,
  ) => Promise<ApiResponse<Customer>>;
  update: (
    id: string,
    customer: Partial<Customer>,
  ) => Promise<ApiResponse<Customer>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  getOrders: (id: string) => Promise<ApiResponse<Order[]>>;
}

export interface PhotoAPI {
  upload: (
    file: File,
    type: Photo["type"],
    entityId: string,
  ) => Promise<ApiResponse<Photo>>;
  getById: (id: string) => Promise<ApiResponse<Photo>>;
  getByEntity: (entityId: string) => Promise<ApiResponse<Photo[]>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  update: (id: string, photo: Partial<Photo>) => Promise<ApiResponse<Photo>>;
}

export interface AnalyticsAPI {
  getDashboardStats: (dateRange?: {
    start: string;
    end: string;
  }) => Promise<ApiResponse<DashboardStats>>;
  getInventoryStats: () => Promise<ApiResponse<InventoryStats>>;
  getOrderStats: (dateRange?: {
    start: string;
    end: string;
  }) => Promise<ApiResponse<OrderStats>>;
  getCustomerStats: () => Promise<ApiResponse<CustomerStats>>;
  getProfitTrend: (
    months: number,
  ) => Promise<
    ApiResponse<Array<{ month: string; profit: number; revenue: number }>>
  >;
}

export interface ExportAPI {
  exportInventory: (options: ExportOptions) => Promise<Blob>;
  exportOrders: (options: ExportOptions) => Promise<Blob>;
  exportCustomers: (options: ExportOptions) => Promise<Blob>;
  exportProfitReport: (options: ExportOptions) => Promise<Blob>;
}
