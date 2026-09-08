import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LogOut, Package, ShoppingCart } from 'lucide-react';
import tbsLogo from '@/assets/tbs_logo_transparent.png';
import { useAuthStore } from '@/lib/auth/AuthStore';
import { api } from '@/services/api';

export default function StoreLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: api.cart,
    enabled: isAuthenticated,
  });

  const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={tbsLogo} alt="TBS — Trainers by Sport" className="h-10 object-contain" />
            <span className="text-lg font-bold text-ink-900">Store</span>
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium">
            {isAuthenticated && (
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  isActive ? 'text-brand-600' : 'text-gray-600 hover:text-ink-900'
                }
              >
                <span className="inline-flex items-center gap-1"><Package size={16} /> Orders</span>
              </NavLink>
            )}

            <NavLink to="/cart" className="relative text-gray-600 hover:text-ink-900">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>

            {isAuthenticated && user ? (
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-ink-900"
                title={`Logged in as ${user.firstName}`}
              >
                <LogOut size={16} /> {user.firstName}
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
        TBS Store — every purchase supports your trainer directly (they keep 97%).
      </footer>
    </div>
  );
}
