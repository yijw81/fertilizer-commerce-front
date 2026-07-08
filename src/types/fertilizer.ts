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

export interface ProductOption {
  label: string
  priceAdjustment: number  // 기본가 대비 가감 금액, 음수 가능
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
  options: ProductOption[]
  nutrients: NutrientInfo
  applicationMethod: string
  targetCrops: string[]
}

export interface CartItem {
  productId: string
  quantity: number
  optionLabel: string  // ProductOption.label
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

export interface Address {
  id: string
  label: string
  receiverName: string
  phone: string
  address: string
  detailAddress: string
  isDefault: boolean
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
