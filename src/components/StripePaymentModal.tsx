import { useEffect, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import client from '../lib/api/client';

// Only reached in live Stripe mode — simulated mode settles checkout instantly
// and never returns a client secret.
// Key comes from admin Settings (/api/stripe/config); .env is only a fallback.
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () =>
  (stripePromise ??= client
    .get<{ publishableKey: string | null }>('/api/stripe/config')
    .then((r) => r.data.publishableKey)
    .catch(() => null)
    .then((k) => k || (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined))
    .then((k) => (k ? loadStripe(k) : null)));

function CheckoutForm({ onDone }: { onDone: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPending(true);
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    setPending(false);
    if (error) {
      toast.error(error.message ?? 'Payment failed.');
    } else if (paymentIntent?.status === 'succeeded') {
      onDone();
    }
  };

  return (
    <form onSubmit={submit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={pending || !stripe}
        className="mt-4 w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? 'Processing…' : 'Pay now'}
      </button>
    </form>
  );
}

/**
 * The API creates one payment intent per selling trainer — this modal walks
 * through each client secret in sequence and calls onAllDone when finished.
 */
export default function StripePaymentModal({ clientSecrets, onClose, onAllDone }: {
  clientSecrets: string[];
  onClose: () => void;
  onAllDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    getStripe().then((s) => {
      if (s) return setStripe(s);
      stripePromise = null; // retry next open, e.g. after admin adds the key
      toast.error('Stripe publishable key is not configured (Admin → Settings → Payments).');
      onClose();
    });
  }, [onClose]);

  const current = clientSecrets[index];
  if (!stripe || !current) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">
            Complete payment{clientSecrets.length > 1 ? ` (${index + 1} of ${clientSecrets.length})` : ''}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-ink-900">
            <X size={20} />
          </button>
        </div>
        <Elements key={current} stripe={stripe} options={{ clientSecret: current }}>
          <CheckoutForm
            onDone={() => {
              if (index + 1 < clientSecrets.length) {
                setIndex(index + 1);
              } else {
                onAllDone();
              }
            }}
          />
        </Elements>
      </div>
    </div>
  );
}
