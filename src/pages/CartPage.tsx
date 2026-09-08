import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/lib/auth/AuthStore';
import StripePaymentModal from '@/components/StripePaymentModal';

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [shippingAddress, setShippingAddress] = useState('');
  const [clientSecrets, setClientSecrets] = useState<string[] | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: api.cart,
    enabled: isAuthenticated,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const update = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => api.updateCartItem(id, qty),
    onSuccess: refresh,
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not update the cart.';
      toast.error(msg);
    },
  });

  const remove = useMutation({
    mutationFn: api.removeCartItem,
    onSuccess: refresh,
  });

  const checkout = useMutation({
    mutationFn: () => api.checkout(shippingAddress.trim() || undefined),
    onSuccess: ({ order, clientSecrets: secrets }) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (secrets.length > 0) {
        // Live Stripe mode — one confirmation per selling trainer
        setPlacedOrderId(order.id);
        setClientSecrets(secrets);
      } else {
        toast.success('Order placed — thank you!');
        navigate('/orders', { state: { highlight: order.id } });
      }
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Checkout failed.';
      toast.error(msg);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingCart className="mx-auto mb-4 text-gray-300" size={48} />
        <p className="text-gray-600">
          <Link to="/login" className="text-brand-600 hover:underline">Log in</Link> or{' '}
          <Link to="/register" className="text-brand-600 hover:underline">create a free store account</Link>{' '}
          to shop.
        </p>
      </div>
    );
  }

  const total = cart?.reduce((sum, item) => sum + item.lineTotal, 0) ?? 0;
  const hasPhysical = cart?.some((item) => item.type === 'Physical') ?? false;
  const currency = cart?.[0]?.currency ?? 'USD';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-ink-900">Your Cart</h1>

      {isLoading ? (
        <p className="py-16 text-center text-gray-500">Loading…</p>
      ) : cart?.length ? (
        <>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-ink-900">{item.name}</div>
                  {item.trainerFirstName && (
                    <div className="text-sm text-gray-500">
                      by {item.trainerFirstName} {item.trainerLastName}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => update.mutate({ id: item.id, qty: item.qty - 1 })}
                    className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                  <button
                    onClick={() => update.mutate({ id: item.id, qty: item.qty + 1 })}
                    className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <span className="w-24 text-right font-semibold text-ink-900">
                  {item.currency} {item.lineTotal.toFixed(2)}
                </span>

                <button
                  onClick={() => remove.mutate(item.id)}
                  className="text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            {hasPhysical && (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Shipping address (required for physical items)
                </label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-ink-900">
                Total: {currency} {total.toFixed(2)}
              </span>
              <button
                onClick={() => checkout.mutate()}
                disabled={checkout.isPending || (hasPhysical && !shippingAddress.trim())}
                className="rounded-lg bg-brand-600 px-8 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {checkout.isPending ? 'Placing order…' : 'Checkout'}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 p-16 text-center text-gray-500">
          Your cart is empty.{' '}
          <Link to="/" className="text-brand-600 hover:underline">Browse the store</Link>.
        </div>
      )}

      {clientSecrets && (
        <StripePaymentModal
          clientSecrets={clientSecrets}
          onClose={() => setClientSecrets(null)}
          onAllDone={() => {
            toast.success('Payment complete — order placed!');
            setClientSecrets(null);
            navigate('/orders', { state: { highlight: placedOrderId } });
          }}
        />
      )}
    </div>
  );
}
