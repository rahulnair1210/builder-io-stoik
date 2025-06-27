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

interface ProfitChartProps {
  data: Array<{
    month: string;
    profit: number;
    revenue: number;
  }>;
}

export function ProfitChart({ data }: ProfitChartProps) {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const formatMonth = (month: string) => {
    const date = new Date(month);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
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
            axisLine={true}
            tickLine={true}
            type="category"
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#64748b"
            fontSize={12}
            axisLine={true}
            tickLine={true}
            type="number"
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
