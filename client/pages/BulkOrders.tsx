import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Package,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
} from "lucide-react";
import { Order, Customer, FilterOptions } from "@shared/types";
import { Navigation } from "@/components/layout/Navigation";
import { NewOrderDialog } from "@/components/orders/NewOrderDialog";
import { OrderDetailsDialog } from "@/components/orders/OrderDetailsDialog";
import { EditOrderDialog } from "@/components/orders/EditOrderDialog";

export default function BulkOrders() {
  const [bulkOrders, setBulkOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showEditOrder, setShowEditOrder] = useState(false);

  useEffect(() => {
    fetchBulkOrders();
    fetchCustomers();
  }, [filters]);

  const fetchBulkOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      // Add filter for bulk orders (orders with multiple items or large quantities)
      queryParams.append("minItems", "2");
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.status) queryParams.append("status", filters.status);

      const response = await fetch(`/api/orders?${queryParams}`);
      const data = await response.json();

      // Filter for bulk orders (orders with 2+ items or quantity >= 5)
      const filteredBulkOrders = (data.data || []).filter(
        (order: Order) =>
          order.items.length >= 2 ||
          order.items.some((item) => item.quantity >= 5),
      );

      setBulkOrders(filteredBulkOrders);
    } catch (error) {
      console.error("Error fetching bulk orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      setCustomers(data.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Unknown Customer";
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setBulkOrders(
          bulkOrders.map((order) =>
            order.id === orderId ? { ...order, ...data.data } : order,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
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
        setBulkOrders(
          bulkOrders.map((order) =>
            order.id === orderId ? { ...order, ...data.data } : order,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      pending: "bg-warning/20 text-warning",
      processing: "bg-primary/20 text-primary",
      shipped: "bg-blue-100 text-blue-700",
      delivered: "bg-accent/20 text-accent",
      cancelled: "bg-destructive/20 text-destructive",
    };

    return (
      <Badge className={variants[status]}>
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

  const getBulkOrderStats = () => {
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

  const stats = getBulkOrderStats();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bulk Orders</h1>
            <p className="text-slate-600">
              Manage high-volume orders and wholesale transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Bulk Orders
            </Button>
            <Button onClick={() => setShowNewOrder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Bulk Order
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Bulk Orders
                  </p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
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
                    {stats.pendingOrders}
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
                    ₹{stats.totalRevenue.toLocaleString()}
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
                    ₹{stats.totalProfit.toLocaleString()}
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
                    ₹{stats.averageOrderValue.toFixed(0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-slate-600" />
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
            ) : bulkOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-lg font-medium">No Bulk Orders Found</p>
                <p className="text-sm">
                  Bulk orders are orders with 2+ items or quantities of 5+
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
                  {bulkOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-medium">#{order.id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {getCustomerName(order.customerId)}
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
                          ₹{order.totalSelling.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-accent">
                          +₹{order.profit.toFixed(2)}
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

        {/* Dialogs */}
        <NewOrderDialog
          open={showNewOrder}
          onOpenChange={setShowNewOrder}
          onOrderCreated={fetchBulkOrders}
        />

        <OrderDetailsDialog
          open={showOrderDetails}
          onOpenChange={setShowOrderDetails}
          order={selectedOrder}
        />

        <EditOrderDialog
          open={showEditOrder}
          onOpenChange={setShowEditOrder}
          order={selectedOrder}
          onSave={handleSaveOrder}
        />
      </div>
    </div>
  );
}
