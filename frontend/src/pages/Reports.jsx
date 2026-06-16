import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/cards/StatCard';
import SpendingPieChart from '../components/charts/SpendingPieChart';
import TrendAreaChart from '../components/charts/TrendAreaChart';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';

const tabs = ['Summary', 'Categories', 'Budget vs Actual', 'Trends', 'Accounts', 'Merchants'];

export default function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState('Summary');
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [budgetVs, setBudgetVs] = useState([]);
  const [trend, setTrend] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    api.get(`/reports/monthly-summary?month=${month}&year=${year}`).then((res) => setSummary(res.data));
    api.get(`/reports/category-breakdown?month=${month}&year=${year}`).then((res) => setBreakdown(res.data));
    api.get(`/reports/budget-vs-actual?month=${month}&year=${year}`).then((res) => setBudgetVs(res.data));
    api.get('/reports/6-month-trend').then((res) => setTrend(res.data));
    api.get(`/reports/account-breakdown?month=${month}&year=${year}`).then((res) => setAccounts(res.data));
    api.get(`/reports/top-merchants?month=${month}&year=${year}`).then((res) => setMerchants(res.data));
  }, [month, year]);

  const budgetChartData = budgetVs.map((b) => ({
    name: b.category?.name || 'Unknown',
    budget_limit: b.budget_limit,
    actual_spent: b.actual_spent,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(+e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(+e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm ${tab === t ? 'bg-brand text-white' : 'border dark:border-slate-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Summary' && summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Income" value={`₹${summary.total_income.toLocaleString()}`} color="green" />
          <StatCard title="Expenses" value={`₹${summary.total_expenses.toLocaleString()}`} color="red" />
          <StatCard title="Net Savings" value={`₹${summary.net_savings.toLocaleString()}`} color="brand" />
          <StatCard title="Savings Rate" value={`${summary.savings_rate}%`} subtitle={`${summary.transaction_count} transactions`} color="amber" />
        </div>
      )}

      {tab === 'Categories' && (
        <div className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <SpendingPieChart data={breakdown} />
        </div>
      )}

      {tab === 'Budget vs Actual' && (
        <div className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <MonthlyBarChart data={budgetChartData} />
        </div>
      )}

      {tab === 'Trends' && (
        <div className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <TrendAreaChart data={trend} />
        </div>
      )}

      {tab === 'Merchants' && (
        <div className="rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500 dark:border-slate-800">
                <th className="p-4">Merchant</th><th className="p-4">Count</th><th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m, i) => (
                <tr key={i} className="border-b dark:border-slate-800">
                  <td className="p-4">{m.title}</td>
                  <td className="p-4">{m.count}</td>
                  <td className="p-4 text-right font-medium">₹{m.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
