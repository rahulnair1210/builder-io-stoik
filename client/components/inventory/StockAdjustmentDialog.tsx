import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Package } from "lucide-react";
import { TShirt } from "@shared/types";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: TShirt;
  onUpdate: (id: string, newStock: number) => void;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  product,
  onUpdate,
}: StockAdjustmentDialogProps) {
  const [newStock, setNewStock] = useState(product.stockLevel);
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"set" | "adjust">("set");

  const handleQuickAdjust = (amount: number) => {
    if (adjustmentType === "adjust") {
      setAdjustment(amount);
      setNewStock(Math.max(0, product.stockLevel + amount));
    } else {
      setNewStock(Math.max(0, amount));
    }
  };

  const handleSubmit = () => {
    onUpdate(product.id, newStock);
    onOpenChange(false);
    setReason("");
    setAdjustment(0);
  };

  const stockDifference = newStock - product.stockLevel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Adjust Stock Level
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900">{product.name}</h3>
            <p className="text-sm text-slate-600">
              {product.design} • {product.color} • Size {product.size}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">Current: {product.stockLevel}</Badge>
              <Badge variant="outline">Min: {product.minStockLevel}</Badge>
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-3">
            <Label>Adjustment Type</Label>
            <div className="flex gap-2">
              <Button
                variant={adjustmentType === "set" ? "default" : "outline"}
                size="sm"
                onClick={() => setAdjustmentType("set")}
              >
                Set Exact Amount
              </Button>
              <Button
                variant={adjustmentType === "adjust" ? "default" : "outline"}
                size="sm"
                onClick={() => setAdjustmentType("adjust")}
              >
                Add/Remove
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Label>Quick Actions</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleQuickAdjust(
                    adjustmentType === "set" ? 0 : -product.stockLevel,
                  )
                }
                className="flex items-center gap-1"
              >
                Clear Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleQuickAdjust(
                    adjustmentType === "set"
                      ? product.minStockLevel
                      : product.minStockLevel - product.stockLevel,
                  )
                }
                className="flex items-center gap-1"
              >
                To Min Level
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleQuickAdjust(
                    adjustmentType === "set"
                      ? product.minStockLevel * 2
                      : product.minStockLevel,
                  )
                }
                className="flex items-center gap-1"
              >
                +
                {adjustmentType === "set"
                  ? product.minStockLevel * 2
                  : product.minStockLevel}
              </Button>
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-3">
            {adjustmentType === "adjust" ? (
              <div className="space-y-2">
                <Label htmlFor="adjustment">Adjustment Amount</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAdj = adjustment - 1;
                      setAdjustment(newAdj);
                      setNewStock(Math.max(0, product.stockLevel + newAdj));
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="adjustment"
                    type="number"
                    value={adjustment}
                    onChange={(e) => {
                      const adj = parseInt(e.target.value) || 0;
                      setAdjustment(adj);
                      setNewStock(Math.max(0, product.stockLevel + adj));
                    }}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAdj = adjustment + 1;
                      setAdjustment(newAdj);
                      setNewStock(Math.max(0, product.stockLevel + newAdj));
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="newStock">New Stock Level</Label>
                <Input
                  id="newStock"
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Current Stock:</span>
              <span className="font-medium">{product.stockLevel}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>New Stock:</span>
              <span className="font-medium">{newStock}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span>Change:</span>
              <span
                className={`font-medium ${
                  stockDifference > 0
                    ? "text-accent"
                    : stockDifference < 0
                      ? "text-destructive"
                      : "text-slate-600"
                }`}
              >
                {stockDifference > 0 ? "+" : ""}
                {stockDifference}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Received new shipment, Damaged items removed, etc."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={newStock === product.stockLevel}
            >
              Update Stock
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
