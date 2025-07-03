import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useCurrency } from "@/context/CurrencyContext";

interface ProfitChartProps {
  data: Array<{
    month: string;
    profit: number;
    revenue: number;
  }>;
}

export function ProfitChart({ data }: ProfitChartProps) {
  const { formatCurrency } = useCurrency();

  const formatMonth = (month: string) => {
    try {
      // Handle both YYYY-MM format and full date strings
      const date =
        month.includes("-") && month.length === 7
          ? new Date(month + "-01")
          : new Date(month);

      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting month:", month, error);
      return month;
    }
  };

  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="text-lg font-medium">No profit data available</p>
          <p className="text-sm mt-1">
            Complete some orders to see profit trends
          </p>
        </div>
      </div>
    );
  }

  // Ensure data is properly formatted
  const validData = data.filter(
    (item) =>
      item.month &&
      typeof item.profit === "number" &&
      typeof item.revenue === "number",
  );

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={validData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(122, 39%, 49%)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(122, 39%, 49%)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(207, 90%, 54%)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(207, 90%, 54%)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="text-sm font-medium text-slate-900">
                      {formatMonth(label)}
                    </p>
                    {payload.map((entry, index) => (
                      <p
                        key={index}
                        className="text-sm"
                        style={{ color: entry.color }}
                      >
                        {entry.name}: {formatCurrency(entry.value as number)}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(207, 90%, 54%)"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="hsl(122, 39%, 49%)"
            strokeWidth={2}
            fill="url(#profitGradient)"
            name="Profit"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
