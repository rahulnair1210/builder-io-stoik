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
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
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
    { tshirtId: "", size: "M", quantity: 1 },
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
      // Also force refresh after initial load
      const timer = setTimeout(() => {
        console.log("Force refreshing products after dialog open...");
        fetchProducts();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    setSelectedCustomer(customer);
  }, [customer]);

  const fetchProducts = async () => {
    try {
      console.log("Fetching products for order form...");
      const response = await fetch("/api/inventory");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched products:", data.data?.length || 0, "items");
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Don't clear products on error to maintain existing state
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

  // Calculate allocated stock for a specific product and size in current order
  const getAllocatedStock = useCallback(
    (productId: string, size: "XS" | "S" | "M" | "L" | "XL" | "XXL") => {
      return orderItems
        .filter((item) => item.tshirtId === productId && item.size === size)
        .reduce((sum, item) => sum + item.quantity, 0);
    },
    [orderItems],
  );

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
            // Reset size when product changes
            size: "M",
            quantity: 1,
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
    setOrderItems((prev) => [
      ...prev,
      { tshirtId: "", size: "M", quantity: 1 },
    ]);
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
      size: item.size,
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
      setOrderItems([{ tshirtId: "", size: "M", quantity: 1 }]);
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

            {orderItems.map((item, index) => {
              const selectedProduct = item.tshirt;
              // Calculate available stock minus already allocated in current order (excluding current item)
              const getAvailableStock = (sizeStock: any) => {
                const allocatedInOtherItems = orderItems
                  .filter(
                    (otherItem, otherIndex) =>
                      otherIndex !== index &&
                      otherItem.tshirtId === item.tshirtId &&
                      otherItem.size === sizeStock.size,
                  )
                  .reduce((sum, otherItem) => sum + otherItem.quantity, 0);
                return Math.max(
                  0,
                  sizeStock.stockLevel - allocatedInOtherItems,
                );
              };

              const availableSizes =
                selectedProduct?.sizeStocks
                  ?.map((ss) => ({
                    ...ss,
                    availableStock: getAvailableStock(ss),
                  }))
                  .filter((ss) => ss.availableStock > 0) || [];

              const selectedSizeStock = selectedProduct?.sizeStocks?.find(
                (ss) => ss.size === item.size,
              );
              const maxQuantity = selectedSizeStock
                ? getAvailableStock(selectedSizeStock)
                : 0;

              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Product Selection */}
                      <div className="col-span-2">
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
                              .map((product) => {
                                const totalStock =
                                  product.sizeStocks?.reduce(
                                    (sum, ss) => sum + ss.stockLevel,
                                    0,
                                  ) ||
                                  product.stockLevel ||
                                  0;
                                return (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}
                                    disabled={totalStock === 0}
                                  >
                                    <div className="flex items-center gap-2">
                                      {product.name} - {product.color}
                                      <Badge variant="outline">
                                        ${product.sellingPrice}
                                      </Badge>
                                      <Badge
                                        variant={
                                          totalStock > 0
                                            ? "secondary"
                                            : "destructive"
                                        }
                                      >
                                        {totalStock === 0
                                          ? "Out of Stock"
                                          : `${totalStock} total`}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Size Selection */}
                      <div>
                        <Label>Size</Label>
                        <Select
                          value={item.size}
                          onValueChange={(value) =>
                            handleItemChange(index, "size", value)
                          }
                          disabled={!selectedProduct}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Size" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSizes.map((sizeStock) => (
                              <SelectItem
                                key={sizeStock.size}
                                value={sizeStock.size}
                                disabled={sizeStock.availableStock === 0}
                              >
                                <div className="flex items-center gap-2">
                                  {sizeStock.size}
                                  <Badge
                                    variant={
                                      sizeStock.availableStock > 0
                                        ? "outline"
                                        : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {sizeStock.availableStock > 0
                                      ? `${sizeStock.availableStock} available`
                                      : "No stock left"}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                            {/* Show all sizes with their status for better visibility */}
                            {selectedProduct?.sizeStocks
                              ?.filter(
                                (ss) =>
                                  !availableSizes.find(
                                    (avail) => avail.size === ss.size,
                                  ),
                              )
                              .map((sizeStock) => (
                                <SelectItem
                                  key={sizeStock.size}
                                  value={sizeStock.size}
                                  disabled={true}
                                >
                                  <div className="flex items-center gap-2">
                                    {sizeStock.size}
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      {sizeStock.stockLevel > 0
                                        ? "Already allocated"
                                        : "Out of stock"}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          max={maxQuantity}
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            if (value > maxQuantity) {
                              const allocatedElsewhere =
                                getAllocatedStock(item.tshirtId, item.size) -
                                item.quantity;
                              const totalStock =
                                selectedSizeStock?.stockLevel || 0;
                              alert(
                                `Only ${maxQuantity} units available for size ${item.size}. Total stock: ${totalStock}, already allocated in this order: ${allocatedElsewhere}`,
                              );
                              return;
                            }
                            handleItemChange(index, "quantity", value);
                          }}
                          className={
                            maxQuantity === 0
                              ? "border-destructive bg-destructive/10"
                              : ""
                          }
                          disabled={!selectedProduct || maxQuantity === 0}
                        />
                        {selectedProduct && maxQuantity === 0 && (
                          <p className="text-xs text-destructive mt-1">
                            Size unavailable
                          </p>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-end justify-between">
                        {selectedProduct && (
                          <div className="text-right">
                            <p className="text-xs text-slate-600">Total</p>
                            <p className="font-medium">
                              $
                              {(
                                selectedProduct.sellingPrice * item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOrderItem(index)}
                          disabled={orderItems.length === 1}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quantity Validation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">
                    Bulk Order Validation
                  </h4>
                  <p className="text-sm text-slate-600">
                    Total Quantity: {totals.totalQuantity} items
                  </p>
                </div>
                <div>
                  {totals.totalQuantity >= 20 ? (
                    <Badge className="bg-green-100 text-green-800">
                      ✓ Qualifies as Bulk Order
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-orange-700 border-orange-200"
                    >
                      ⚠ Need {20 - totals.totalQuantity} more for bulk
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5" />
                <h3 className="text-lg font-medium">Order Summary</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(totals.totalSelling)}
                  </p>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm text-slate-600">Profit</p>
                  <p className="text-xl font-bold text-accent">
                    {formatCurrency(totals.profit)}
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Items</p>
                  <p className="text-xl font-bold text-slate-900">
                    {totals.totalQuantity}
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
            <Button
              type="submit"
              disabled={loading || totals.totalQuantity === 0}
            >
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
