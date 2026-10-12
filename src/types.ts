export type ProductType = 'Physical' | 'Digital' | 'GiftCertificate' | 'OnlineVideo';
export type OrderStatus = 'Pending' | 'Paid' | 'Fulfilled' | 'Refunded' | 'Cancelled';

export interface Product {
  id: string;
  trainerUserId?: string | null;
  trainerFirstName?: string | null;
  trainerLastName?: string | null;
  name: string;
  description?: string | null;
  type: ProductType;
  price: number;
  currency: string;
  stockQty: number;
  imagesJson?: string | null;
  videoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export function parseProductImages(json?: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export interface Paginated<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  type: ProductType;
  unitPrice: number;
  currency: string;
  qty: number;
  lineTotal: number;
  trainerFirstName?: string | null;
  trainerLastName?: string | null;
  stockQty: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  type: ProductType;
  qty: number;
  unitPrice: number;
  trackingNumber?: string | null;
  giftCertificateCode?: string | null;
  digitalFileUrl?: string | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  currency: string;
  shippingAddress?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export const TYPE_LABELS: Record<ProductType, string> = {
  Physical: 'Physical item',
  Digital: 'Digital download',
  GiftCertificate: 'Gift certificate',
  OnlineVideo: 'Online video',
};
