import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TrendAreaChart({ data = [] }) {
  if (!data.length) {
    return <p className="py-12 text-center text-slate-400">No trend data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
        <Legend />
        <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
        <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
        <Area type="monotone" dataKey="savings" stackId="3" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
