export default function StatCard({ title, value, subtitle, color = 'brand' }) {
  const colors = {
    brand: 'bg-indigo-50 text-brand dark:bg-indigo-950',
    green: 'bg-green-50 text-income dark:bg-green-950',
    red: 'bg-red-50 text-expense dark:bg-red-950',
    amber: 'bg-amber-50 text-warning dark:bg-amber-950',
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${colors[color]?.split(' ')[1] || 'text-brand'}`}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
