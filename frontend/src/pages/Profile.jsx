import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', currency: 'INR', avatar_color: '#6366f1' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      setProfile(res.data);
      setForm({ name: res.data.name, currency: res.data.currency, avatar_color: res.data.avatar_color });
    });
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    const res = await api.put('/auth/me', form);
    setProfile(res.data);
    setUser({ ...user, ...res.data });
    setMessage('Profile updated!');
  };

  const changePassword = async (e) => {
    e.preventDefault();
    await api.post('/auth/change-password', passwords);
    setPasswords({ current_password: '', new_password: '' });
    setMessage('Password changed!');
  };

  if (!profile) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      <div className="flex items-center gap-4 rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white" style={{ background: profile.avatar_color }}>
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold">{profile.name}</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <p className="text-xs text-slate-400">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Edit Profile</h2>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          {['INR', 'USD', 'EUR', 'GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="color" value={form.avatar_color} onChange={(e) => setForm({ ...form, avatar_color: e.target.value })} className="h-10 w-full rounded-lg" />
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Save Changes</button>
      </form>

      <form onSubmit={changePassword} className="space-y-4 rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Change Password</h2>
        <input type="password" placeholder="Current Password" value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input type="password" placeholder="New Password" value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Update Password</button>
      </form>
    </div>
  );
}
