import { Link } from 'react-router-dom';
import { Download, Gift, Package, Video } from 'lucide-react';
import type { Product, ProductType } from '@/types';

const TYPE_ICONS: Record<ProductType, typeof Package> = {
  Physical: Package,
  Digital: Download,
  GiftCertificate: Gift,
  OnlineVideo: Video,
};

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 p-16 text-center text-gray-500">
        No products found.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const Icon = TYPE_ICONS[p.type];
        return (
          <Link
            key={p.id}
            to={`/products/${p.id}`}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-32 items-center justify-center rounded-lg bg-gray-50 text-gray-300">
              <Icon size={40} />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink-900">{p.name}</div>
              {p.trainerFirstName && (
                <div className="truncate text-sm text-gray-500">
                  by {p.trainerFirstName} {p.trainerLastName}
                </div>
              )}
            </div>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-lg font-bold text-ink-900">
                {p.currency} {p.price.toFixed(2)}
              </span>
              {p.type === 'Physical' && p.stockQty >= 0 && p.stockQty <= 5 && (
                <span className="text-xs text-amber-600">
                  {p.stockQty === 0 ? 'Out of stock' : `${p.stockQty} left`}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
