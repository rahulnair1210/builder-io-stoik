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
            allowDecimals={true}
            allowDuplicatedCategory={true}
            angle={0}
            hide={false}
            includeHidden={false}
            mirror={false}
            orientation="bottom"
            reversed={false}
            scale="auto"
            tickMargin={5}
            unit=""
            interval="preserveStartEnd"
            minTickGap={5}
            padding={{ left: 0, right: 0 }}
            tick={{ fontSize: 12 }}
            tickSize={6}
            width={0}
            height={30}
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#64748b"
            fontSize={12}
            axisLine={true}
            tickLine={true}
            type="number"
            allowDecimals={true}
            allowDuplicatedCategory={true}
            angle={0}
            hide={false}
            includeHidden={false}
            mirror={false}
            orientation="left"
            reversed={false}
            scale="auto"
            tickMargin={5}
            unit=""
            yAxisId={0}
            interval="preserveStartEnd"
            minTickGap={5}
            padding={{ top: 0, bottom: 0 }}
            tick={{ fontSize: 12 }}
            tickSize={6}
            width={60}
            height={0}
            domain={["auto", "auto"]}
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
