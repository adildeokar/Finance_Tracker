import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/axios';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', target_amount: '', target_date: '', icon: '🎯', color: '#22c55e' });

  const load = () => api.get('/goals/').then((res) => setGoals(res.data));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/goals/', { ...form, target_amount: parseFloat(form.target_amount), target_date: form.target_date || null });
    setShowForm(false);
    load();
  };

  const contribute = async (id) => {
    const amount = prompt('Contribution amount:');
    if (amount) {
      await api.post(`/goals/${id}/contribute`, { amount: parseFloat(amount) });
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Financial Goals</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white"><Plus size={16} /> New Goal</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Goal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input type="number" placeholder="Target Amount" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} required className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((g) => (
          <div key={g.id} className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{g.icon}</span>
              <div>
                <p className="font-semibold">{g.title}</p>
                {g.is_completed && <span className="text-xs text-income">✅ Completed</span>}
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">₹{g.current_amount.toLocaleString()} / ₹{g.target_amount.toLocaleString()}</p>
            <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${g.progress_percentage}%`, background: g.color }} />
            </div>
            <p className="mt-1 text-xs text-slate-400">{g.progress_percentage}% complete</p>
            {!g.is_completed && (
              <button onClick={() => contribute(g.id)} className="mt-3 rounded-lg bg-brand px-3 py-1.5 text-xs text-white">Contribute</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
