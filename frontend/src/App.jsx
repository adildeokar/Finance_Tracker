import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/layout/PrivateRoute';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import Budgets from './pages/Budgets';
import Recurring from './pages/Recurring';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';

const Layout = ({ children }) => (
  <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-6">{children}</main>
  </div>
);

const protectedRoutes = [
  ['/', Dashboard],
  ['/expenses', Expenses],
  ['/accounts', Accounts],
  ['/accounts/:id', AccountDetail],
  ['/budgets', Budgets],
  ['/recurring', Recurring],
  ['/goals', Goals],
  ['/reports', Reports],
  ['/categories', Categories],
  ['/alerts', Alerts],
  ['/profile', Profile],
];

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {protectedRoutes.map(([path, Page]) => (
              <Route
                key={path}
                path={path}
                element={
                  <PrivateRoute>
                    <Layout>
                      <Page />
                    </Layout>
                  </PrivateRoute>
                }
              />
            ))}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
