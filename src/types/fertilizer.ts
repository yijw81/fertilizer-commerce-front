export type SocialProvider = 'google' | 'kakao' | 'naver'

export interface Category {
  id: string
  name: string
  icon: string
}

export interface NutrientInfo {
  n: number  // 질소 %
  p: number  // 인산 %
  k: number  // 칼륨 %
}

export interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  stock: number
  badges: string[]
  image: string
  description: string
  options: string[]
  nutrients: NutrientInfo
  applicationMethod: string
  targetCrops: string[]
}

export interface CartItem {
  productId: string
  quantity: number
  option: string
}

export interface User {
  id: string
  name: string
  email: string
  provider: 'email' | SocialProvider
  membership: string
}

export interface Order {
  id: string
  createdAt: string
  status: '결제완료' | '배송준비' | '배송중' | '배송완료'
  total: number
  items: Array<{ productName: string; quantity: number }>
}

export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  content: string
  createdAt: string
}

export interface CropEffect {
  cropId: string
  cropName: string
  cropIcon: string
  recommendedProducts: Array<{
    productId: string
    timing: string
    dosage: string
    effects: string[]
  }>
}
