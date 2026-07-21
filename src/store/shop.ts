import { computed, reactive, ref } from 'vue'
import { fertilizerApi } from '../services/mockApi'
import type { CartItem, Category, CropEffect, Order, Product, SocialProvider, User } from '../types/fertilizer'

export type SortKey = 'popular' | 'priceLow' | 'priceHigh' | 'rating'

const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const cropEffects = ref<CropEffect[]>([])
const selectedCategory = ref('all')
const searchKeyword = ref('')
const sortKey = ref<SortKey>('popular')
const cart = ref<CartItem[]>([])
const wishlist = ref<string[]>([])
const user = ref<User | null>(null)
const orders = ref<Order[]>([])
const email = ref('demo@farm.test')
const password = ref('password123')
const couponCode = ref('FARM10')
const couponMessage = ref('')
const discount = ref(0)
const checkoutMessage = ref('')
const isLoading = ref(false)
const dataLoaded = ref(false)

const filteredProducts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  const filtered = products.value.filter((product) => {
    const matchesCategory = selectedCategory.value === 'all' || product.category === selectedCategory.value
    const matchesKeyword = !keyword || `${product.name} ${product.brand} ${product.description}`.toLowerCase().includes(keyword)
    return matchesCategory && matchesKeyword
  })
  return [...filtered].sort((a, b) => {
    if (sortKey.value === 'priceLow') return a.price - b.price
    if (sortKey.value === 'priceHigh') return b.price - a.price
    if (sortKey.value === 'rating') return b.rating - a.rating
    return b.reviewCount - a.reviewCount
  })
})

const cartDetails = computed(() =>
  cart.value
    .map((item) => ({ ...item, product: products.value.find((p) => p.id === item.productId) }))
    .filter((item): item is CartItem & { product: Product } => Boolean(item.product)),
)
const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() => cartDetails.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0))
const shippingFee = computed(() => (subtotal.value >= 50000 || subtotal.value === 0 ? 0 : 3000))
const orderTotal = computed(() => Math.max(0, subtotal.value + shippingFee.value - discount.value))
const wishlistProducts = computed(() => products.value.filter((p) => wishlist.value.includes(p.id)))

function findProduct(id: string) {
  return products.value.find((p) => p.id === id)
}

async function loadInitialData() {
  if (dataLoaded.value) return
  categories.value = await fertilizerApi.getCategories()
  products.value = await fertilizerApi.getProducts()
  cropEffects.value = await fertilizerApi.getCropEffects()
  dataLoaded.value = true
}

function addToCart(productId: string, option?: string) {
  const product = findProduct(productId)
  const pickedOption = option || product?.options[0] || '기본'
  const found = cart.value.find((item) => item.productId === productId && item.option === pickedOption)
  if (found) found.quantity += 1
  else cart.value.push({ productId, quantity: 1, option: pickedOption })
}

function updateQuantity(productId: string, option: string, quantity: number) {
  if (quantity <= 0) cart.value = cart.value.filter((item) => item.productId !== productId || item.option !== option)
  else {
    const found = cart.value.find((item) => item.productId === productId && item.option === option)
    if (found) found.quantity = quantity
  }
}

function toggleWishlist(productId: string) {
  wishlist.value = wishlist.value.includes(productId)
    ? wishlist.value.filter((id) => id !== productId)
    : [...wishlist.value, productId]
}

async function loginEmail() {
  isLoading.value = true
  user.value = await fertilizerApi.loginWithEmail(email.value, password.value)
  orders.value = await fertilizerApi.getOrders()
  isLoading.value = false
}

async function loginSocial(provider: SocialProvider) {
  isLoading.value = true
  user.value = await fertilizerApi.loginWithSocial(provider)
  orders.value = await fertilizerApi.getOrders()
  isLoading.value = false
}

async function applyCoupon() {
  const result = await fertilizerApi.applyCoupon(couponCode.value, subtotal.value + shippingFee.value)
  discount.value = result.discount
  couponMessage.value = result.message
}

async function checkout() {
  isLoading.value = true
  const result = await fertilizerApi.checkout(orderTotal.value, cart.value)
  checkoutMessage.value = `${result.orderId} 주문이 생성되었습니다.`
  cart.value = []
  discount.value = 0
  isLoading.value = false
}

const shopStore = reactive({
  categories,
  products,
  cropEffects,
  selectedCategory,
  searchKeyword,
  sortKey,
  cart,
  wishlist,
  user,
  orders,
  email,
  password,
  couponCode,
  couponMessage,
  discount,
  checkoutMessage,
  isLoading,
  filteredProducts,
  cartDetails,
  cartCount,
  subtotal,
  shippingFee,
  orderTotal,
  wishlistProducts,
  findProduct,
  loadInitialData,
  addToCart,
  updateQuantity,
  toggleWishlist,
  loginEmail,
  loginSocial,
  applyCoupon,
  checkout,
})

export function useShopStore() {
  return shopStore
}
