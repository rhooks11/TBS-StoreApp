import client from '@/lib/api/client';
import type { CartItem, Order, Paginated, Product } from '@/types';
import type { StoreUser } from '@/lib/auth/AuthStore';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: StoreUser;
}

export const api = {
  // Auth — store accounts are TBS accounts (non-TBS users get a free Patron account)
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>('/api/auth/login', { email, password });
    return data;
  },

  register: async (payload: {
    email: string; password: string; firstName: string; lastName: string;
  }): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>('/api/auth/register', {
      ...payload,
      role: 'Patron',
    });
    return data;
  },

  // Catalog
  products: async (params: {
    trainerUserId?: string; type?: string; search?: string; page?: number;
  }): Promise<Paginated<Product>> => {
    const { data } = await client.get<Paginated<Product>>('/api/store/products', { params });
    return data;
  },

  product: async (id: string): Promise<Product> => {
    const { data } = await client.get<Product>(`/api/store/products/${id}`);
    return data;
  },

  // Cart
  cart: async (): Promise<CartItem[]> => {
    const { data } = await client.get<CartItem[]>('/api/store/cart');
    return data;
  },

  addToCart: async (productId: string, qty: number): Promise<CartItem[]> => {
    const { data } = await client.post<CartItem[]>('/api/store/cart/items', { productId, qty });
    return data;
  },

  updateCartItem: async (id: string, qty: number): Promise<CartItem[]> => {
    const { data } = await client.put<CartItem[]>(`/api/store/cart/items/${id}`, { qty });
    return data;
  },

  removeCartItem: async (id: string): Promise<CartItem[]> => {
    const { data } = await client.delete<CartItem[]>(`/api/store/cart/items/${id}`);
    return data;
  },

  // Checkout & orders
  // The API creates one Stripe payment per selling trainer; in live mode each
  // needs its own Elements confirmation, so we surface all client secrets.
  checkout: async (shippingAddress?: string): Promise<{ order: Order; clientSecrets: string[] }> => {
    const { data } = await client.post<{ order: Order; clientSecrets: string[] }>(
      '/api/store/checkout',
      { shippingAddress },
    );
    return data;
  },

  orders: async (): Promise<Order[]> => {
    const { data } = await client.get<Order[]>('/api/store/orders');
    return data;
  },
};
