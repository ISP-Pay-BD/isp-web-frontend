import { http } from '../client';

export interface ShopProduct {
  id: number;
  admin_id: number;
  title: string;
  category: string;
  price: number;
  original_price: number | null;
  stock_status: string;
  stock_quantity: number;
  image: string | null;
  description: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ShopOrder {
  id: number;
  admin_id: number;
  customer_id: number;
  product_id: number;
  product_title: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  customer_name: string;
  customer_mobile: string;
  delivery_address: string | null;
  notes: string | null;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  admin_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProductQueryParams {
  category?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface OrderQueryParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface SaveProductPayload {
  id?: number;
  title: string;
  category?: string;
  price: number;
  original_price?: number;
  stock_status?: string;
  stock_quantity?: number;
  image?: string;
  description?: string;
  status?: string;
}

export interface PlaceOrderPayload {
  product_id: number;
  quantity?: number;
  delivery_address?: string;
  notes?: string;
}

export interface UpdateOrderStatusPayload {
  status: string;
  admin_notes?: string;
}

export const shopService = {
  // ── Customer Operations ────────────────────────────────────────────────
  getCustomerProducts: async (params?: ProductQueryParams): Promise<ShopProduct[]> => {
    return await http.get<ShopProduct[]>('/v1/customer/shop/products', params as Record<string, unknown>);
  },

  getCustomerOrders: async (): Promise<ShopOrder[]> => {
    return await http.get<ShopOrder[]>('/v1/customer/shop/orders');
  },

  placeCustomerOrder: async (payload: PlaceOrderPayload): Promise<ShopOrder> => {
    return await http.post<ShopOrder>('/v1/customer/shop/order', payload);
  },

  cancelCustomerOrder: async (orderId: number | string): Promise<{ success: boolean; message: string }> => {
    return await http.post<{ success: boolean; message: string }>(`/v1/customer/shop/order/cancel/${orderId}`);
  },

  // ── Admin Operations ───────────────────────────────────────────────────
  getAdminProducts: async (params?: ProductQueryParams): Promise<ShopProduct[]> => {
    return await http.get<ShopProduct[]>('/v1/shop/products', params as Record<string, unknown>);
  },

  getAdminProduct: async (id: number | string): Promise<ShopProduct> => {
    return await http.get<ShopProduct>(`/v1/shop/products/${id}`);
  },

  createProduct: async (payload: SaveProductPayload): Promise<ShopProduct> => {
    return await http.post<ShopProduct>('/v1/shop/products', payload);
  },

  updateProduct: async (id: number | string, payload: SaveProductPayload): Promise<ShopProduct> => {
    return await http.put<ShopProduct>(`/v1/shop/products/${id}`, payload);
  },

  deleteProduct: async (id: number | string): Promise<{ success: boolean; message: string }> => {
    return await http.delete<{ success: boolean; message: string }>(`/v1/shop/products/${id}`);
  },

  getAdminOrders: async (params?: OrderQueryParams): Promise<ShopOrder[]> => {
    return await http.get<ShopOrder[]>('/v1/shop/orders', params as Record<string, unknown>);
  },

  getAdminOrder: async (id: number | string): Promise<ShopOrder> => {
    return await http.get<ShopOrder>(`/v1/shop/orders/${id}`);
  },

  updateOrderStatus: async (id: number | string, payload: UpdateOrderStatusPayload): Promise<ShopOrder> => {
    return await http.put<ShopOrder>(`/v1/shop/orders/${id}`, payload);
  },
};
