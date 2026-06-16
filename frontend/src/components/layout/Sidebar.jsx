import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, Wallet, Target, Repeat, Flag,
  BarChart3, Tags, Bell, User, LogOut, Moon, Sun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/accounts', icon: Wallet, label: 'Accounts' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
  { to: '/recurring', icon: Repeat, label: 'Recurring' },
  { to: '/goals', icon: Flag, label: 'Goals' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();

  return (
    <aside className="flex w-60 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-800 p-5">
        <h1 className="text-lg font-bold">💰 Finance Tracker</h1>
        {user && <p className="mt-1 truncate text-xs text-slate-400">{user.email}</p>}
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive ? 'bg-brand text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-slate-800 p-3">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-slate-800"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
