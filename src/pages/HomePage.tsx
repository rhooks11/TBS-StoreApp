import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import ProductGrid from '@/components/ProductGrid';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, type, page }],
    queryFn: () => api.products({ search: search || undefined, type: type || undefined, page }),
    placeholderData: keepPreviousData,
  });

  const input =
    'rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500';

  return (
    <div>
      <section className="bg-ink-900 py-14 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Gear, guides &amp; gift certificates <span className="text-brand-500">from real coaches</span>
        </h1>
        <p className="mt-3 text-gray-300">
          Every product is sold by a Trainers By Sport coach — they keep 97% of every sale.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            placeholder="Search products…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={`${input} flex-1 min-w-48`}
          />
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className={input}
          >
            <option value="">All types</option>
            <option value="Physical">Physical items</option>
            <option value="Digital">Digital downloads</option>
            <option value="GiftCertificate">Gift certificates</option>
            <option value="OnlineVideo">Online videos</option>
          </select>
        </div>

        {isLoading ? (
          <p className="py-20 text-center text-gray-500">Loading products…</p>
        ) : (
          <>
            <ProductGrid products={data?.items ?? []} />
            {data && data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3 text-sm">
                <button
                  disabled={!data.hasPreviousPage}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-gray-600">Page {data.page} of {data.totalPages}</span>
                <button
                  disabled={!data.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
