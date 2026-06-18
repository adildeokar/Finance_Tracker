import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_DOCS_URL = import.meta.env.DEV
  ? 'http://localhost:8000/docs'
  : 'https://finance-tracker-pi-wheat.vercel.app/docs';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const status = err.response?.status;
      if (detail) {
        setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
      } else if (status === 404) {
        setError('API not found (404). Redeploy frontend and clear browser cache.');
      } else if (!err.response) {
        setError('Cannot reach API server. Check backend deployment and CORS settings.');
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">💰 Finance Tracker</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage your finances</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-white px-3 text-slate-400 dark:bg-slate-900">Developer</span>
          </div>
        </div>

        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-700 transition hover:border-brand hover:bg-indigo-50 hover:text-brand dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-brand dark:hover:bg-indigo-950/40 dark:hover:text-brand-light"
        >
          <BookOpen size={16} className="shrink-0" />
          <span>API Swagger Docs</span>
          <ExternalLink size={14} className="shrink-0 opacity-50" />
        </a>

        <p className="mt-4 text-center text-sm text-slate-500">
          No account? <Link to="/register" className="text-brand hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
