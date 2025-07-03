import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { TShirt } from "@shared/types";

interface ProductCardProps {
  product: TShirt;
  onEdit: (product: TShirt) => void;
  onDelete: (id: string) => void;
  onAdjustStock: (product: TShirt) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onAdjustStock,
}: ProductCardProps) {
  const getStockStatus = () => {
    if (product.stockLevel === 0) return "out_of_stock";
    if (product.stockLevel <= 8) return "low_stock";
    return "in_stock";
  };

  const getStockBadge = () => {
    const status = getStockStatus();
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

  const profitPerUnit = product.sellingPrice - product.costPrice;
  const totalProfit = profitPerUnit * product.stockLevel;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-slate-600">
              {product.design} • {product.color}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAdjustStock(product)}>
                <Package className="h-4 w-4 mr-2" />
                Adjust Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(product.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Size and Category */}
        <div className="flex gap-2 mb-4">
          <Badge variant="outline">{product.size}</Badge>
          <Badge variant="secondary">{product.category}</Badge>
        </div>

        {/* Stock Status */}
        <div className="mb-4">{getStockBadge()}</div>

        {/* Stock Level */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Current Stock:</span>
            <span
              className={`font-medium ${
                product.stockLevel <= product.minStockLevel
                  ? "text-warning"
                  : ""
              }`}
            >
              {product.stockLevel} units
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Min Stock:</span>
            <span className="text-slate-600">{product.minStockLevel}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Cost:</span>
            <span className="font-medium">${product.costPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Selling:</span>
            <span className="font-medium">${product.sellingPrice}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="text-slate-600">Profit/Unit:</span>
            <span className="font-medium text-accent">
              ${profitPerUnit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Total Values */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-primary/10 rounded">
            <p className="text-xs text-slate-600">Total Value</p>
            <p className="font-semibold text-primary">
              ${(product.stockLevel * product.sellingPrice).toLocaleString()}
            </p>
          </div>
          <div className="p-2 bg-accent/10 rounded">
            <p className="text-xs text-slate-600">Total Profit</p>
            <p className="font-semibold text-accent">
              ${totalProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
