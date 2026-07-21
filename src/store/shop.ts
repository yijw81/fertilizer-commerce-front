import { computed, reactive, ref } from 'vue'
import { fertilizerApi, pendingPaymentStore } from '../services/mockApi'
import { tokenStore } from '../services/api'
import type { Address, CartItem, Category, CropEffect, Product, ProductOption, Review, SocialProvider, User, Order } from '../types/fertilizer'

declare const TossPayments: any

export type SortKey = 'popular' | 'priceLow' | 'priceHigh' | 'rating'
export type PaymentMethodType = 'normal' | 'simple'
export type PaymentOption = 'CARD' | 'KAKAOPAY' | 'TOSSPAY' | 'NAVERPAY'

const TOSS_CLIENT_KEY = 'test_ck_P9BRQmyarY9jvwb7P9wZrJ07KzLN'

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
const addresses = ref<Address[]>([])
const couponCode = ref('FARM10')
const couponMessage = ref('')
const discount = ref(0)
const checkoutMessage = ref('')
const isLoading = ref(false)
const paymentError = ref('')
const receiverName = ref('')
const receiverPhone = ref('010-0000-0000')
const deliveryAddress = ref('서울시 강남구 테헤란로 123')
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
    .map((item) => {
      const product = products.value.find((p) => p.id === item.productId)
      const option = product?.options.find((o) => o.label === item.optionLabel) ?? null
      return { ...item, product, option }
    })
    .filter((item): item is CartItem & { product: Product; option: ProductOption } => Boolean(item.product)),
)
const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() =>
  cartDetails.value.reduce((sum, item) => {
    const unitPrice = item.product.price + (item.option?.priceAdjustment ?? 0)
    return sum + unitPrice * item.quantity
  }, 0),
)
const shippingFee = computed(() => (subtotal.value >= 50000 || subtotal.value === 0 ? 0 : 3000))
const orderTotal = computed(() => Math.max(0, subtotal.value + shippingFee.value - discount.value))
const wishlistProducts = computed(() => products.value.filter((p) => wishlist.value.includes(p.id)))

function findProduct(id: string) {
  return products.value.find((p) => p.id === id)
}

async function loadInitialData() {
  if (dataLoaded.value) return
  dataLoaded.value = true
  categories.value = await fertilizerApi.getCategories()
  products.value = await fertilizerApi.getProducts()
  cropEffects.value = await fertilizerApi.getCropEffects()

  // 저장된 토큰으로 유저 복원 (새로고침 / 리디렉션 후)
  const savedToken = tokenStore.get()
  if (savedToken) {
    try {
      orders.value = await fertilizerApi.getOrders()
    } catch {
      tokenStore.clear()
    }
  }
}

function addToCart(productId: string, option?: ProductOption) {
  const product = findProduct(productId)
  const pickedOption = option ?? product?.options[0]
  if (!pickedOption) return
  const found = cart.value.find((item) => item.productId === productId && item.optionLabel === pickedOption.label)
  if (found) found.quantity += 1
  else cart.value.push({ productId, quantity: 1, optionLabel: pickedOption.label })
}

function updateQuantity(productId: string, optionLabel: string, quantity: number) {
  if (quantity <= 0) cart.value = cart.value.filter((item) => item.productId !== productId || item.optionLabel !== optionLabel)
  else {
    const found = cart.value.find((item) => item.productId === productId && item.optionLabel === optionLabel)
    if (found) found.quantity = quantity
  }
}

function toggleWishlist(productId: string) {
  wishlist.value = wishlist.value.includes(productId)
    ? wishlist.value.filter((id) => id !== productId)
    : [...wishlist.value, productId]
}

async function loginEmail(email: string, password: string) {
  isLoading.value = true
  try {
    user.value = await fertilizerApi.loginWithEmail(email, password)
    ;[orders.value, addresses.value] = await Promise.all([fertilizerApi.getOrders(), fertilizerApi.getAddresses()])
  } finally {
    isLoading.value = false
  }
}

async function loginSocial(provider: SocialProvider) {
  isLoading.value = true
  try {
    user.value = await fertilizerApi.loginWithSocial(provider)
    ;[orders.value, addresses.value] = await Promise.all([fertilizerApi.getOrders(), fertilizerApi.getAddresses()])
  } finally {
    isLoading.value = false
  }
}

async function register(name: string, email: string, password: string) {
  isLoading.value = true
  try {
    user.value = await fertilizerApi.register(name, email, password)
    orders.value = await fertilizerApi.getOrders()
  } finally {
    isLoading.value = false
  }
}

function logout() {
  fertilizerApi.logout()
  user.value = null
  orders.value = []
  addresses.value = []
}

async function forgotPassword(email: string) {
  isLoading.value = true
  try {
    await fertilizerApi.forgotPassword(email)
  } finally {
    isLoading.value = false
  }
}

