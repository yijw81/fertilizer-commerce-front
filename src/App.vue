<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fertilizerApi, pendingPaymentStore } from './services/mockApi'
import { tokenStore } from './services/api'
import type { Address, CartItem, Category, CropEffect, Product, ProductOption, Review, SocialProvider, User, Order } from './types/fertilizer'

declare const TossPayments: any

type Page = 'products' | 'detail' | 'cart' | 'checkout' | 'login' | 'register' | 'forgot-password' | 'account' | 'crop-finder' | 'payment-success' | 'payment-fail'
type SortKey = 'popular' | 'priceLow' | 'priceHigh' | 'rating'
type PaymentMethodType = 'normal' | 'simple'
type PaymentOption = 'CARD' | 'KAKAOPAY' | 'TOSSPAY' | 'NAVERPAY'

const page = ref<Page>('products')
const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const cropEffects = ref<CropEffect[]>([])
const selectedCategory = ref('all')
const searchKeyword = ref('')
const sortKey = ref<SortKey>('popular')
const selectedProductId = ref<string>('')
const selectedOption = ref<ProductOption | null>(null)
const cart = ref<CartItem[]>([])
const wishlist = ref<string[]>([])
const user = ref<User | null>(null)
const orders = ref<Order[]>([])
const reviews = ref<Review[]>([])
const email = ref('')
const password = ref('')

// 회원가입
const registerName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerPasswordConfirm = ref('')
const registerError = ref('')

// 비밀번호 찾기
const forgotEmail = ref('')
const forgotStep = ref<'input' | 'sent'>('input')
const forgotError = ref('')

// 마이페이지 탭
type AccountTab = 'orders' | 'wishlist' | 'addresses' | 'password'
const accountTab = ref<AccountTab>('orders')

// 비밀번호 변경
const pwCurrent = ref('')
const pwNew = ref('')
const pwNewConfirm = ref('')
const pwError = ref('')
const pwSuccess = ref(false)

// 주소 관리
const addresses = ref<Address[]>([])
const addressForm = ref<Omit<Address, 'id'>>({ label: '', receiverName: '', phone: '', address: '', detailAddress: '', isDefault: false })
const editingAddressId = ref<string | null>(null)
const showAddressForm = ref(false)
const addressError = ref('')
const couponCode = ref('FARM10')
const couponMessage = ref('')
const discount = ref(0)
const checkoutMessage = ref('')
const isLoading = ref(false)
const paymentMethodTab = ref<PaymentMethodType>('normal')
const selectedPaymentOption = ref<PaymentOption>('CARD')
const receiverName = ref('')
const receiverPhone = ref('010-0000-0000')
const deliveryAddress = ref('서울시 강남구 테헤란로 123')
const paymentError = ref('')

const TOSS_CLIENT_KEY = 'test_ck_P9BRQmyarY9jvwb7P9wZrJ07KzLN'
const selectedCropId = ref<string>('')

const formatPrice = (value: number) => new Intl.NumberFormat('ko-KR').format(value)

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

const selectedProduct = computed(() => products.value.find((p) => p.id === selectedProductId.value))
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

const selectedCrop = computed(() => cropEffects.value.find((c) => c.cropId === selectedCropId.value))
const selectedCropProducts = computed(() => {
  if (!selectedCrop.value) return []
  return selectedCrop.value.recommendedProducts.map((rec) => ({
    ...rec,
    product: products.value.find((p) => p.id === rec.productId),
  })).filter((r): r is typeof r & { product: Product } => Boolean(r.product))
})

const nutrientColor = (type: 'n' | 'p' | 'k') => {
  if (type === 'n') return 'bg-blue-100 text-blue-700'
  if (type === 'p') return 'bg-orange-100 text-orange-700'
  return 'bg-purple-100 text-purple-700'
}

