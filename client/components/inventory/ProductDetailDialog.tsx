import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Tag,
  DollarSign,
  Calendar,
  Palette,
  Shirt,
  BarChart3,
  Edit,
  Trash2,
} from "lucide-react";
import { TShirt } from "@shared/types";
import { useCurrency } from "@/context/CurrencyContext";

interface ProductDetailDialogProps {
  product: TShirt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: TShirt) => void;
  onDelete: (id: string) => void;
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ProductDetailDialogProps) {
  const { formatCurrency } = useCurrency();

  if (!product) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalStock = () => {
    if (product.sizeStocks && product.sizeStocks.length > 0) {
      return product.sizeStocks.reduce((sum, ss) => sum + ss.stockLevel, 0);
    }
    return product.stockLevel || 0;
  };

  const getStockStatus = (stockLevel: number) => {
    if (stockLevel === 0) return "out_of_stock";
    if (stockLevel <= 8) return "low_stock";
    return "in_stock";
  };

  const getStatusBadge = (stockLevel: number) => {
    const status = getStockStatus(stockLevel);
    switch (status) {
      case "out_of_stock":
        return (
          <Badge variant="destructive" className="text-xs">
            Out of Stock
          </Badge>
        );
      case "low_stock":
        return (
          <Badge
            variant="secondary"
            className="bg-warning/20 text-warning text-xs"
          >
            Low Stock
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            In Stock
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
                    )
                  ) {
                    onDelete(product.id);
                    onOpenChange(false);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {product.name}
                    </h3>
                    <p className="text-slate-600">{product.design}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">Color:</span>
                      <Badge variant="outline">{product.color}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">Category:</span>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">Cost:</span>
                      <span className="font-medium">
                        {formatCurrency(product.costPrice)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">Selling:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-slate-500">
                      Profit Margin:
                    </span>
                    <span className="ml-2 font-medium text-accent">
                      {formatCurrency(product.sellingPrice - product.costPrice)}{" "}
                      (
                      {(
                        ((product.sellingPrice - product.costPrice) /
                          product.sellingPrice) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm text-slate-600">
                      {formatDate(product.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Updated:</span>
                    <span className="text-sm text-slate-600">
                      {formatDate(product.updatedAt)}
                    </span>
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-slate-500 block mb-2">
                        Tags:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Stock Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.sizeStocks && product.sizeStocks.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {product.sizeStocks.map((sizeStock) => (
                      <div
                        key={sizeStock.size}
                        className="text-center p-4 border border-slate-200 rounded-lg"
                      >
                        <div className="text-lg font-bold text-slate-900 mb-1">
                          {sizeStock.size}
                        </div>
                        <div className="text-2xl font-bold text-primary mb-1">
                          {sizeStock.stockLevel}
                        </div>
                        <div className="text-xs text-slate-500 mb-2">
                          Min: {sizeStock.minStockLevel}
                        </div>
                        {getStatusBadge(sizeStock.stockLevel)}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-slate-500">
                          Total Stock
                        </div>
                        <div className="text-xl font-bold text-primary">
                          {getTotalStock()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">
                          Total Value
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(
                            getTotalStock() * product.sellingPrice,
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Cost Value</div>
                        <div className="text-xl font-bold text-slate-600">
                          {formatCurrency(getTotalStock() * product.costPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {product.stockLevel || 0}
                  </div>
                  <div className="text-sm text-slate-500 mb-2">
                    Stock Level (Min: {product.minStockLevel || 0})
                  </div>
                  {getStatusBadge(product.stockLevel || 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
