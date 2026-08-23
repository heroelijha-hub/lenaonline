'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface SalesData {
  date: string;
  amount: number;
}

export default function DashboardChart({ data }: { data: SalesData[] }) {
  // If no data, show a placeholder
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  // Format Y Axis (Currency)
  const formatYAxis = (tickItem: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(tickItem);
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
          <p className="text-sm text-orange-600 font-bold">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          dy={10}
        />
        <YAxis 
          tickFormatter={formatYAxis} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '5 5' }} />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="#f97316" 
          strokeWidth={3}
          dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, fill: '#ea580c', strokeWidth: 0 }}
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
