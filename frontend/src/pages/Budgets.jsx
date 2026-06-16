import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/axios';

export default function Budgets() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [vsActual, setVsActual] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category_id: '', monthly_limit: '', alert_threshold: 80 });

  const load = () => {
    api.get(`/budgets/?month=${month}&year=${year}`).then((res) => setBudgets(res.data));
    api.get(`/reports/budget-vs-actual?month=${month}&year=${year}`).then((res) => setVsActual(res.data));
  };

  useEffect(() => { load(); api.get('/categories/').then((res) => setCategories(res.data)); }, [month, year]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/budgets/', { ...form, monthly_limit: parseFloat(form.monthly_limit), month, year, alert_threshold: parseInt(form.alert_threshold) });
    setShowForm(false);
    load();
  };

  const generateAlerts = () => api.post('/alerts/generate').then(() => alert('Alerts generated!'));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(+e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(+e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={generateAlerts} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Check Budgets</button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white"><Plus size={16} /> Set Budget</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 sm:grid-cols-3">
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <option value="">Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <input type="number" placeholder="Monthly Limit" value={form.monthly_limit} onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })} required className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input type="number" placeholder="Alert at %" value={form.alert_threshold} onChange={(e) => setForm({ ...form, alert_threshold: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vsActual.map((b, i) => {
          const pct = b.percentage_used;
          const color = pct >= 100 ? 'bg-red-500' : pct >= b.alert_threshold ? 'bg-amber-500' : 'bg-green-500';
          return (
            <div key={i} className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <span>{b.category?.icon}</span>
                <span className="font-semibold">{b.category?.name}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">₹{b.actual_spent} / ₹{b.budget_limit}</p>
              <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-400">{pct}% used</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
