import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';

const EMOJIS = ['💸', '🍔', '🚗', '🏠', '💊', '🎮', '📚', '✈️', '👕', '🎯', '💰', '🛒'];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [palette, setPalette] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', color: '#6366f1', icon: '💸', type: 'expense' });

  const load = () => api.get('/categories/').then((res) => setCategories(res.data));

  useEffect(() => {
    load();
    api.get('/categories/palette').then((res) => setPalette(res.data.colours));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/categories/', form);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete category?')) {
      await api.delete(`/categories/${id}`);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white"><Plus size={16} /> Add Category</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <input placeholder="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mb-3 w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
          <p className="mb-2 text-sm text-slate-500">Pick a colour</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {palette.map((c) => (
              <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`h-8 w-8 rounded-full border-2 ${form.color === c ? 'border-white ring-2 ring-brand' : 'border-transparent'}`} style={{ background: c }} />
            ))}
          </div>
          <p className="mb-2 text-sm text-slate-500">Pick an icon</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setForm({ ...form, icon: e })} className={`rounded-lg p-2 text-xl ${form.icon === e ? 'bg-brand/20 ring-2 ring-brand' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{e}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-lg" style={{ background: c.color + '33' }}>{c.icon}</span>
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-slate-400">{c.type}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-red-400"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
