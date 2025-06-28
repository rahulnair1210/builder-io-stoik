import { Badge } from "@/components/ui/badge";
import { TShirt } from "@shared/types";

interface TopSellingItemsProps {
  items: Array<{
    tshirt: TShirt;
    quantitySold: number;
    revenue: number;
  }>;
}

export function TopSellingItems({ items }: TopSellingItemsProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No sales data available
      </div>
    );
  }

  // Filter out items with invalid data
  const validItems = items.filter((item) => item && typeof item === "object");

  return (
    <div className="space-y-4">
      {validItems.slice(0, 5).map((item, index) => {
        // Handle cases where tshirt might be undefined
        const tshirt = item.tshirt || {};
        const name = tshirt.name || "Unknown Product";
        const size = tshirt.size || "N/A";
        const color = tshirt.color || "N/A";
        const category = tshirt.category || "N/A";
        const id = tshirt.id || `item-${index}`;

        return (
          <div
            key={id}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  #{index + 1}
                </span>
              </div>
              <div>
                <p className="font-medium text-slate-900">{name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {size}
                  </Badge>
                  <span className="text-xs text-slate-600">{color}</span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs text-slate-600">{category}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-slate-900">
                {item.quantitySold || 0} sold
              </p>
              <p className="text-sm text-accent font-medium">
                ${(item.revenue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
