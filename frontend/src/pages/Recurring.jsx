import { useEffect, useState } from 'react';
import { Plus, Play } from 'lucide-react';
import api from '../api/axios';

export default function Recurring() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', frequency: 'monthly', day_of_month: 1, start_date: new Date().toISOString().split('T')[0], category_id: '', account_id: '' });

  const load = () => api.get('/recurring/').then((res) => setItems(res.data));

  useEffect(() => {
    load();
    api.get('/categories/').then((res) => setCategories(res.data));
    api.get('/accounts/').then((res) => setAccounts(res.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/recurring/', { ...form, amount: parseFloat(form.amount), day_of_month: parseInt(form.day_of_month) });
    setShowForm(false);
    load();
  };

  const applyDue = async () => {
    const res = await api.post('/recurring/apply-due');
    alert(`Applied ${res.data.applied_count} recurring transactions`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring Transactions</h1>
        <div className="flex gap-2">
          <button onClick={applyDue} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm dark:border-slate-700"><Play size={16} /> Apply Due Today</button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white"><Plus size={16} /> Add Recurring</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              {['daily', 'weekly', 'monthly', 'yearly'].map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <input type="number" placeholder="Day of month" value={form.day_of_month} onChange={(e) => setForm({ ...form, day_of_month: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <option value="">Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-slate-500">{r.frequency} · {r.categories?.name || 'No category'}</p>
            </div>
            <p className="font-bold">₹{r.amount.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
