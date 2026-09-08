import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import ProductGrid from '@/components/ProductGrid';

/** One trainer's branded store page — /store/{trainerUserId}. */
export default function TrainerStorePage() {
  const { trainerUserId } = useParams<{ trainerUserId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['trainer-store', trainerUserId],
    queryFn: () => api.products({ trainerUserId }),
    enabled: !!trainerUserId,
  });

  const trainerName = data?.items[0]
    ? `${data.items[0].trainerFirstName} ${data.items[0].trainerLastName}`
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-ink-900">
        {trainerName ? `${trainerName}'s Store` : 'Trainer Store'}
      </h1>
      {isLoading ? (
        <p className="py-20 text-center text-gray-500">Loading…</p>
      ) : (
        <ProductGrid products={data?.items ?? []} />
      )}
    </div>
  );
}
