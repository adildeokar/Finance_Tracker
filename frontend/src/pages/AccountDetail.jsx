import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get(`/accounts/${id}`).then((res) => setAccount(res.data));
    api.get(`/accounts/${id}/transactions`).then((res) => setTransactions(res.data));
  }, [id]);

  if (!account) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <Link to="/accounts" className="text-sm text-brand hover:underline">← Back to Accounts</Link>
      <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">{account.name}</h1>
        <p className="text-slate-500">{account.type.replace('_', ' ')}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div><p className="text-sm text-slate-500">Balance</p><p className="text-xl font-bold">₹{(account.current_balance || 0).toLocaleString()}</p></div>
          <div><p className="text-sm text-slate-500">Monthly Spend</p><p className="text-xl font-bold text-expense">₹{account.monthly_spend?.toLocaleString()}</p></div>
          <div><p className="text-sm text-slate-500">Monthly Income</p><p className="text-xl font-bold text-income">₹{account.monthly_income?.toLocaleString()}</p></div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b p-4 font-semibold dark:border-slate-800">Transaction History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500 dark:border-slate-800">
              <th className="p-4">Date</th><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b dark:border-slate-800">
                <td className="p-4">{t.date}</td>
                <td className="p-4">{t.title}</td>
                <td className="p-4">{t.categories?.name || '—'}</td>
                <td className={`p-4 text-right font-medium ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>₹{t.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
