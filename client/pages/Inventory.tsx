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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Download,
} from "lucide-react";
import { TShirt, FilterOptions, SortOptions } from "@shared/types";
import { Navigation } from "@/components/layout/Navigation";
import { ProductForm } from "@/components/inventory/ProductForm";
import { ProductCard } from "@/components/inventory/ProductCard";
import { StockAdjustmentDialog } from "@/components/inventory/StockAdjustmentDialog";
import { ProductDetailDialog } from "@/components/inventory/ProductDetailDialog";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CATEGORIES = ["Casual", "Formal", "Sports", "Vintage", "Premium"];

export default function Inventory() {
  const [products, setProducts] = useState<TShirt[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOptions>({
    field: "name",
    direction: "asc",
  });
  const [selectedProduct, setSelectedProduct] = useState<TShirt | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters, sort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.search) queryParams.append("search", filters.search);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.size) queryParams.append("size", filters.size);
      if (filters.stockStatus)
        queryParams.append("stockStatus", filters.stockStatus);
      if (sort.field) queryParams.append("sortField", sort.field);
      if (sort.direction) queryParams.append("sortDir", sort.direction);

      const response = await fetch(`/api/inventory?${queryParams}`);
      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleStockUpdate = async (id: string, newStock: number) => {
    const originalProduct = products.find((p) => p.id === id);

    // Update UI immediately for responsive feel
    setProducts(
      products.map((product) =>
        product.id === id
          ? {
              ...product,
              stockLevel: newStock,
              updatedAt: new Date().toISOString(),
            }
          : product,
      ),
    );

    try {
      const response = await fetch(`/api/inventory/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockLevel: newStock }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Stock update failed:", errorData.error);
        // Revert to original state without full refresh
        if (originalProduct) {
          setProducts(products.map((p) => (p.id === id ? originalProduct : p)));
        }
        alert(`Failed to update stock: ${errorData.error}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Update with server response to ensure consistency
        setProducts(
          products.map((p) => (p.id === id ? { ...p, ...data.data } : p)),
        );
      } else {
        console.error("Stock update failed:", data.error);
        // Revert to original state without full refresh
        if (originalProduct) {
          setProducts(products.map((p) => (p.id === id ? originalProduct : p)));
        }
        alert(`Failed to update stock: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      // Revert to original state without full refresh
      if (originalProduct) {
        setProducts(products.map((p) => (p.id === id ? originalProduct : p)));
      }
      alert("Failed to update stock. Please try again.");
    }
  };

  const getStockStatus = (product: TShirt) => {
    if (product.stockLevel === 0) return "out_of_stock";
    if (product.stockLevel <= product.minStockLevel) return "low_stock";
    return "in_stock";
  };

  const getStockBadge = (product: TShirt) => {
    const status = getStockStatus(product);
    switch (status) {
      case "out_of_stock":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Out of Stock
          </Badge>
        );
      case "low_stock":
        return (
          <Badge
            variant="secondary"
            className="bg-warning/20 text-warning flex items-center gap-1"
          >
            <AlertTriangle className="h-3 w-3" />
            Low Stock
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-accent/20 text-accent">
            In Stock
          </Badge>
        );
    }
  };

  const exportInventory = async () => {
    try {
      const response = await fetch("/api/export/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "excel" }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `inventory-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting inventory:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
            <p className="text-slate-600">
              Manage your t-shirt inventory and stock levels
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportInventory}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                fetchProducts();
              }}
            >
              <Package className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setSelectedProduct(null);
                setShowProductForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Dialog
              open={showProductForm}
              onOpenChange={(open) => {
                setShowProductForm(open);
                if (!open) {
                  setSelectedProduct(null);
                }
              }}
            >
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <ProductForm
                  product={selectedProduct}
                  onSubmit={async (data) => {
                    try {
                      if (selectedProduct) {
                        // Edit existing product - update UI immediately
                        const updatedProduct = {
                          ...selectedProduct,
                          ...data,
                          updatedAt: new Date().toISOString(),
                        };
                        setProducts(
                          products.map((p) =>
                            p.id === selectedProduct.id ? updatedProduct : p,
                          ),
                        );
                        setShowProductForm(false);
                        setSelectedProduct(null);

                        // Then sync with server
                        const response = await fetch(
                          `/api/inventory/${selectedProduct.id}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(data),
                          },
                        );

                        if (!response.ok) {
                          // Revert on failure
                          setProducts(
                            products.map((p) =>
                              p.id === selectedProduct.id ? selectedProduct : p,
                            ),
                          );
                          alert("Failed to update product. Changes reverted.");
                          return;
                        }

                        const result = await response.json();
                        if (result.success) {
                          // Update with server response
                          setProducts(
                            products.map((p) =>
                              p.id === selectedProduct.id ? result.data : p,
                            ),
                          );
                        } else {
                          // Revert on failure
                          setProducts(
                            products.map((p) =>
                              p.id === selectedProduct.id ? selectedProduct : p,
                            ),
                          );
                          alert("Failed to update product. Changes reverted.");
                        }
                      } else {
                        // Create new product
                        const response = await fetch("/api/inventory", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(data),
                        });
                        const result = await response.json();
                        if (result.success) {
                          setProducts([result.data, ...products]);
                          setShowProductForm(false);
                        } else {
                          alert("Failed to create product. Please try again.");
                        }
                      }
                    } catch (error) {
                      console.error("Error saving product:", error);
                      alert("Failed to save product. Please try again.");

                      // If it was an edit, revert to original
                      if (selectedProduct) {
                        setProducts(
                          products.map((p) =>
                            p.id === selectedProduct.id ? selectedProduct : p,
                          ),
                        );
                      }
                    }
                  }}
                  onCancel={() => {
                    setShowProductForm(false);
                    setSelectedProduct(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={filters.search || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>
              </div>
              <Select
                value={filters.category || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    category: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.size || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    size: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.stockStatus || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    stockStatus: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold">{products.length}</p>
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
                    Total Value
                  </p>
                  <p className="text-2xl font-bold">
                    $
                    {products
                      .reduce(
                        (sum, p) => sum + p.stockLevel * p.sellingPrice,
                        0,
                      )
                      .toLocaleString()}
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
                    Low Stock
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      products.filter(
                        (p) =>
                          p.stockLevel <= p.minStockLevel && p.stockLevel > 0,
                      ).length
                    }
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-bold">
                    {products.filter((p) => p.stockLevel === 0).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Products</CardTitle>
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
              <div className="text-center py-8">Loading products...</div>
            ) : viewMode === "table" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-slate-600">
                            {product.design} • {product.color}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.size}</Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            product.stockLevel <= product.minStockLevel
                              ? "text-warning"
                              : ""
                          }`}
                        >
                          {product.stockLevel}
                        </span>
                      </TableCell>
                      <TableCell>${product.costPrice}</TableCell>
                      <TableCell>${product.sellingPrice}</TableCell>
                      <TableCell className="text-accent font-medium">
                        $
                        {(
                          (product.sellingPrice - product.costPrice) *
                          product.stockLevel
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStockBadge(product)}</TableCell>
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
                                setSelectedProduct(product);
                                setShowStockDialog(true);
                              }}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Adjust Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowProductForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={(product) => {
                      setSelectedProduct(product);
                      setShowProductForm(true);
                    }}
                    onDelete={handleDeleteProduct}
                    onAdjustStock={(product) => {
                      setSelectedProduct(product);
                      setShowStockDialog(true);
                    }}
                    onViewDetails={(product) => {
                      setSelectedProduct(product);
                      setShowDetailDialog(true);
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Adjustment Dialog */}
        {selectedProduct && (
          <StockAdjustmentDialog
            open={showStockDialog}
            onOpenChange={setShowStockDialog}
            product={selectedProduct}
            onUpdate={handleStockUpdate}
          />
        )}

        {/* Product Detail Dialog */}
        <ProductDetailDialog
          product={selectedProduct}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          onEdit={(product) => {
            setShowDetailDialog(false);
            setSelectedProduct(product);
            setShowProductForm(true);
          }}
          onDelete={handleDeleteProduct}
        />
      </div>
    </div>
  );
}
