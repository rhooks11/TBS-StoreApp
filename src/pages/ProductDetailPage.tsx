import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/lib/auth/AuthStore';
import { parseProductImages, TYPE_LABELS } from '@/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [qty, setQty] = useState(1);
  const [activeMedia, setActiveMedia] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.product(id!),
    enabled: !!id,
  });

  const add = useMutation({
    mutationFn: () => api.addToCart(id!, qty),
    onSuccess: () => {
      toast.success('Added to cart.');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not add to cart.';
      toast.error(msg);
    },
  });

  if (isLoading) return <p className="py-20 text-center text-gray-500">Loading…</p>;
  if (!product) return <p className="py-20 text-center text-gray-500">Product not found.</p>;

  const outOfStock = product.type === 'Physical' && product.stockQty === 0;
  const images = parseProductImages(product.imagesJson);
  const media = [
    ...images.map((url) => ({ type: 'image' as const, url })),
    ...(product.videoUrl ? [{ type: 'video' as const, url: product.videoUrl }] : []),
  ];
  const current = media[Math.min(activeMedia, media.length - 1)];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {media.length > 0 && (
          <div className="mb-6">
            <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
              {current.type === 'video' ? (
                <video key={current.url} src={current.url} controls className="h-full w-full object-contain" />
              ) : (
                <img key={current.url} src={current.url} alt={product.name} className="h-full w-full object-contain" />
              )}
            </div>
            {media.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {media.map((m, i) => (
                  <button
                    key={m.url}
                    onClick={() => setActiveMedia(i)}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                      i === activeMedia ? 'border-brand-600' : 'border-transparent'
                    }`}
                  >
                    {m.type === 'video' ? (
                      <video src={m.url} className="h-full w-full object-cover" muted />
                    ) : (
                      <img src={m.url} alt="" className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {TYPE_LABELS[product.type]}
        </span>
        <h1 className="mt-3 text-3xl font-bold text-ink-900">{product.name}</h1>
        {product.trainerFirstName && (
          <Link
            to={`/store/${product.trainerUserId}`}
            className="mt-1 inline-block text-sm text-brand-600 hover:underline"
          >
            by {product.trainerFirstName} {product.trainerLastName} — view their store
          </Link>
        )}
        {product.description && (
          <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-600">
            {product.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="text-3xl font-bold text-ink-900">
            {product.currency} {product.price.toFixed(2)}
          </span>

          {product.type === 'Physical' && (
            <input
              type="number"
              min="1"
              max={product.stockQty >= 0 ? product.stockQty : 99}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          )}

          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
                return;
              }
              add.mutate();
            }}
            disabled={add.isPending || outOfStock}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <ShoppingCart size={17} />
            {outOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>

        {product.type === 'Physical' && product.stockQty > 0 && product.stockQty <= 5 && (
          <p className="mt-2 text-sm text-amber-600">Only {product.stockQty} left in stock.</p>
        )}
      </div>
    </div>
  );
}
