import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../api/axios';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'savings', color: '#6366f1', last_four: '', credit_limit: '', current_balance: 0 });

  const load = () => api.get('/accounts/').then((res) => setAccounts(res.data));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = { ...form, credit_limit: form.credit_limit ? parseFloat(form.credit_limit) : null, current_balance: parseFloat(form.current_balance) || 0 };
    await api.post('/accounts/', payload);
    setShowForm(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Accounts</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white">
          <Plus size={16} /> Add Account
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Account Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              {['credit_card', 'savings', 'debit_card', 'wallet', 'cash'].map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
            <input placeholder="Last 4 digits" value={form.last_four} onChange={(e) => setForm({ ...form, last_four: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 rounded-lg border dark:border-slate-700" />
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => (
          <Link
            key={a.id}
            to={`/accounts/${a.id}`}
            className="block rounded-xl p-5 text-white shadow-lg transition hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}99)` }}
          >
            <p className="text-xs uppercase opacity-80">{a.type.replace('_', ' ')}</p>
            <p className="mt-2 text-lg font-bold">{a.name}</p>
            {a.last_four && <p className="mt-4 font-mono text-sm">•••• {a.last_four}</p>}
            <p className="mt-4 text-2xl font-bold">₹{(a.current_balance || 0).toLocaleString()}</p>
            {a.credit_limit && <p className="mt-1 text-xs opacity-80">Limit: ₹{a.credit_limit.toLocaleString()}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
