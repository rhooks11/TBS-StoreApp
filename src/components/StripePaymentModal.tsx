import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { X } from 'lucide-react';
import { toast } from 'sonner';

// Only reached in live Stripe mode — simulated mode settles checkout instantly
// and never returns a client secret.
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

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

  if (!stripePromise) {
    toast.error('Stripe publishable key is not configured (VITE_STRIPE_PUBLISHABLE_KEY).');
    onClose();
    return null;
  }

  const current = clientSecrets[index];
  if (!current) return null;

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
        <Elements key={current} stripe={stripePromise} options={{ clientSecret: current }}>
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
