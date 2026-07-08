import type { Address, CartItem, Category, CropEffect, Order, Product, Review, SocialProvider, User } from '../types/fertilizer'
import { api, tokenStore } from './api'

const PENDING_CART_KEY = 'fertilizer_pending_cart'

interface PendingPayment {
  cart: CartItem[]
  discount: number
  orderTotal: number
}

export const pendingPaymentStore = {
  save: (data: PendingPayment) => localStorage.setItem(PENDING_CART_KEY, JSON.stringify(data)),
  load: (): PendingPayment | null => {
    const raw = localStorage.getItem(PENDING_CART_KEY)
    return raw ? (JSON.parse(raw) as PendingPayment) : null
  },
  clear: () => localStorage.removeItem(PENDING_CART_KEY),
}

export const fertilizerApi = {
  getCategories: (): Promise<Category[]> => api.get('/categories'),

  getProducts: (): Promise<Product[]> => api.get('/products'),

  getProduct: (id: string): Promise<Product> => api.get(`/products/${id}`),

  getReviews: (productId: string): Promise<Review[]> => api.get(`/products/${productId}/reviews`),

  getOrders: (): Promise<Order[]> => {
    if (tokenStore.get()) {
      return api.get<Order[]>('/orders')
    }
    return Promise.resolve([])
  },

  getCropEffects: (): Promise<CropEffect[]> => api.get('/crop-effects'),

  register: async (name: string, email: string, password: string): Promise<User> => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password })
    tokenStore.set(res.token)
    return res.user
  },

  forgotPassword: (email: string): Promise<void> =>
    api.post('/auth/forgot-password', { email }),

  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password })
    tokenStore.set(res.token)
    return res.user
  },

  loginWithSocial: async (provider: SocialProvider): Promise<User> => {
    const res = await api.post<{ token: string; user: User }>('/auth/social', { provider })
    tokenStore.set(res.token)
    return res.user
  },

  logout: () => {
    tokenStore.clear()
  },

  confirmPayment: async (params: {
    paymentKey: string
    orderId: string
    amount: number
    items: CartItem[]
    receiverName?: string
    deliveryAddress?: string
  }): Promise<{ orderId: string; total: number; paymentMethod: string }> => {
    return api.post('/payments/confirm', {
      paymentKey: params.paymentKey,
      orderId: params.orderId,
      amount: params.amount,
      items: params.items.map((item) => ({
        productId: item.productId,
        optionLabel: item.optionLabel,
        quantity: item.quantity,
      })),
      receiverName: params.receiverName,
      deliveryAddress: params.deliveryAddress,
    })
  },

  changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  getAddresses: (): Promise<Address[]> => api.get('/addresses'),

  addAddress: (data: Omit<Address, 'id'>): Promise<Address> =>
    api.post('/addresses', data),

  updateAddress: (id: string, data: Partial<Omit<Address, 'id'>>): Promise<Address> =>
    api.post(`/addresses/${id}`, data),

  deleteAddress: (id: string): Promise<void> =>
    api.post(`/addresses/${id}/delete`, {}),

  setDefaultAddress: (id: string): Promise<void> =>
    api.post(`/addresses/${id}/default`, {}),

  applyCoupon: async (
    code: string,
    total: number,
  ): Promise<{ valid: boolean; discount: number; message: string }> => {
    try {
      return await api.post('/coupons/apply', { code, total })
    } catch {
      return { valid: false, discount: 0, message: '쿠폰 적용 중 오류가 발생했습니다.' }
    }
  },
}
