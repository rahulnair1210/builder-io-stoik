import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, Trash2, Calculator, ShoppingCart } from "lucide-react";
import { Customer, TShirt, Order, OrderItem } from "@shared/types";
import { useCurrency } from "@/context/CurrencyContext";

interface BulkOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSubmit: (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "profit">,
  ) => void;
}

interface BulkOrderItem {
  tshirtId: string;
  tshirt?: TShirt;
  quantity: number;
}

export function BulkOrderForm({
  open,
  onOpenChange,
  customer,
  onSubmit,
}: BulkOrderFormProps) {
  const { formatCurrency } = useCurrency();
  const [products, setProducts] = useState<TShirt[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    customer,
  );
  const [orderItems, setOrderItems] = useState<BulkOrderItem[]>([
    { tshirtId: "", quantity: 1 },
  ]);
  const [orderData, setOrderData] = useState({
    paymentMethod: "card" as Order["paymentMethod"],
    paymentStatus: "pending" as Order["paymentStatus"],
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProducts();
      fetchCustomers();
    }
  }, [open]);

  // Force refresh products every time dialog opens to show newly added inventory
  useEffect(() => {
    if (open) {
      // Small delay to ensure any pending inventory updates are complete
      const timer = setTimeout(() => {
        fetchProducts();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    setSelectedCustomer(customer);
  }, [customer]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
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

  const handleItemChange = useCallback(
    (index: number, field: keyof BulkOrderItem, value: string | number) => {
      setOrderItems((prev) => {
        const newItems = [...prev];
        if (field === "tshirtId") {
          const product = products.find((p) => p.id === value);
          newItems[index] = {
            ...newItems[index],
            tshirtId: value as string,
            tshirt: product,
          };
        } else {
          newItems[index] = {
            ...newItems[index],
            [field]: value,
          };
        }
        return newItems;
      });
    },
    [products],
  );

  const addOrderItem = () => {
    setOrderItems((prev) => [...prev, { tshirtId: "", quantity: 1 }]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    let totalCost = 0;
    let totalSelling = 0;

    const validItems = orderItems.filter(
      (item) => item.tshirt && item.quantity > 0,
    );

    validItems.forEach((item) => {
      if (item.tshirt) {
        totalCost += item.tshirt.costPrice * item.quantity;
        totalSelling += item.tshirt.sellingPrice * item.quantity;
      }
    });

    return {
      totalCost,
      totalSelling,
      profit: totalSelling - totalCost,
      itemCount: validItems.length,
      totalQuantity: validItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    const validItems = orderItems.filter(
      (item) => item.tshirt && item.quantity > 0,
    );
    if (validItems.length === 0) {
      alert("Please add at least one valid item to the order");
      return;
    }

    // Validate minimum quantity for bulk orders (20+)
    const totalQuantity = validItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    if (totalQuantity < 20) {
      alert(
        `Bulk orders require a minimum total quantity of 20 items. Current total: ${totalQuantity}. Please increase quantities or this will be classified as a retail order.`,
      );
      return;
    }

    // Check stock availability for all items
    const stockErrors = [];
    for (const item of validItems) {
      if (!item.tshirt) continue;

      if (item.tshirt.stockLevel === 0) {
        stockErrors.push(
          `${item.tshirt.name} (${item.tshirt.size} ${item.tshirt.color}) is out of stock`,
        );
      } else if (item.quantity > item.tshirt.stockLevel) {
        stockErrors.push(
          `Only ${item.tshirt.stockLevel} units of ${item.tshirt.name} (${item.tshirt.size} ${item.tshirt.color}) available, but ${item.quantity} requested`,
        );
      }
    }

    if (stockErrors.length > 0) {
      alert("Stock validation failed:\n" + stockErrors.join("\n"));
      return;
    }

    const totals = calculateTotals();

    const orderItemsData: OrderItem[] = validItems.map((item, index) => ({
      id: `item_${index}`,
      tshirtId: item.tshirtId,
      tshirt: item.tshirt,
      quantity: item.quantity,
      unitCost: item.tshirt!.costPrice,
      unitSelling: item.tshirt!.sellingPrice,
      totalCost: item.tshirt!.costPrice * item.quantity,
      totalSelling: item.tshirt!.sellingPrice * item.quantity,
      profit:
        (item.tshirt!.sellingPrice - item.tshirt!.costPrice) * item.quantity,
    }));

    const order = {
      customerId: selectedCustomer.id,
      customer: selectedCustomer,
      items: orderItemsData,
      status: "pending" as Order["status"],
      totalCost: totals.totalCost,
      totalSelling: totals.totalSelling,
      orderDate: new Date().toISOString(),
      shippingAddress: selectedCustomer.address,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus,
      notes: orderData.notes,
    };

    setLoading(true);
    try {
      await onSubmit(order);
      // Reset form on success
      setOrderItems([{ tshirtId: "", quantity: 1 }]);
      setOrderData({
        paymentMethod: "card",
        paymentStatus: "pending",
        notes: "",
      });
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error creating bulk order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Bulk Order {customer && `- ${customer.name}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Label>Select Customer</Label>
                <Select
                  value={selectedCustomer?.id || ""}
                  onValueChange={(value) => {
                    const customer = customers.find((c) => c.id === value);
                    setSelectedCustomer(customer || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers
                      .filter(
                        (customer) => customer.id && customer.id.trim() !== "",
                      )
                      .map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{customer.name}</span>
                            <span className="text-sm text-slate-500 ml-2">
                              {customer.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info Display */}
              {selectedCustomer && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{selectedCustomer.name}</h3>
                      <p className="text-sm text-slate-600">
                        {selectedCustomer.email}
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedCustomer.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Previous Orders</p>
                      <p className="font-medium">
                        {selectedCustomer.totalOrders}
                      </p>
                      <p className="text-sm text-accent">
                        {formatCurrency(selectedCustomer.totalSpent)} spent
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Order Items</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fetchProducts}
                  title="Refresh product list"
                >
                  <Package className="h-4 w-4 mr-1" />
                  Refresh Products
                </Button>
                <Button type="button" variant="outline" onClick={addOrderItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {orderItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label>Product</Label>
                      <Select
                        value={item.tshirtId}
                        onValueChange={(value) =>
                          handleItemChange(index, "tshirtId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products
                            .filter(
                              (product) =>
                                product.id && product.id.trim() !== "",
                            )
                            .map((product) => (
                              <SelectItem
                                key={product.id}
                                value={product.id}
                                disabled={product.stockLevel === 0}
                              >
                                <div className="flex items-center gap-2">
                                  {product.name} - {product.size}{" "}
                                  {product.color}
                                  <Badge variant="outline">
                                    ${product.sellingPrice}
                                  </Badge>
                                  <Badge
                                    variant={
                                      product.stockLevel > 0
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {product.stockLevel === 0
                                      ? "Out of Stock"
                                      : `${product.stockLevel} in stock`}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-24">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        max={item.tshirt?.stockLevel || 0}
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const maxStock = item.tshirt?.stockLevel || 0;
                          if (value > maxStock) {
                            alert(`Only ${maxStock} units available in stock`);
                            return;
                          }
                          handleItemChange(index, "quantity", value);
                        }}
                        className={
                          item.tshirt && item.tshirt.stockLevel === 0
                            ? "border-destructive bg-destructive/10"
                            : ""
                        }
                        disabled={item.tshirt && item.tshirt.stockLevel === 0}
                      />
                      {item.tshirt && item.tshirt.stockLevel === 0 && (
                        <p className="text-xs text-destructive mt-1">
                          Out of stock
                        </p>
                      )}
                    </div>

                    {item.tshirt && (
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Unit Price</p>
                        <p className="font-medium">
                          ${item.tshirt.sellingPrice}
                        </p>
                        <p className="text-sm text-accent">
                          Total: $
                          {(item.tshirt.sellingPrice * item.quantity).toFixed(
                            2,
                          )}
                        </p>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOrderItem(index)}
                      disabled={orderItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5" />
                <h3 className="text-lg font-medium">Order Summary</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(totals.totalSelling)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600">Profit</p>
                  <p className="text-xl font-bold text-accent">
                    {formatCurrency(totals.profit)}
                  </p>
                  <p className="text-xl font-bold text-primary">
                    ${totals.totalSelling.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm text-slate-600">Profit</p>
                  <p className="text-xl font-bold text-accent">
                    ${totals.profit.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={orderData.paymentMethod}
                onValueChange={(value) =>
                  setOrderData({
                    ...orderData,
                    paymentMethod: value as Order["paymentMethod"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select
                value={orderData.paymentStatus}
                onValueChange={(value) =>
                  setOrderData({
                    ...orderData,
                    paymentStatus: value as Order["paymentStatus"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Order Notes (Optional)</Label>
            <Textarea
              value={orderData.notes}
              onChange={(e) =>
                setOrderData({ ...orderData, notes: e.target.value })
              }
              placeholder="Add any special instructions or notes for this order..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || totals.itemCount === 0}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {loading
                ? "Creating Order..."
                : `Create Order (${formatCurrency(totals.totalSelling)})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
