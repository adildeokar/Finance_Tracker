import { useEffect, useState } from 'react';
import api from '../api/axios';

const typeColors = {
  budget_breach: 'bg-red-100 text-red-700',
  budget_warning: 'bg-amber-100 text-amber-700',
  goal_reached: 'bg-green-100 text-green-700',
  bill_due: 'bg-blue-100 text-blue-700',
  insight: 'bg-purple-100 text-purple-700',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  const load = () => api.get('/alerts/').then((res) => setAlerts(res.data));

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.put(`/alerts/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await api.put('/alerts/read-all');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alerts & Insights</h1>
        <button onClick={markAllRead} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Mark All Read</button>
      </div>

      <div className="space-y-3">
        {alerts.map((a) => (
          <div
            key={a.id}
            onClick={() => !a.is_read && markRead(a.id)}
            className={`cursor-pointer rounded-xl border p-4 transition dark:border-slate-800 ${!a.is_read ? 'border-brand/30 bg-brand/5' : 'bg-white dark:bg-slate-900'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[a.type] || ''}`}>{a.type.replace('_', ' ')}</span>
                <p className="mt-2 font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-slate-500">{a.message}</p>
              </div>
              <p className="whitespace-nowrap text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {!alerts.length && <p className="py-12 text-center text-slate-400">No alerts yet. Set budgets and click "Check Budgets" to generate alerts.</p>}
      </div>
    </div>
  );
}
