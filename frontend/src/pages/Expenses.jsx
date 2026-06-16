import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import api from '../api/axios';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], category_id: '', account_id: '', notes: '' });

  const load = () => api.get('/expenses/').then((res) => setExpenses(res.data));

  useEffect(() => {
    load();
    api.get('/categories/').then((res) => setCategories(res.data));
    api.get('/accounts/').then((res) => setAccounts(res.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/expenses/', { ...form, amount: parseFloat(form.amount) });
    setShowForm(false);
    setForm({ title: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], category_id: '', account_id: '', notes: '' });
    load();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this expense?')) {
      await api.delete(`/expenses/${id}`);
      load();
    }
  };

  const exportCsv = () => window.open('http://localhost:8000/expenses/export/csv', '_blank');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">Export CSV</button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">New Transaction</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <option value="">Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <option value="">Account</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
              <th className="p-4">Date</th>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Account</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 dark:border-slate-800">
                <td className="p-4">{e.date}</td>
                <td className="p-4">{e.title}</td>
                <td className="p-4">{e.categories?.name || '—'}</td>
                <td className="p-4">{e.accounts?.name || '—'}</td>
                <td className={`p-4 text-right font-medium ${e.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  ₹{e.amount.toLocaleString()}
                </td>
                <td className="p-4">
                  <button onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
