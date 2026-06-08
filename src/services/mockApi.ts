import { CATEGORIES, CROP_EFFECTS, MOCK_ORDERS, MOCK_REVIEWS, PRODUCTS } from '../data/mockData'
import type { CartItem, Category, CropEffect, Order, Product, Review, SocialProvider, User } from '../types/fertilizer'

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms))

export const fertilizerApi = {
  getCategories: async (): Promise<Category[]> => {
    await delay()
    return CATEGORIES
  },

  getProducts: async (): Promise<Product[]> => {
    await delay()
    return PRODUCTS
  },

  getProduct: async (id: string): Promise<Product | undefined> => {
    await delay()
    return PRODUCTS.find((p) => p.id === id)
  },

  getReviews: async (productId: string): Promise<Review[]> => {
    await delay(200)
    return MOCK_REVIEWS[productId] ?? []
  },

  getOrders: async (): Promise<Order[]> => {
    await delay()
    return MOCK_ORDERS
  },

  getCropEffects: async (): Promise<CropEffect[]> => {
    await delay()
    return CROP_EFFECTS
  },

  loginWithEmail: async (_email: string, _password: string): Promise<User> => {
    await delay(600)
    return { id: 'u-1', name: '홍길동', email: _email, provider: 'email', membership: 'GOLD' }
  },

  loginWithSocial: async (provider: SocialProvider): Promise<User> => {
    await delay(600)
    return { id: 'u-2', name: '소셜 사용자', email: `user@${provider}.test`, provider, membership: 'SILVER' }
  },

  checkout: async (
    total: number,
    _items: CartItem[],
  ): Promise<{ orderId: string; total: number }> => {
    await delay(800)
    return { orderId: `ORD-${Date.now()}`, total }
  },

  applyCoupon: async (
    code: string,
    total: number,
  ): Promise<{ valid: boolean; discount: number; message: string }> => {
    await delay(400)
    if (code === 'FARM10') return { valid: true, discount: Math.floor(total * 0.1), message: '🌱 FARM10 쿠폰 적용! 10% 할인' }
    if (code === 'GREEN5000') return { valid: true, discount: 5000, message: '✅ GREEN5000 쿠폰 적용! 5,000원 할인' }
    return { valid: false, discount: 0, message: '유효하지 않은 쿠폰 코드입니다.' }
  },
}
