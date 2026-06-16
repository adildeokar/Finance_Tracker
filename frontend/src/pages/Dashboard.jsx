import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/cards/StatCard';
import SpendingPieChart from '../components/charts/SpendingPieChart';
import TrendAreaChart from '../components/charts/TrendAreaChart';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const now = new Date();

  useEffect(() => {
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    Promise.all([
      api.get('/dashboard/'),
      api.get('/reports/6-month-trend'),
      api.get(`/reports/category-breakdown?month=${month}&year=${year}`),
    ]).then(([dash, trendRes, breakdownRes]) => {
      setData(dash.data);
      setTrend(trendRes.data);
      setBreakdown(breakdownRes.data);
    });
  }, []);

  if (!data) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500">{data.current_month}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Income" value={`₹${data.total_income.toLocaleString()}`} color="green" />
        <StatCard title="Total Expenses" value={`₹${data.total_expenses.toLocaleString()}`} color="red" />
        <StatCard title="Net Savings" value={`₹${data.net_savings.toLocaleString()}`} color="brand" />
        <StatCard title="Savings Rate" value={`${data.savings_rate}%`} subtitle={`${data.transaction_count} transactions`} color="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">6-Month Trend</h2>
          <TrendAreaChart data={trend} />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">Spending by Category</h2>
          <SpendingPieChart data={breakdown} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-semibold">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_transactions.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 dark:border-slate-800">
                  <td className="py-3 pr-4">{t.date}</td>
                  <td className="py-3 pr-4">{t.title}</td>
                  <td className="py-3 pr-4">
                    {t.categories && (
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ background: t.categories.color }} />
                        {t.categories.name}
                      </span>
                    )}
                  </td>
                  <td className={`py-3 text-right font-medium ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