const move = (target: Page) => {
  if (target === 'register') {
    registerName.value = ''
    registerEmail.value = ''
    registerPassword.value = ''
    registerPasswordConfirm.value = ''
    registerError.value = ''
  }
  if (target === 'forgot-password') {
    forgotEmail.value = ''
    forgotStep.value = 'input'
    forgotError.value = ''
  }
  page.value = target
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openProduct = async (productId: string) => {
  selectedProductId.value = productId
  selectedOption.value = products.value.find((p) => p.id === productId)?.options[0] ?? null
  reviews.value = await fertilizerApi.getReviews(productId)
  move('detail')
}

const addToCart = (productId: string, option?: ProductOption) => {
  const product = products.value.find((p) => p.id === productId)
  const pickedOption = option ?? product?.options[0]
  if (!pickedOption) return
  const found = cart.value.find((item) => item.productId === productId && item.optionLabel === pickedOption.label)
  if (found) found.quantity += 1
  else cart.value.push({ productId, quantity: 1, optionLabel: pickedOption.label })
}

const updateQuantity = (productId: string, optionLabel: string, quantity: number) => {
  if (quantity <= 0) cart.value = cart.value.filter((item) => item.productId !== productId || item.optionLabel !== optionLabel)
  else {
    const found = cart.value.find((item) => item.productId === productId && item.optionLabel === optionLabel)
    if (found) found.quantity = quantity
  }
}

const toggleWishlist = (productId: string) => {
  wishlist.value = wishlist.value.includes(productId)
    ? wishlist.value.filter((id) => id !== productId)
    : [...wishlist.value, productId]
}

const loginEmail = async () => {
  isLoading.value = true
  try {
    user.value = await fertilizerApi.loginWithEmail(email.value, password.value)
    ;[orders.value, addresses.value] = await Promise.all([fertilizerApi.getOrders(), fertilizerApi.getAddresses()])
    move('account')
  } finally {
    isLoading.value = false
  }
}

const register = async () => {
  registerError.value = ''
  if (registerPassword.value !== registerPasswordConfirm.value) {
    registerError.value = '비밀번호가 일치하지 않습니다.'
    return
  }
  if (registerPassword.value.length < 8) {
    registerError.value = '비밀번호는 8자 이상이어야 합니다.'
    return
  }
  isLoading.value = true
  try {
    user.value = await fertilizerApi.register(registerName.value, registerEmail.value, registerPassword.value)
    orders.value = await fertilizerApi.getOrders()
    move('account')
  } catch (err) {
    registerError.value = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

const changePassword = async () => {
  pwError.value = ''
  pwSuccess.value = false
  if (pwNew.value !== pwNewConfirm.value) { pwError.value = '새 비밀번호가 일치하지 않습니다.'; return }
  if (pwNew.value.length < 8) { pwError.value = '비밀번호는 8자 이상이어야 합니다.'; return }
  isLoading.value = true
  try {
    await fertilizerApi.changePassword(pwCurrent.value, pwNew.value)
    pwSuccess.value = true
    pwCurrent.value = ''
    pwNew.value = ''
    pwNewConfirm.value = ''
  } catch (err) {
    pwError.value = err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

const loadAddresses = async () => {
  addresses.value = await fertilizerApi.getAddresses()
}

const openAddressForm = (addr?: Address) => {
  addressError.value = ''
  if (addr) {
    editingAddressId.value = addr.id
    addressForm.value = { label: addr.label, receiverName: addr.receiverName, phone: addr.phone, address: addr.address, detailAddress: addr.detailAddress, isDefault: addr.isDefault }
  } else {
    editingAddressId.value = null
    addressForm.value = { label: '', receiverName: '', phone: '', address: '', detailAddress: '', isDefault: false }
  }
  showAddressForm.value = true
}

const saveAddress = async () => {
  addressError.value = ''
  if (!addressForm.value.receiverName || !addressForm.value.phone || !addressForm.value.address) {
    addressError.value = '받는 사람, 연락처, 주소는 필수입니다.'
    return
  }
  isLoading.value = true
  try {
    if (editingAddressId.value) {
      await fertilizerApi.updateAddress(editingAddressId.value, addressForm.value)
    } else {
      await fertilizerApi.addAddress(addressForm.value)
    }
    await loadAddresses()
    showAddressForm.value = false
  } catch (err) {
    addressError.value = err instanceof Error ? err.message : '저장에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

const deleteAddress = async (id: string) => {
  if (!confirm('이 주소를 삭제하시겠습니까?')) return
  await fertilizerApi.deleteAddress(id)
  await loadAddresses()
}

const setDefaultAddress = async (id: string) => {
  await fertilizerApi.setDefaultAddress(id)
  await loadAddresses()
}

const forgotPassword = async () => {
  forgotError.value = ''
  isLoading.value = true
  try {
    await fertilizerApi.forgotPassword(forgotEmail.value)
    forgotStep.value = 'sent'
  } catch (err) {
    forgotError.value = err instanceof Error ? err.message : '요청에 실패했습니다. 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

const loginSocial = async (provider: SocialProvider) => {
  isLoading.value = true
  try {
    user.value = await fertilizerApi.loginWithSocial(provider)
    ;[orders.value, addresses.value] = await Promise.all([fertilizerApi.getOrders(), fertilizerApi.getAddresses()])
    move('account')
  } finally {
    isLoading.value = false
  }
}

const applyCoupon = async () => {
  const result = await fertilizerApi.applyCoupon(couponCode.value, subtotal.value + shippingFee.value)
  discount.value = result.discount
  couponMessage.value = result.message
}

const generateOrderId = () => {
  return `fertilizer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const checkout = async () => {
  if (!user.value) { move('login'); return }
  if (!cartDetails.value.length) return

  isLoading.value = true
  try {
    const tossPayments = TossPayments(TOSS_CLIENT_KEY)
    const payment = tossPayments.payment({ customerKey: `CUSTOMER_${user.value.id}` })

    const orderId = generateOrderId()
    const orderName = cartDetails.value.length === 1
      ? cartDetails.value[0].product.name
      : `${cartDetails.value[0].product.name} 외 ${cartDetails.value.length - 1}건`

    const successUrl = `${window.location.origin}${window.location.pathname}?payment=success&orderId=${orderId}`
    const failUrl = `${window.location.origin}${window.location.pathname}?payment=fail&orderId=${orderId}`

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

    if (selectedPaymentOption.value === 'KAKAOPAY') {
      await payment.requestPayment({
        ...baseParams,
        method: 'CARD',
        card: { flowMode: 'DIRECT', easyPay: 'KAKAOPAY' },
      })
    } else if (selectedPaymentOption.value === 'TOSSPAY') {
      await payment.requestPayment({
        ...baseParams,
        method: 'CARD',
        card: { flowMode: 'DIRECT', easyPay: 'TOSSPAY' },
      })
    } else if (selectedPaymentOption.value === 'NAVERPAY') {
      await payment.requestPayment({
        ...baseParams,
        method: 'CARD',
        card: { flowMode: 'DIRECT', easyPay: 'NAVERPAY' },
      })
    } else {
      await payment.requestPayment({
        ...baseParams,
        method: 'CARD',
        card: { useEscrow: false },
      })
    }
  } catch (err) {
    pendingPaymentStore.clear()
    console.error('결제 시작 실패:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  categories.value = await fertilizerApi.getCategories()
  products.value = await fertilizerApi.getProducts()
  cropEffects.value = await fertilizerApi.getCropEffects()
  if (products.value[0]) {
    selectedProductId.value = products.value[0].id
    selectedOption.value = products.value[0].options[0]
    reviews.value = await fertilizerApi.getReviews(products.value[0].id)
  }
  if (cropEffects.value[0]) selectedCropId.value = cropEffects.value[0].cropId

  // 저장된 토큰으로 유저 복원 (새로고침 / 리디렉션 후)
  const savedToken = tokenStore.get()
  if (savedToken) {
    try {
      orders.value = await fertilizerApi.getOrders()
    } catch {
      tokenStore.clear()
    }
  }

  const urlParams = new URLSearchParams(window.location.search)
  const paymentStatus = urlParams.get('payment')

  if (paymentStatus === 'success') {
    const paymentKey = urlParams.get('paymentKey')
    const orderId = urlParams.get('orderId')
    const amount = Number(urlParams.get('amount') ?? '0')

    window.history.replaceState({}, '', window.location.pathname)

    const pending = pendingPaymentStore.load()
    if (pending) {
      cart.value = pending.cart
      discount.value = pending.discount
    }

    isLoading.value = true
    try {
      if (paymentKey && orderId && amount && pending) {
        const result = await fertilizerApi.confirmPayment({
          paymentKey,
          orderId,
          amount,
          items: pending.cart,
          receiverName: receiverName.value,
          deliveryAddress: deliveryAddress.value,
        })
        checkoutMessage.value = result.orderId
        orders.value = await fertilizerApi.getOrders()
      } else {
        checkoutMessage.value = orderId ?? ''
      }
    } catch (err) {
      console.error('결제 확인 실패:', err)
      checkoutMessage.value = orderId ?? ''
    } finally {
      isLoading.value = false
    }

    pendingPaymentStore.clear()
    cart.value = []
    discount.value = 0
    page.value = 'payment-success'
  } else if (paymentStatus === 'fail') {
    // 실패 시 장바구니 복원
    const pending = pendingPaymentStore.load()
    if (pending) {
      cart.value = pending.cart
      discount.value = pending.discount
    }
    pendingPaymentStore.clear()
    paymentError.value = urlParams.get('message') ?? '결제가 취소되었습니다.'
    page.value = 'payment-fail'
    window.history.replaceState({}, '', window.location.pathname)
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
        <button class="text-left" @click="move('products')">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-600">Fertilizer</p>
          <h1 class="text-2xl font-black">비료 쇼핑몰</h1>
        </button>
        <div class="hidden flex-1 items-center rounded-2xl bg-slate-100 px-4 py-2 md:flex">
          <span>🔎</span>
          <input v-model="searchKeyword" class="w-full bg-transparent px-3 outline-none" placeholder="비료명, 브랜드, 작물명 검색" @focus="move('products')" />
        </div>
        <nav class="ml-auto flex items-center gap-2 text-sm font-semibold">
          <button class="nav-btn" @click="move('products')">상품</button>
          <button class="nav-btn flex items-center gap-1" @click="move('crop-finder')">
            <span>🌱</span><span class="hidden sm:inline">작물별 찾기</span>
          </button>
          <button class="nav-btn" @click="move('cart')">장바구니 {{ cartCount > 0 ? cartCount : '' }}</button>
          <button class="nav-btn" @click="move(user ? 'account' : 'login')">{{ user ? '마이페이지' : '로그인' }}</button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8">

      <!-- ① 상품 목록 (메인) -->
      <section v-if="page === 'products'" class="space-y-6">
        <div class="overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-700 to-brand-500 p-8 text-white shadow-soft">
          <p class="text-sm font-bold uppercase tracking-widest text-brand-100">비료 전문 쇼핑몰</p>
          <h2 class="mt-2 text-4xl font-black leading-tight md:text-5xl">작물이 건강하게<br />자라도록</h2>
          <p class="mt-3 max-w-xl text-brand-100">질소·인산·칼륨 단비부터 복합비료·유기질·미량원소까지, 모든 비료를 한 곳에서 만나세요.</p>
          <button class="mt-5 rounded-2xl bg-white px-6 py-3 font-black text-brand-700 shadow-sm hover:bg-brand-50" @click="move('crop-finder')">
            🌱 작물로 비료 찾기
          </button>
        </div>

        <div class="rounded-3xl bg-white p-5 shadow-sm">
          <div class="grid gap-3 md:grid-cols-[1fr_220px]">
            <input v-model="searchKeyword" class="input" placeholder="검색어를 입력하세요" />
            <select v-model="sortKey" class="input">
              <option value="popular">인기순</option>
              <option value="priceLow">낮은 가격순</option>
              <option value="priceHigh">높은 가격순</option>
              <option value="rating">평점순</option>
            </select>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="category in categories"
              :key="category.id"
              class="rounded-full px-4 py-2 text-sm font-bold transition"
              :class="selectedCategory === category.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
              @click="selectedCategory = category.id"
            >
              {{ category.icon }} {{ category.name }}
            </button>
          </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-soft"
          >
            <button class="block w-full" @click="openProduct(product.id)">
              <img :src="product.image" :alt="product.name" class="h-52 w-full object-cover" />
            </button>
            <div class="space-y-3 p-5">
              <div class="flex flex-wrap gap-2">
                <span v-for="badge in product.badges" :key="badge" class="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">{{ badge }}</span>
              </div>
              <div class="flex gap-2">
                <span v-if="product.nutrients.n" :class="nutrientColor('n')" class="nutrient-badge">N {{ product.nutrients.n }}%</span>
                <span v-if="product.nutrients.p" :class="nutrientColor('p')" class="nutrient-badge">P {{ product.nutrients.p }}%</span>
                <span v-if="product.nutrients.k" :class="nutrientColor('k')" class="nutrient-badge">K {{ product.nutrients.k }}%</span>
              </div>
              <button class="text-left" @click="openProduct(product.id)">
                <p class="text-xs font-bold text-slate-400">{{ product.brand }}</p>
                <h3 class="text-lg font-black">{{ product.name }}</h3>
              </button>
              <p class="text-sm text-slate-500">⭐ {{ product.rating }} ({{ product.reviewCount }}) · 재고 {{ product.stock }}</p>
              <div class="flex items-end gap-2">
                <strong class="text-2xl">{{ formatPrice(product.price) }}원</strong>
                <del v-if="product.originalPrice" class="text-sm text-slate-400">{{ formatPrice(product.originalPrice) }}원</del>
              </div>
              <div class="flex gap-2">
                <button class="primary-btn flex-1" @click="addToCart(product.id)">담기</button>
                <button class="icon-btn" @click="toggleWishlist(product.id)">{{ wishlist.includes(product.id) ? '♥' : '♡' }}</button>
              </div>
            </div>
          </article>
        </div>
        <p v-if="filteredProducts.length === 0" class="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">검색 결과가 없습니다.</p>
      </section>

      <!-- ② 작물별 비료 찾기 -->
      <section v-if="page === 'crop-finder'" class="space-y-8">
        <div>
          <h2 class="text-3xl font-black">🌱 작물로 비료 찾기</h2>
          <p class="mt-2 text-slate-500">재배 중인 작물을 선택하면 최적의 비료와 예상 효능을 안내해드립니다.</p>
        </div>

        <!-- 작물 선택 -->
        <div class="flex flex-wrap gap-3">
          <button
            v-for="crop in cropEffects"
            :key="crop.cropId"
            class="rounded-2xl px-5 py-3 text-lg font-black transition"
            :class="selectedCropId === crop.cropId ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-slate-700 shadow-sm hover:bg-brand-50'"
            @click="selectedCropId = crop.cropId"
          >
            {{ crop.cropIcon }} {{ crop.cropName }}
          </button>
        </div>

        <!-- 선택된 작물 결과 -->
        <div v-if="selectedCrop" class="space-y-6">
          <h3 class="text-2xl font-black">{{ selectedCrop.cropIcon }} {{ selectedCrop.cropName }}에 추천하는 비료</h3>

          <div v-for="rec in selectedCropProducts" :key="rec.productId" class="overflow-hidden rounded-[2rem] bg-white shadow-soft">
            <div class="grid gap-0 lg:grid-cols-[300px_1fr]">
              <!-- 상품 정보 -->
              <div class="flex flex-col justify-between bg-brand-50 p-6">
                <div>
                  <img :src="rec.product.image" :alt="rec.product.name" class="h-40 w-full rounded-2xl object-cover" />
                  <p class="mt-3 text-xs font-bold text-brand-600">{{ rec.product.brand }}</p>
                  <h4 class="mt-1 text-xl font-black">{{ rec.product.name }}</h4>
                  <div class="mt-2 flex gap-2">
                    <span v-if="rec.product.nutrients.n" :class="nutrientColor('n')" class="nutrient-badge">N {{ rec.product.nutrients.n }}%</span>
                    <span v-if="rec.product.nutrients.p" :class="nutrientColor('p')" class="nutrient-badge">P {{ rec.product.nutrients.p }}%</span>
                    <span v-if="rec.product.nutrients.k" :class="nutrientColor('k')" class="nutrient-badge">K {{ rec.product.nutrients.k }}%</span>
                  </div>
                  <p class="mt-3 text-2xl font-black">{{ formatPrice(rec.product.price) }}원</p>
                </div>
                <div class="mt-4 flex gap-2">
                  <button class="primary-btn flex-1" @click="addToCart(rec.productId)">담기</button>
                  <button class="secondary-btn" @click="openProduct(rec.productId)">상세</button>
                </div>
              </div>

              <!-- 효능 정보 -->
              <div class="space-y-5 p-6">
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="rounded-2xl bg-slate-50 p-4">
                    <p class="text-xs font-black uppercase tracking-widest text-slate-400">시비 시기</p>
                    <p class="mt-1 font-bold text-slate-800">{{ rec.timing }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4">
                    <p class="text-xs font-black uppercase tracking-widest text-slate-400">시비 방법</p>
                    <p class="mt-1 font-bold text-slate-800">{{ rec.dosage }}</p>
                  </div>
                </div>

                <div>
                  <p class="font-black text-brand-700">🌿 {{ selectedCrop.cropName }}에 나타나는 효능</p>
                  <ul class="mt-3 space-y-2">
                    <li v-for="effect in rec.effects" :key="effect" class="flex items-start gap-3 rounded-2xl bg-green-50 p-3">
                      <span class="mt-0.5 text-brand-600">✓</span>
                      <span class="text-sm font-bold text-slate-700">{{ effect }}</span>
                    </li>
                  </ul>
                </div>

                <div class="rounded-2xl border border-slate-100 p-4">
                  <p class="text-xs font-black uppercase tracking-widest text-slate-400">적용 방법</p>
                  <p class="mt-1 text-sm text-slate-600">{{ rec.product.applicationMethod }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ③ 상품 상세 -->
      <section v-if="page === 'detail' && selectedProduct" class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <img :src="selectedProduct.image" :alt="selectedProduct.name" class="h-[480px] w-full rounded-[2rem] object-cover shadow-soft" />
        <div class="space-y-6 rounded-[2rem] bg-white p-8 shadow-sm">
          <div>
            <p class="text-sm font-bold text-brand-600">{{ selectedProduct.brand }}</p>
            <h2 class="mt-2 text-4xl font-black">{{ selectedProduct.name }}</h2>
            <p class="mt-3 text-slate-500">{{ selectedProduct.description }}</p>
          </div>

          <!-- 영양소 배지 -->
          <div class="flex flex-wrap gap-2">
            <span v-if="selectedProduct.nutrients.n" :class="nutrientColor('n')" class="nutrient-badge text-sm">질소(N) {{ selectedProduct.nutrients.n }}%</span>
            <span v-if="selectedProduct.nutrients.p" :class="nutrientColor('p')" class="nutrient-badge text-sm">인산(P) {{ selectedProduct.nutrients.p }}%</span>
            <span v-if="selectedProduct.nutrients.k" :class="nutrientColor('k')" class="nutrient-badge text-sm">칼륨(K) {{ selectedProduct.nutrients.k }}%</span>
          </div>

          <div class="rounded-2xl bg-slate-50 p-4 text-sm">
            <p class="font-black">시비 방법</p>
            <p class="mt-1 text-slate-600">{{ selectedProduct.applicationMethod }}</p>
            <p class="mt-2 font-black">적용 작물</p>
            <p class="mt-1 text-slate-600">{{ selectedProduct.targetCrops.join(', ') }}</p>
          </div>

          <div class="flex items-end gap-3">
            <strong class="text-4xl">{{ formatPrice(selectedProduct.price) }}원</strong>
            <del v-if="selectedProduct.originalPrice" class="text-lg text-slate-400">{{ formatPrice(selectedProduct.originalPrice) }}원</del>
          </div>
          <p class="font-bold">⭐ {{ selectedProduct.rating }} · 리뷰 {{ selectedProduct.reviewCount }}개 · 재고 {{ selectedProduct.stock }}개</p>
          <select v-model="selectedOption" class="input">
            <option v-for="opt in selectedProduct.options" :key="opt.label" :value="opt">
              {{ opt.label }}
              <template v-if="opt.priceAdjustment > 0"> (+{{ formatPrice(opt.priceAdjustment) }}원)</template>
              <template v-else-if="opt.priceAdjustment < 0"> ({{ formatPrice(opt.priceAdjustment) }}원)</template>
            </option>
          </select>
          <div v-if="selectedOption" class="flex items-end gap-3">
            <strong class="text-3xl">
              {{ formatPrice(selectedProduct.price + selectedOption.priceAdjustment) }}원
            </strong>
            <span v-if="selectedOption.priceAdjustment !== 0" class="text-sm" :class="selectedOption.priceAdjustment > 0 ? 'text-red-500' : 'text-blue-500'">
              (옵션 {{ selectedOption.priceAdjustment > 0 ? '+' : '' }}{{ formatPrice(selectedOption.priceAdjustment) }}원)
            </span>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <button class="primary-btn" @click="addToCart(selectedProduct.id, selectedOption ?? undefined); move('cart')">바로 구매</button>
            <button class="secondary-btn" @click="addToCart(selectedProduct.id, selectedOption ?? undefined)">장바구니 담기</button>
          </div>

          <div class="rounded-3xl bg-slate-50 p-5">
            <h3 class="font-black">리뷰</h3>
            <div v-if="reviews.length" class="mt-3 space-y-3">
              <article v-for="review in reviews" :key="review.id" class="rounded-2xl bg-white p-4">
                <p class="font-bold">{{ review.author }} · ⭐ {{ review.rating }}</p>
                <p class="text-sm text-slate-500">{{ review.content }} · {{ review.createdAt }}</p>
              </article>
            </div>
            <p v-else class="mt-3 text-sm text-slate-500">아직 등록된 리뷰가 없습니다.</p>
          </div>
        </div>
      </section>

      <!-- ④ 장바구니 -->
      <section v-if="page === 'cart'" class="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div class="space-y-4">
          <h2 class="text-3xl font-black">장바구니</h2>
          <article v-for="item in cartDetails" :key="`${item.productId}-${item.optionLabel}`" class="flex gap-4 rounded-3xl bg-white p-4 shadow-sm">
            <img :src="item.product.image" :alt="item.product.name" class="h-28 w-28 rounded-2xl object-cover" />
            <div class="flex-1">
              <h3 class="font-black">{{ item.product.name }}</h3>
              <p class="text-sm text-slate-500">옵션: {{ item.optionLabel }}</p>
              <p class="mt-2 font-bold">
                {{ formatPrice(item.product.price + (item.option?.priceAdjustment ?? 0)) }}원
                <span v-if="item.option?.priceAdjustment" class="text-sm font-normal" :class="item.option.priceAdjustment > 0 ? 'text-red-500' : 'text-blue-500'">
                  ({{ item.option.priceAdjustment > 0 ? '+' : '' }}{{ formatPrice(item.option.priceAdjustment) }}원)
                </span>
              </p>
              <div class="mt-3 flex items-center gap-2">
                <button class="qty-btn" @click="updateQuantity(item.productId, item.optionLabel, item.quantity - 1)">-</button>
                <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
                <button class="qty-btn" @click="updateQuantity(item.productId, item.optionLabel, item.quantity + 1)">+</button>
              </div>
            </div>
          </article>
          <div v-if="!cartDetails.length" class="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p class="text-5xl">🧺</p>
            <p class="mt-4 font-bold text-slate-500">장바구니가 비어 있습니다.</p>
            <button class="primary-btn mt-5" @click="move('products')">상품 보러가기</button>
          </div>
        </div>
        <aside class="h-fit rounded-3xl bg-white p-6 shadow-soft">
          <h3 class="text-xl font-black">주문 요약</h3>
          <dl class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between"><dt>상품 금액</dt><dd>{{ formatPrice(subtotal) }}원</dd></div>
            <div class="flex justify-between"><dt>배송비</dt><dd>{{ shippingFee === 0 ? '무료' : formatPrice(shippingFee) + '원' }}</dd></div>
            <div class="flex justify-between text-brand-700"><dt>할인</dt><dd>-{{ formatPrice(discount) }}원</dd></div>
            <div class="flex justify-between border-t pt-4 text-xl font-black"><dt>결제 예정</dt><dd>{{ formatPrice(orderTotal) }}원</dd></div>
          </dl>
          <p class="mt-3 text-xs text-slate-400">5만원 이상 구매 시 무료 배송</p>
          <button class="primary-btn mt-6 w-full" :disabled="!cartDetails.length" @click="move('checkout')">주문하기</button>
        </aside>
      </section>

      <!-- ⑤ 주문/결제 -->
      <section v-if="page === 'checkout'" class="mx-auto max-w-3xl space-y-6 rounded-[2rem] bg-white p-8 shadow-soft">
        <h2 class="text-3xl font-black">주문/결제</h2>

        <!-- 배송 정보 -->
        <div class="space-y-3">
          <h3 class="text-lg font-black">배송 정보</h3>
          <div class="grid gap-3 md:grid-cols-2">
            <input v-model="receiverName" class="input" :placeholder="user?.name ?? '받는 사람'" />
            <input v-model="receiverPhone" class="input" placeholder="연락처" />
            <input v-model="deliveryAddress" class="input md:col-span-2" placeholder="배송지" />
          </div>
        </div>

        <!-- 쿠폰 -->
        <div class="space-y-2">
          <h3 class="text-lg font-black">할인 쿠폰</h3>
          <div class="flex gap-2">
            <input v-model="couponCode" class="input" placeholder="쿠폰 코드 (FARM10, GREEN5000)" />
            <button class="secondary-btn whitespace-nowrap" @click="applyCoupon">쿠폰 적용</button>
          </div>
          <p v-if="couponMessage" class="text-sm font-bold text-brand-700">{{ couponMessage }}</p>
        </div>

        <!-- 결제 수단 -->
        <div class="space-y-4">
          <h3 class="text-lg font-black">결제 수단</h3>

          <!-- 탭 -->
          <div class="relative grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              class="relative z-10 rounded-lg py-2 text-sm font-bold transition-colors"
              :class="paymentMethodTab === 'normal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
              @click="paymentMethodTab = 'normal'; selectedPaymentOption = 'CARD'"
            >신용/체크카드</button>
            <button
              class="relative z-10 rounded-lg py-2 text-sm font-bold transition-colors"
              :class="paymentMethodTab === 'simple' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
              @click="paymentMethodTab = 'simple'; selectedPaymentOption = 'KAKAOPAY'"
            >간편결제</button>
          </div>

          <!-- 일반 결제 -->
          <div v-if="paymentMethodTab === 'normal'" class="flex gap-3">
            <label class="payment-card" :class="{ 'payment-card--active': selectedPaymentOption === 'CARD' }">
              <input type="radio" name="payment" value="CARD" v-model="selectedPaymentOption" class="sr-only" />
              <span class="text-2xl">💳</span>
              <span class="text-sm font-bold">카드 결제</span>
            </label>
          </div>

          <!-- 간편결제 -->
          <div v-if="paymentMethodTab === 'simple'" class="flex gap-3">
            <label class="payment-card" :class="{ 'payment-card--active': selectedPaymentOption === 'KAKAOPAY' }">
              <input type="radio" name="payment" value="KAKAOPAY" v-model="selectedPaymentOption" class="sr-only" />
              <span class="text-xl font-black text-[#3A1D1D]" style="font-family: sans-serif;">kakao<span class="text-[#FFE500]">pay</span></span>
            </label>
            <label class="payment-card" :class="{ 'payment-card--active': selectedPaymentOption === 'TOSSPAY' }">
              <input type="radio" name="payment" value="TOSSPAY" v-model="selectedPaymentOption" class="sr-only" />
              <span class="text-xl font-black text-[#0064FF]">toss<span class="text-[#0064FF]">pay</span></span>
            </label>
            <label class="payment-card" :class="{ 'payment-card--active': selectedPaymentOption === 'NAVERPAY' }">
              <input type="radio" name="payment" value="NAVERPAY" v-model="selectedPaymentOption" class="sr-only" />
              <span class="text-xl font-black text-[#03C75A]">N<span class="text-slate-800">pay</span></span>
            </label>
          </div>
        </div>

        <!-- 최종 금액 -->
        <div class="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-slate-500">상품 금액</span><span>{{ formatPrice(subtotal) }}원</span></div>
          <div class="flex justify-between"><span class="text-slate-500">배송비</span><span>{{ shippingFee === 0 ? '무료' : formatPrice(shippingFee) + '원' }}</span></div>
          <div v-if="discount" class="flex justify-between text-brand-700"><span>할인</span><span>-{{ formatPrice(discount) }}원</span></div>
          <div class="flex justify-between border-t border-slate-200 pt-3 text-xl font-black">
            <span>총 결제금액</span>
            <span class="text-brand-700">{{ formatPrice(orderTotal) }}원</span>
          </div>
        </div>

        <button
          class="primary-btn w-full py-4 text-lg"
          :disabled="isLoading || !cartDetails.length"
          @click="checkout"
        >
          {{ isLoading ? '처리 중...' : `${formatPrice(orderTotal)}원 결제하기` }}
        </button>

        <ul class="space-y-1 pl-4 text-xs text-slate-400 list-disc">
          <li>결제는 토스페이먼츠를 통해 안전하게 처리됩니다.</li>
          <li>주문 완료 후 마이페이지에서 주문 내역을 확인할 수 있습니다.</li>
          <li>결제 취소는 배송 준비 전까지 가능합니다.</li>
        </ul>
      </section>

      <!-- ⑧ 결제 성공 -->
      <section v-if="page === 'payment-success'" class="mx-auto max-w-xl space-y-6 rounded-[2rem] bg-white p-10 text-center shadow-soft">
        <div class="flex flex-col items-center gap-4">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">✅</div>
          <h2 class="text-3xl font-black">결제 완료!</h2>
          <p class="text-slate-500">주문이 성공적으로 완료되었습니다.</p>
          <p v-if="checkoutMessage" class="rounded-xl bg-slate-50 px-4 py-2 text-sm font-mono text-slate-600">주문번호: {{ checkoutMessage }}</p>
        </div>
        <div class="flex gap-3">
          <button class="secondary-btn flex-1" @click="move('account')">주문 내역 보기</button>
          <button class="primary-btn flex-1" @click="move('products')">쇼핑 계속하기</button>
        </div>
      </section>

      <!-- ⑨ 결제 실패 -->
      <section v-if="page === 'payment-fail'" class="mx-auto max-w-xl space-y-6 rounded-[2rem] bg-white p-10 text-center shadow-soft">
        <div class="flex flex-col items-center gap-4">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">❌</div>
          <h2 class="text-3xl font-black">결제 실패</h2>
          <p class="text-slate-500">{{ paymentError }}</p>
        </div>
        <div class="flex gap-3">
          <button class="secondary-btn flex-1" @click="move('products')">쇼핑 계속하기</button>
          <button class="primary-btn flex-1" @click="move('checkout')">다시 시도하기</button>
        </div>
      </section>

      <!-- ⑥ 로그인 -->
      <section v-if="page === 'login'" class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <div class="rounded-[2rem] bg-white p-8 shadow-soft">
          <h2 class="text-3xl font-black">이메일 로그인</h2>
          <p class="mt-2 text-slate-500">이메일과 비밀번호로 로그인하세요.</p>
          <div class="mt-6 space-y-3">
            <input v-model="email" class="input" type="email" placeholder="이메일" />
            <input v-model="password" class="input" type="password" placeholder="비밀번호" />
            <button class="primary-btn w-full" :disabled="isLoading" @click="loginEmail">로그인</button>
          </div>
          <div class="mt-5 flex justify-between text-sm font-bold text-brand-700">
            <button @click="move('register')">회원가입</button>
            <button @click="move('forgot-password')">비밀번호 찾기</button>
          </div>
        </div>
        <div class="rounded-[2rem] bg-slate-900 p-8 text-white shadow-soft">
          <h2 class="text-3xl font-black">소셜 로그인</h2>
          <p class="mt-2 text-slate-300">소셜 계정으로 간편하게 로그인하세요.</p>
          <div class="mt-6 space-y-3">
            <button class="social-btn bg-white text-slate-900" @click="loginSocial('google')">Google로 계속하기</button>
            <button class="social-btn bg-[#FEE500] text-slate-900" @click="loginSocial('kakao')">Kakao로 계속하기</button>
            <button class="social-btn bg-[#03C75A] text-white" @click="loginSocial('naver')">Naver로 계속하기</button>
          </div>
        </div>
      </section>

      <!-- 회원가입 -->
      <section v-if="page === 'register'" class="mx-auto max-w-lg space-y-6 rounded-[2rem] bg-white p-8 shadow-soft">
        <div>
          <h2 class="text-3xl font-black">회원가입</h2>
          <p class="mt-2 text-slate-500">비료 쇼핑몰의 다양한 혜택을 누려보세요.</p>
        </div>
        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-sm font-bold text-slate-700">이름</label>
            <input v-model="registerName" class="input" type="text" placeholder="이름을 입력하세요" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-slate-700">이메일</label>
            <input v-model="registerEmail" class="input" type="email" placeholder="이메일을 입력하세요" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-slate-700">비밀번호</label>
            <input v-model="registerPassword" class="input" type="password" placeholder="8자 이상 입력하세요" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold text-slate-700">비밀번호 확인</label>
            <input
              v-model="registerPasswordConfirm"
              class="input"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              @keyup.enter="register"
            />
          </div>
          <p v-if="registerError" class="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600">{{ registerError }}</p>
          <button
            class="primary-btn w-full"
            :disabled="isLoading || !registerName || !registerEmail || !registerPassword || !registerPasswordConfirm"
            @click="register"
          >
            {{ isLoading ? '처리 중...' : '회원가입' }}
          </button>
        </div>
        <p class="text-center text-sm text-slate-500">
          이미 계정이 있으신가요?
          <button class="font-bold text-brand-700" @click="move('login')">로그인</button>
        </p>
      </section>

      <!-- 비밀번호 찾기 -->
      <section v-if="page === 'forgot-password'" class="mx-auto max-w-lg rounded-[2rem] bg-white p-8 shadow-soft">
        <template v-if="forgotStep === 'input'">
          <div>
            <h2 class="text-3xl font-black">비밀번호 찾기</h2>
            <p class="mt-2 text-slate-500">가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
          </div>
          <div class="mt-6 space-y-3">
            <div>
              <label class="mb-1 block text-sm font-bold text-slate-700">이메일</label>
              <input
                v-model="forgotEmail"
                class="input"
                type="email"
                placeholder="가입 이메일을 입력하세요"
                @keyup.enter="forgotPassword"
              />
            </div>
            <p v-if="forgotError" class="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600">{{ forgotError }}</p>
            <button
              class="primary-btn w-full"
              :disabled="isLoading || !forgotEmail"
              @click="forgotPassword"
            >
              {{ isLoading ? '처리 중...' : '재설정 링크 보내기' }}
            </button>
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col items-center gap-4 text-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-4xl">📧</div>
            <h2 class="text-2xl font-black">이메일을 확인하세요</h2>
            <p class="text-slate-500">
              <span class="font-bold text-slate-800">{{ forgotEmail }}</span>으로<br />비밀번호 재설정 링크를 보내드렸습니다.
            </p>
            <p class="text-sm text-slate-400">이메일이 오지 않으면 스팸함을 확인하거나 아래 버튼을 눌러 다시 시도해주세요.</p>
            <button
              class="secondary-btn"
              @click="forgotStep = 'input'"
            >
              다시 시도하기
            </button>
          </div>
        </template>
        <p class="mt-6 text-center text-sm text-slate-500">
          <button class="font-bold text-brand-700" @click="move('login')">로그인으로 돌아가기</button>
        </p>
      </section>

      <!-- ⑦ 마이페이지 -->
      <section v-if="page === 'account'" class="space-y-6">
        <!-- 프로필 헤더 -->
        <div class="rounded-[2rem] bg-white p-8 shadow-soft">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-bold text-brand-600">{{ user?.membership ?? 'GUEST' }} MEMBER</p>
              <h2 class="mt-1 text-3xl font-black">{{ user?.name ?? '게스트' }}님, 안녕하세요</h2>
              <p class="mt-1 text-slate-500">{{ user?.email ?? '로그인 후 이용해주세요.' }}</p>
            </div>
            <button v-if="user" class="secondary-btn text-sm" @click="() => { fertilizerApi.logout(); user = null; orders = []; addresses = []; move('products') }">로그아웃</button>
          </div>
        </div>

        <!-- 탭 -->
        <div class="flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm">
          <button
            v-for="tab in ([['orders','주문 내역'], ['wishlist','찜한 상품'], ['addresses','배송지 관리'], ['password','비밀번호 변경']] as [AccountTab, string][])"
            :key="tab[0]"
            class="whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition"
            :class="accountTab === tab[0] ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100'"
            @click="accountTab = tab[0]; if(tab[0] === 'addresses') loadAddresses()"
          >
            {{ tab[1] }}
          </button>
        </div>

        <!-- 주문 내역 -->
        <div v-if="accountTab === 'orders'" class="rounded-3xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-black">주문 내역</h3>
          <article v-for="order in orders" :key="order.id" class="mt-4 rounded-2xl bg-slate-50 p-4">
            <div class="flex justify-between font-bold">
              <span class="text-sm font-mono text-slate-600">{{ order.id }}</span>
              <span class="rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-700">{{ order.status }}</span>
            </div>
            <p class="mt-1 text-sm text-slate-500">{{ order.createdAt }} · {{ formatPrice(order.total) }}원</p>
            <p class="mt-2 text-sm text-slate-700">{{ order.items.map((item) => `${item.productName} ${item.quantity}개`).join(', ') }}</p>
          </article>
          <p v-if="!orders.length" class="mt-6 text-center text-sm text-slate-500">주문 내역이 없습니다.</p>
        </div>

        <!-- 찜한 상품 -->
        <div v-if="accountTab === 'wishlist'" class="rounded-3xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-black">찜한 상품</h3>
          <article v-for="product in wishlistProducts" :key="product.id" class="mt-4 flex gap-3 rounded-2xl bg-slate-50 p-3">
            <img :src="product.image" :alt="product.name" class="h-16 w-16 rounded-xl object-cover" />
            <div class="flex-1">
              <p class="font-bold">{{ product.name }}</p>
              <p class="text-sm text-slate-500">{{ formatPrice(product.price) }}원</p>
            </div>
            <div class="flex flex-col gap-2">
              <button class="primary-btn text-xs px-3 py-1.5" @click="addToCart(product.id)">담기</button>
              <button class="icon-btn text-xs" @click="toggleWishlist(product.id)">♥</button>
            </div>
          </article>
          <p v-if="!wishlistProducts.length" class="mt-6 text-center text-sm text-slate-500">아직 찜한 상품이 없습니다.</p>
        </div>

        <!-- 배송지 관리 -->
        <div v-if="accountTab === 'addresses'" class="rounded-3xl bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-black">배송지 관리</h3>
            <button class="primary-btn text-sm" @click="openAddressForm()">+ 새 배송지</button>
          </div>

          <!-- 주소 목록 -->
          <div class="mt-4 space-y-3">
            <article v-for="addr in addresses" :key="addr.id" class="rounded-2xl border border-slate-100 p-4 transition hover:border-brand-200">
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-black text-slate-600">{{ addr.label || '배송지' }}</span>
                  <span v-if="addr.isDefault" class="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-black text-brand-700">기본</span>
                </div>
                <div class="flex shrink-0 gap-2 text-sm">
                  <button v-if="!addr.isDefault" class="font-bold text-slate-400 hover:text-brand-600" @click="setDefaultAddress(addr.id)">기본 설정</button>
                  <button class="font-bold text-slate-400 hover:text-brand-600" @click="openAddressForm(addr)">수정</button>
                  <button class="font-bold text-red-300 hover:text-red-500" @click="deleteAddress(addr.id)">삭제</button>
                </div>
              </div>
              <p class="mt-2 font-bold">{{ addr.receiverName }} · {{ addr.phone }}</p>
              <p class="mt-0.5 text-sm text-slate-600">{{ addr.address }} {{ addr.detailAddress }}</p>
            </article>
            <p v-if="!addresses.length" class="py-8 text-center text-sm text-slate-500">등록된 배송지가 없습니다.</p>
          </div>

          <!-- 주소 추가/수정 폼 -->
          <div v-if="showAddressForm" class="mt-6 rounded-2xl bg-slate-50 p-5 space-y-3">
            <h4 class="font-black">{{ editingAddressId ? '배송지 수정' : '새 배송지 추가' }}</h4>
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-600">배송지 이름</label>
                <input v-model="addressForm.label" class="input" placeholder="예: 집, 회사" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-600">받는 사람 <span class="text-red-400">*</span></label>
                <input v-model="addressForm.receiverName" class="input" placeholder="받는 사람 이름" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-600">연락처 <span class="text-red-400">*</span></label>
                <input v-model="addressForm.phone" class="input" placeholder="010-0000-0000" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-600">주소 <span class="text-red-400">*</span></label>
                <input v-model="addressForm.address" class="input" placeholder="기본 주소" />
              </div>
              <div class="sm:col-span-2">
                <label class="mb-1 block text-xs font-bold text-slate-600">상세 주소</label>
                <input v-model="addressForm.detailAddress" class="input" placeholder="상세 주소 (동/호수 등)" />
              </div>
              <div class="sm:col-span-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="addressForm.isDefault" class="h-4 w-4 rounded accent-brand-600" />
                  <span class="text-sm font-bold text-slate-700">기본 배송지로 설정</span>
                </label>
              </div>
            </div>
            <p v-if="addressError" class="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600">{{ addressError }}</p>
            <div class="flex gap-2">
              <button class="primary-btn flex-1" :disabled="isLoading" @click="saveAddress">{{ isLoading ? '저장 중...' : '저장' }}</button>
              <button class="secondary-btn" @click="showAddressForm = false">취소</button>
            </div>
          </div>
        </div>

        <!-- 비밀번호 변경 -->
        <div v-if="accountTab === 'password'" class="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-black">비밀번호 변경</h3>
          <div class="mt-4 space-y-3">
            <div>
              <label class="mb-1 block text-sm font-bold text-slate-700">현재 비밀번호</label>
              <input v-model="pwCurrent" class="input" type="password" placeholder="현재 비밀번호" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-bold text-slate-700">새 비밀번호</label>
              <input v-model="pwNew" class="input" type="password" placeholder="8자 이상 입력하세요" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-bold text-slate-700">새 비밀번호 확인</label>
              <input v-model="pwNewConfirm" class="input" type="password" placeholder="새 비밀번호를 다시 입력하세요" @keyup.enter="changePassword" />
            </div>
            <p v-if="pwError" class="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600">{{ pwError }}</p>
            <p v-if="pwSuccess" class="rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700">비밀번호가 성공적으로 변경되었습니다.</p>
            <button
              class="primary-btn w-full"
              :disabled="isLoading || !pwCurrent || !pwNew || !pwNewConfirm"
              @click="changePassword"
            >
              {{ isLoading ? '처리 중...' : '비밀번호 변경' }}
            </button>
          </div>
        </div>
      </section>

    </main>

    <footer class="mt-16 border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
      <p class="font-bold text-slate-600">비료 쇼핑몰</p>
      <p class="mt-1">목업 데이터로 구성된 프론트엔드 데모입니다. 백엔드 연동 전 화면 검증용입니다.</p>
      <div class="mt-4 space-y-1 text-xs leading-relaxed text-slate-400">
        <p>상호명: 주식회사 퍼스트트리 | 대표자명: 이재환</p>
        <p>사업자등록번호: 419-88-01327 | 통신판매업번호: 제2020-서울강남-03003호</p>
        <p>사업장주소: 서울특별시 강남구 강남대로84길 33, 1213호</p>
        <p>대표번호: 070-4156-4156</p>
      </div>
      <p class="mt-1">© 2026 Firsttree. All rights reserved.</p>
    </footer>
  </div>
</template>
