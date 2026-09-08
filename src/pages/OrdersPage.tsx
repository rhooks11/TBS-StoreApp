import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Download, Gift, Package } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/lib/auth/AuthStore';
import type { OrderStatus } from '@/types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Paid: 'bg-blue-100 text-blue-800',
  Fulfilled: 'bg-green-100 text-green-800',
  Refunded: 'bg-gray-100 text-gray-500',
  Cancelled: 'bg-gray-100 text-gray-500',
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: api.orders,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <p className="py-20 text-center text-gray-500">
        <Link to="/login" className="text-brand-600 hover:underline">Log in</Link> to see your orders.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-ink-900">My Orders</h1>

      {isLoading ? (
        <p className="py-16 text-center text-gray-500">Loading…</p>
      ) : orders?.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()} · #{order.id.slice(0, 8)}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 text-ink-900">
                      {item.qty}× {item.name}
                    </span>
                    <span className="text-gray-500">
                      ${(item.unitPrice * item.qty).toFixed(2)}
                    </span>

                    {item.trackingNumber && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <Package size={13} /> {item.trackingNumber}
                      </span>
                    )}
                    {item.giftCertificateCode && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 font-mono text-xs font-bold text-brand-700">
                        <Gift size={13} /> {item.giftCertificateCode}
                      </span>
                    )}
                    {item.digitalFileUrl && (
                      <a
                        href={item.digitalFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        <Download size={13} /> Download
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 text-right font-bold text-ink-900">
                Total: {order.currency} {order.subtotal.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 p-16 text-center text-gray-500">
          No orders yet. <Link to="/" className="text-brand-600 hover:underline">Start shopping</Link>.
        </div>
      )}
    </div>
  );
}
