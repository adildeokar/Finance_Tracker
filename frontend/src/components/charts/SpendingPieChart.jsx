import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SpendingPieChart({ data = [] }) {
  if (!data.length) {
    return <p className="py-12 text-center text-slate-400">No data for this period</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color || '#6366f1'} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
        <Legend formatter={(v, entry) => `${entry.payload.icon || ''} ${v} (${entry.payload.percentage}%)`} />
      </PieChart>
    </ResponsiveContainer>
  );
}
