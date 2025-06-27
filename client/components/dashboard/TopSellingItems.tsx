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

  return (
    <div className="space-y-4">
      {items.slice(0, 5).map((item, index) => (
        <div
          key={item.tshirt.id}
          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                #{index + 1}
              </span>
            </div>
            <div>
              <p className="font-medium text-slate-900">{item.tshirt.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {item.tshirt.size}
                </Badge>
                <span className="text-xs text-slate-600">
                  {item.tshirt.color}
                </span>
                <span className="text-xs text-slate-600">•</span>
                <span className="text-xs text-slate-600">
                  {item.tshirt.category}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-slate-900">
              {item.quantitySold} sold
            </p>
            <p className="text-sm text-accent font-medium">
              ${item.revenue.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
