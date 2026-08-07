import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';

const navItems = [
  { to: '/admin', label: 'الإحصائيات', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'المنتجات', icon: Package },
  { to: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
  { to: '/admin/customers', label: 'العملاء', icon: Users },
];

export default function AdminLayout() {
  const { isAuthenticated, initializing, admin, logout } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="grid md:grid-cols-[240px_1fr] min-h-[85vh]">
      <aside className="border-e border-ink/10 dark:border-ink-dark/10 p-5">
        <Link to="/" className="font-display font-bold text-lg block mb-8">
          FIELD<span className="text-pine-600">GOODS</span>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded ${
                  isActive ? 'bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark' : 'hover:bg-ink/5 dark:hover:bg-ink-dark/5'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-10 pt-5 border-t border-ink/10 dark:border-ink-dark/10">
          <p className="text-xs text-ink/50 mb-2">{admin?.email}</p>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-rust-500 hover:underline">
            <LogOut size={15} /> تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="p-6 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