async function changePassword(currentPassword: string, newPassword: string) {
  isLoading.value = true
  try {
    await fertilizerApi.changePassword(currentPassword, newPassword)
  } finally {
    isLoading.value = false
  }
}

async function loadAddresses() {
  addresses.value = await fertilizerApi.getAddresses()
}

async function saveAddress(id: string | null, data: Omit<Address, 'id'>) {
  isLoading.value = true
  try {
    if (id) await fertilizerApi.updateAddress(id, data)
    else await fertilizerApi.addAddress(data)
    await loadAddresses()
  } finally {
    isLoading.value = false
  }
}

async function deleteAddress(id: string) {
  await fertilizerApi.deleteAddress(id)
  await loadAddresses()
}

async function setDefaultAddress(id: string) {
  await fertilizerApi.setDefaultAddress(id)
  await loadAddresses()
}

async function applyCoupon() {
  const result = await fertilizerApi.applyCoupon(couponCode.value, subtotal.value + shippingFee.value)
  discount.value = result.discount
  couponMessage.value = result.message
}

function generateOrderId() {
  return `fertilizer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function checkout(paymentOption: PaymentOption) {
  if (!user.value || !cartDetails.value.length) return

  isLoading.value = true
  try {
    const tossPayments = TossPayments(TOSS_CLIENT_KEY)
    const payment = tossPayments.payment({ customerKey: `CUSTOMER_${user.value.id}` })

    const orderId = generateOrderId()
    const orderName = cartDetails.value.length === 1
      ? cartDetails.value[0].product.name
      : `${cartDetails.value[0].product.name} 외 ${cartDetails.value.length - 1}건`

    const successUrl = `${window.location.origin}/payment-success`
    const failUrl = `${window.location.origin}/payment-fail`

    // 리디렉션 후 복원을 위해 장바구니 정보를 localStorage에 보관
    pendingPaymentStore.save({
      cart: cart.value,
      discount: discount.value,
      orderTotal: orderTotal.value,
    })

    const baseParams = {
      amount: { currency: 'KRW', value: orderTotal.value },
      orderId,
      orderName,
      successUrl,
      failUrl,
      customerName: user.value.name,
      customerEmail: user.value.email,
    }

    if (paymentOption === 'KAKAOPAY') {
      await payment.requestPayment({ ...baseParams, method: 'CARD', card: { flowMode: 'DIRECT', easyPay: 'KAKAOPAY' } })
    } else if (paymentOption === 'TOSSPAY') {
      await payment.requestPayment({ ...baseParams, method: 'CARD', card: { flowMode: 'DIRECT', easyPay: 'TOSSPAY' } })
    } else if (paymentOption === 'NAVERPAY') {
      await payment.requestPayment({ ...baseParams, method: 'CARD', card: { flowMode: 'DIRECT', easyPay: 'NAVERPAY' } })
    } else {
      await payment.requestPayment({ ...baseParams, method: 'CARD', card: { useEscrow: false } })
    }
  } catch (err) {
    pendingPaymentStore.clear()
    console.error('결제 시작 실패:', err)
  } finally {
    isLoading.value = false
  }
}

async function confirmPendingPayment(params: { paymentKey?: string; orderId?: string; amount?: number }) {
  const pending = pendingPaymentStore.load()
  if (pending) {
    cart.value = pending.cart
    discount.value = pending.discount
  }

  isLoading.value = true
  try {
    if (params.paymentKey && params.orderId && params.amount && pending) {
      const result = await fertilizerApi.confirmPayment({
        paymentKey: params.paymentKey,
        orderId: params.orderId,
        amount: params.amount,
        items: pending.cart,
        receiverName: receiverName.value,
        deliveryAddress: deliveryAddress.value,
      })
      checkoutMessage.value = result.orderId
      orders.value = await fertilizerApi.getOrders()
    } else {
      checkoutMessage.value = params.orderId ?? ''
    }
  } catch (err) {
    console.error('결제 확인 실패:', err)
    checkoutMessage.value = params.orderId ?? ''
  } finally {
    isLoading.value = false
  }

  pendingPaymentStore.clear()
  cart.value = []
  discount.value = 0
}

function restorePendingCartAfterFailure(message: string) {
  const pending = pendingPaymentStore.load()
  if (pending) {
    cart.value = pending.cart
    discount.value = pending.discount
  }
  pendingPaymentStore.clear()
  paymentError.value = message
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
  addresses,
  couponCode,
  couponMessage,
  discount,
  checkoutMessage,
  isLoading,
  paymentError,
  receiverName,
  receiverPhone,
  deliveryAddress,
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
  register,
  logout,
  forgotPassword,
  changePassword,
  loadAddresses,
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  applyCoupon,
  checkout,
  confirmPendingPayment,
  restorePendingCartAfterFailure,
})

export function useShopStore() {
  return shopStore
}
