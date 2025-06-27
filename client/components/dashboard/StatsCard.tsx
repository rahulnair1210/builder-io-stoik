import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className = "",
}: StatsCardProps) {
  const isPositiveTrend = trend !== undefined && trend > 0;
  const isNegativeTrend = trend !== undefined && trend < 0;

  return (
    <Card
      className={`hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center space-x-1">
                {isPositiveTrend ? (
                  <TrendingUp className="h-3 w-3 text-accent" />
                ) : isNegativeTrend ? (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                ) : null}
                <span
                  className={`text-xs font-medium ${
                    isPositiveTrend
                      ? "text-accent"
                      : isNegativeTrend
                        ? "text-destructive"
                        : "text-slate-600"
                  }`}
                >
                  {trend > 0 ? "+" : ""}
                  {trend.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl">
            <Icon className="h-6 w-6 text-slate-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
