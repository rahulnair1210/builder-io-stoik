import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ShoppingBag,
  Package,
  Star,
  Calendar,
} from "lucide-react";
import { Customer, Order } from "@shared/types";
import { Navigation } from "@/components/layout/Navigation";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { CustomerHistory } from "@/components/customers/CustomerHistory";
import { BulkOrderForm } from "@/components/customers/BulkOrderForm";
import { useCurrency } from "@/context/CurrencyContext";

export default function Customers() {
  const { formatCurrency } = useCurrency();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBulkOrder, setShowBulkOrder] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customers");
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data || []);
      } else {
        console.error("API Error:", data.error);
        // If it's a server error, show empty state instead of mock data
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      // Network error - show empty state
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    const customerToDelete = customers.find((c) => c.id === id);

    // Remove from UI immediately
    setCustomers(customers.filter((c) => c.id !== id));

    // Show notification
    window.dispatchEvent(
      new CustomEvent("addNotification", {
        detail: {
          type: "customer_deleted",
          message: `Customer ${customerToDelete?.name || id} has been deleted`,
        },
      }),
    );

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Revert on failure
        if (customerToDelete) {
          setCustomers([...customers, customerToDelete]);
        }
        alert("Failed to delete customer. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      // Revert on error
      if (customerToDelete) {
        setCustomers([...customers, customerToDelete]);
      }
      alert("Failed to delete customer. Please try again.");
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    switch (activeTab) {
      case "vip":
        return matchesSearch && customer.totalSpent > 1000;
      case "new":
        return matchesSearch && customer.totalOrders <= 1;
      default:
        return matchesSearch;
    }
  });

  const getCustomerStats = () => {
    return {
      total: customers.length,
      vip: customers.filter((c) => c.totalSpent > 1000).length,
      new: customers.filter((c) => c.totalOrders <= 1).length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    };
  };

  const stats = getCustomerStats();

  const showCustomerHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowHistory(true);
  };

  const showBulkOrderDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowBulkOrder(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
            <p className="text-slate-600">
              Manage customer relationships and order history
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCustomer(null);
                setShowBulkOrder(true);
              }}
            >
              <Package className="h-4 w-4 mr-2" />
              Bulk Order
            </Button>
            <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <CustomerForm
                  customer={selectedCustomer}
                  onSubmit={async (data) => {
                    try {
                      const response = await fetch("/api/customers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                      });
                      const result = await response.json();
                      if (result.success) {
                        // Add customer immediately to UI
                        setCustomers([result.data, ...customers]);
                        setShowCustomerForm(false);
                        setSelectedCustomer(null);

                        // Show success notification
                        window.dispatchEvent(
                          new CustomEvent("addNotification", {
                            detail: {
                              type: "customer_created",
                              message: `Customer ${result.data.name} has been created successfully`,
                            },
                          }),
                        );
                      } else {
                        alert("Failed to create customer. Please try again.");
                      }
                    } catch (error) {
                      console.error("Error creating customer:", error);
                      alert("Failed to create customer. Please try again.");
                    }
                  }}
                  onCancel={() => {
                    setShowCustomerForm(false);
                    setSelectedCustomer(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    VIP Customers
                  </p>
                  <p className="text-2xl font-bold text-accent">{stats.vip}</p>
                </div>
                <Star className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    New Customers
                  </p>
                  <p className="text-2xl font-bold text-primary">{stats.new}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
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
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers by name, email, or phone..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Tabs */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Customers</TabsTrigger>
                <TabsTrigger value="vip">VIP ($1000+)</TabsTrigger>
                <TabsTrigger value="new">New Customers</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading customers...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No customers yet
                </h3>
                <p className="text-slate-600 mb-4">
                  {searchTerm || activeTab !== "all"
                    ? "No customers match your current filters."
                    : "Get started by adding your first customer."}
                </p>
                {!searchTerm && activeTab === "all" && (
                  <Button onClick={() => setShowCustomerForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Customer
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <Card
                    key={customer.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {customer.name}
                              </h3>
                              {customer.totalSpent > 1000 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-accent/20 text-accent"
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  VIP
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <MapPin className="h-3 w-3" />
                                {customer.address.city},{" "}
                                {customer.address.state}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center min-w-[80px] p-3 bg-slate-50 rounded-lg border">
                            <p className="text-xs text-slate-500 mb-1">
                              Orders
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                              {customer.totalOrders}
                            </p>
                          </div>
                          <div className="text-center min-w-[100px] p-3 bg-slate-50 rounded-lg border">
                            <p className="text-xs text-slate-500 mb-1">
                              Total Spent
                            </p>
                            <p className="text-lg font-bold text-accent">
                              {formatCurrency(customer.totalSpent)}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showCustomerHistory(customer)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              History
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showBulkOrderDialog(customer)}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Bulk Order
                            </Button>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowCustomerForm(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => showCustomerHistory(customer)}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                View History
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteCustomer(customer.id)
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer History Dialog */}
        {selectedCustomer && (
          <CustomerHistory
            open={showHistory}
            onOpenChange={setShowHistory}
            customer={selectedCustomer}
          />
        )}

        {/* Bulk Order Dialog */}
        <BulkOrderForm
          open={showBulkOrder}
          onOpenChange={(open) => {
            setShowBulkOrder(open);
            if (!open) {
              setSelectedCustomer(null);
            }
          }}
          customer={selectedCustomer}
          onSubmit={async (orderData) => {
            try {
              const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
              });
              const result = await response.json();
              if (result.success) {
                setShowBulkOrder(false);
                setSelectedCustomer(null);
                // Refresh customer data to update totals
                await fetchCustomers();

                // Add success notification
                const orderTotal = result.data.totalSelling || 0;
                window.dispatchEvent(
                  new CustomEvent("addNotification", {
                    detail: {
                      type: "bulk_order",
                      message: `Bulk order #${result.data.id} created for ${selectedCustomer?.name || "customer"} - ${formatCurrency(orderTotal)}`,
                    },
                  }),
                );

                // Send WhatsApp notification if enabled
                try {
                  await fetch("/api/notifications/order-created", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderId: result.data.id,
                      customerName: selectedCustomer?.name,
                      total: result.data.totalSelling,
                    }),
                  });
                } catch (notificationError) {
                  console.log(
                    "Notification sending failed:",
                    notificationError,
                  );
                }
              } else {
                alert("Failed to create order. Please try again.");
              }
            } catch (error) {
              console.error("Error creating bulk order:", error);
            }
          }}
        />
      </div>
    </div>
  );
}
