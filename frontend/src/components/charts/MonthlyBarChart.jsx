import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function MonthlyBarChart({ data = [], keys = ['budget_limit', 'actual_spent'], labels = ['Budget', 'Actual'] }) {
  if (!data.length) {
    return <p className="py-12 text-center text-slate-400">No data for this period</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
        <Legend />
        <Bar dataKey={keys[0]} name={labels[0]} fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey={keys[1]} name={labels[1]} fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
