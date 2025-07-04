import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Truck,
  Package,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  TrendingUp,
  Users,
} from "lucide-react";
import { FilterOptions, Order, Customer } from "@shared/types";
import { Navigation } from "@/components/layout/Navigation";
import { OrderDetailsDialog } from "@/components/orders/OrderDetailsDialog";
import { EditOrderDialog } from "@/components/orders/EditOrderDialog";
import { OrderCard } from "@/components/orders/OrderCard";
import { NewOrderDialog } from "@/components/orders/NewOrderDialog";
import { useCurrency } from "@/context/CurrencyContext";

export default function Orders() {
  const { formatCurrency } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [activeTab, setActiveTab] = useState("retail");

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, [filters, activeTab]);

  // Seed data if needed (for development)
  useEffect(() => {
    const seedData = async () => {
      try {
        // Check if we have any data
        const customersResponse = await fetch("/api/customers");
        const customersData = await customersResponse.json();

        if (
          customersData.success &&
          (!customersData.data || customersData.data.length === 0)
        ) {
          // No customers found, seed some data
          console.log("No customers found, seeding initial data...");
          await fetch("/api/customers/seed", { method: "POST" });
          await fetch("/api/inventory/seed", { method: "POST" });
          // Refresh data after seeding
          setTimeout(() => {
            fetchCustomers();
            fetchOrders();
          }, 1000);
        }
      } catch (error) {
        console.log("Seeding check failed:", error);
      }
    };

    seedData();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data || []);
      } else {
        console.error("Customers API error:", data.error);
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.search) queryParams.append("search", filters.search);
      if (filters.status) queryParams.append("status", filters.status);

      const response = await fetch(`/api/orders?${queryParams}`);
      const data = await response.json();

      if (!data.success) {
        console.error("Orders API error:", data.error);
        setOrders([]);
        return;
      }

      let filteredOrders = data.data || [];

      // Filter based on active tab
      if (activeTab === "bulk") {
        filteredOrders = filteredOrders.filter(
          (order: Order) =>
            order.items.length >= 2 ||
            order.items.some((item) => item.quantity >= 5),
        );
      }

      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    const originalOrder = orders.find((o) => o.id === orderId);

    // Update UI immediately for responsive feel
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order,
      ),
    );

    // Add notification immediately
    const statusMessages = {
      pending: "is now pending",
      processing: "is being processed",
      shipped: "has been shipped",
      delivered: "has been delivered",
      cancelled: "has been cancelled",
    };

    // Find the order to get customer name
    const order = orders.find((o) => o.id === orderId);
    const customerName = order?.customer?.name || "Unknown Customer";

    window.dispatchEvent(
      new CustomEvent("addNotification", {
        detail: {
          type: "order_status",
          message: `Order for ${customerName} ${statusMessages[newStatus] || `status changed to ${newStatus}`}`,
        },
      }),
    );

    // Then sync with server
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        // Update with server response to ensure consistency
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, ...data.data } : order,
          ),
        );
      } else {
        // Revert to original state without full refresh
        console.error("Status update failed, reverting:", data.error);
        if (originalOrder) {
          setOrders(orders.map((o) => (o.id === orderId ? originalOrder : o)));
        }
        alert("Failed to update order status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      // Revert to original state without full refresh
      if (originalOrder) {
        setOrders(orders.map((o) => (o.id === orderId ? originalOrder : o)));
      }
      alert("Failed to update order status. Please try again.");
    }
  };

  const handleSaveOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (data.success) {
        // Update the local state
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, ...data.data } : order,
          ),
        );

        // Add notification for successful update
        window.dispatchEvent(
          new CustomEvent("addNotification", {
            detail: {
              type: "order_update",
              message: `Order #${orderId} details have been updated`,
            },
          }),
        );
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    }
  };

  const handlePaymentUpdate = async (
    orderId: string,
    paymentStatus: Order["paymentStatus"],
  ) => {
    // Update local state immediately for responsive UI
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, paymentStatus, paymentDate: new Date().toISOString() }
          : order,
      ),
    );

    // Add notification
    window.dispatchEvent(
      new CustomEvent("addNotification", {
        detail: {
          type: "payment_update",
          message: `Payment marked as ${paymentStatus} for Order #${orderId}`,
        },
      }),
    );
  };

  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      pending: {
        variant: "secondary" as const,
        className: "bg-warning/20 text-warning",
        icon: Clock,
      },
      processing: {
        variant: "default" as const,
        className: "bg-primary/20 text-primary",
        icon: Package,
      },
      shipped: {
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-700",
        icon: Truck,
      },
      delivered: {
        variant: "secondary" as const,
        className: "bg-accent/20 text-accent",
        icon: CheckCircle,
      },
      cancelled: {
        variant: "destructive" as const,
        className: "bg-destructive/20 text-destructive",
        icon: XCircle,
      },
    };

    const { variant, className, icon: Icon } = variants[status];

    return (
      <Badge
        variant={variant}
        className={`${className} flex items-center gap-1`}
      >
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Unknown Customer";
  };

  const getBulkOrderStats = () => {
    const bulkOrders = orders.filter((order) => {
      const totalQuantity = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      return totalQuantity >= 20;
    });

    return {
      totalOrders: bulkOrders.length,
      totalRevenue: bulkOrders.reduce(
        (sum, order) => sum + order.totalSelling,
        0,
      ),
      totalProfit: bulkOrders.reduce((sum, order) => sum + order.profit, 0),
      averageOrderValue:
        bulkOrders.length > 0
          ? bulkOrders.reduce((sum, order) => sum + order.totalSelling, 0) /
            bulkOrders.length
          : 0,
      pendingOrders: bulkOrders.filter((order) => order.status === "pending")
        .length,
    };
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalSelling, 0),
      totalProfit: orders.reduce((sum, o) => sum + o.profit, 0),
    };
    return stats;
  };

  const stats = getOrderStats();
  const bulkStats = getBulkOrderStats();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            <p className="text-slate-600">
              Manage customer orders and track fulfillment
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === "bulk" && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Bulk Orders
              </Button>
            )}
            <Button onClick={() => setShowNewOrder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="retail">Retail Orders (&lt;20 qty)</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Orders (20+ qty)</TabsTrigger>
          </TabsList>

          <TabsContent value="retail" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-warning">
                        {stats.pending}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Revenue
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(stats.totalRevenue)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Profit
                      </p>
                      <p className="text-2xl font-bold text-accent">
                        {formatCurrency(stats.totalProfit)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search orders..."
                        className="pl-10"
                        value={filters.search || ""}
                        onChange={(e) =>
                          setFilters({ ...filters, search: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        status: value === "all" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Orders</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      Table
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      Grid
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading orders...</div>
                ) : viewMode === "table" ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Payment Received</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <span className="font-medium">#{order.id}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.customer?.name}
                              </p>
                              <p className="text-sm text-slate-600">
                                {order.customer?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-600">
                              {order.items.length} items
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatCurrency(order.totalSelling)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-accent">
                              +{formatCurrency(order.profit)}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <span className="text-slate-600">
                              {formatDate(order.orderDate)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {order.paymentDate ? (
                              <span className="text-accent font-medium">
                                {formatDate(order.paymentDate)}
                              </span>
                            ) : (
                              <span className="text-slate-400">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderDetails(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowEditOrder(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Order
                                </DropdownMenuItem>
                                {order.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateOrderStatus(order.id, "processing")
                                    }
                                  >
                                    <Package className="h-4 w-4 mr-2" />
                                    Mark Processing
                                  </DropdownMenuItem>
                                )}
                                {order.status === "processing" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateOrderStatus(order.id, "shipped")
                                    }
                                  >
                                    <Truck className="h-4 w-4 mr-2" />
                                    Mark Shipped
                                  </DropdownMenuItem>
                                )}
                                {order.status === "shipped" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateOrderStatus(order.id, "delivered")
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Delivered
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onViewDetails={(order) => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        onEdit={(order) => {
                          setSelectedOrder(order);
                          setShowEditOrder(true);
                        }}
                        onUpdateStatus={updateOrderStatus}
                        onPaymentUpdate={handlePaymentUpdate}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            {/* Bulk Orders Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Total Bulk Orders
                      </p>
                      <p className="text-2xl font-bold">
                        {bulkStats.totalOrders}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Pending Orders
                      </p>
                      <p className="text-2xl font-bold text-warning">
                        {bulkStats.pendingOrders}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(bulkStats.totalRevenue)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Total Profit
                      </p>
                      <p className="text-2xl font-bold text-accent">
                        {formatCurrency(bulkStats.totalProfit)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(bulkStats.averageOrderValue)}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-slate-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bulk Orders Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search bulk orders..."
                        className="pl-10"
                        value={filters.search || ""}
                        onChange={(e) =>
                          setFilters({ ...filters, search: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        status: value === "all" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading bulk orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-lg font-medium">No Bulk Orders Found</p>
                    <p className="text-sm">
                      Bulk orders require a total quantity of 20 or more items
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Qty</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <span className="font-medium">#{order.id}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.customer?.name ||
                                  getCustomerName(order.customerId)}
                              </p>
                              <p className="text-sm text-slate-600">
                                {order.customer?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {order.items.length} items
                              </Badge>
                              {order.items.length >= 5 && (
                                <Badge className="bg-accent/20 text-accent">
                                  High Volume
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {order.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0,
                              )}{" "}
                              units
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatCurrency(order.totalSelling)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-accent">
                              +{formatCurrency(order.profit)}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <span className="text-slate-600">
                              {formatDate(order.orderDate)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {order.paymentDate ? (
                              <span className="text-accent font-medium">
                                {formatDate(order.paymentDate)}
                              </span>
                            ) : (
                              <span className="text-slate-400">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderDetails(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowEditOrder(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Order
                                </DropdownMenuItem>
                                {order.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateOrderStatus(order.id, "processing")
                                    }
                                  >
                                    <Package className="h-4 w-4 mr-2" />
                                    Mark Processing
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Details Dialog */}
        <OrderDetailsDialog
          open={showOrderDetails}
          onOpenChange={setShowOrderDetails}
          order={selectedOrder}
        />

        {/* Edit Order Dialog */}
        <EditOrderDialog
          open={showEditOrder}
          onOpenChange={setShowEditOrder}
          order={selectedOrder}
          onSave={handleSaveOrder}
        />

        {/* New Order Dialog */}
        <NewOrderDialog
          open={showNewOrder}
          onOpenChange={setShowNewOrder}
          onOrderCreated={fetchOrders}
        />
      </div>
    </div>
  );
}
