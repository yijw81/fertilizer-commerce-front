import type { CartItem, Category, CropEffect, Order, Product, Review, SocialProvider, User } from '../types/fertilizer'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

let _token: string | null = null

const authHeaders = (): Record<string, string> =>
  _token ? { Authorization: `Bearer ${_token}` } : {}

const get = async <T>(path: string, auth = false): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: auth ? authHeaders() : {},
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

const post = async <T>(path: string, body: unknown, auth = false): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(auth ? authHeaders() : {}) },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const fertilizerApi = {
  getCategories: (): Promise<Category[]> =>
    get('/categories'),

  getProducts: (): Promise<Product[]> =>
    get('/products'),

  getProduct: (id: string): Promise<Product> =>
    get(`/products/${id}`),

  getReviews: (productId: string): Promise<Review[]> =>
    get(`/products/${productId}/reviews`),

  getCropEffects: (): Promise<CropEffect[]> =>
    get('/crop-effects'),

  getOrders: (): Promise<Order[]> =>
    get('/orders', true),

  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const data = await post<{ token: string; user: User }>('/auth/login', { email, password })
    _token = data.token
    return data.user
  },

  loginWithSocial: async (provider: SocialProvider): Promise<User> => {
    const data = await post<{ token: string; user: User }>('/auth/social', { provider })
    _token = data.token
    return data.user
  },

  checkout: async (
    total: number,
    items: CartItem[],
  ): Promise<{ orderId: string; total: number }> =>
    post('/orders', { total, items }, true),

  applyCoupon: async (
    code: string,
    total: number,
  ): Promise<{ valid: boolean; discount: number; message: string }> =>
    post('/coupons/apply', { code, total }),
}
