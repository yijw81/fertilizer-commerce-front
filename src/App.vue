<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fertilizerApi } from './services/mockApi'
import type { CartItem, Category, CropEffect, Product, Review, SocialProvider, User, Order } from './types/fertilizer'

type Page = 'products' | 'detail' | 'cart' | 'checkout' | 'login' | 'account' | 'crop-finder'
type SortKey = 'popular' | 'priceLow' | 'priceHigh' | 'rating'

const page = ref<Page>('products')
const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const cropEffects = ref<CropEffect[]>([])
const selectedCategory = ref('all')
const searchKeyword = ref('')
const sortKey = ref<SortKey>('popular')
const selectedProductId = ref<string>('')
const selectedOption = ref('')
const cart = ref<CartItem[]>([])
const wishlist = ref<string[]>([])
const user = ref<User | null>(null)
const orders = ref<Order[]>([])
const reviews = ref<Review[]>([])
const email = ref('demo@farm.test')
const password = ref('password123')
const couponCode = ref('FARM10')
const couponMessage = ref('')
const discount = ref(0)
const checkoutMessage = ref('')
const isLoading = ref(false)
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
    .map((item) => ({ ...item, product: products.value.find((p) => p.id === item.productId) }))
    .filter((item): item is CartItem & { product: Product } => Boolean(item.product)),
)
const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() => cartDetails.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0))
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
  page.value = target
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openProduct = async (productId: string) => {
  selectedProductId.value = productId
  selectedOption.value = products.value.find((p) => p.id === productId)?.options[0] ?? ''
  reviews.value = await fertilizerApi.getReviews(productId)
  move('detail')
}

const addToCart = (productId: string, option?: string) => {
  const product = products.value.find((p) => p.id === productId)
  const pickedOption = option || product?.options[0] || '기본'
  const found = cart.value.find((item) => item.productId === productId && item.option === pickedOption)
  if (found) found.quantity += 1
  else cart.value.push({ productId, quantity: 1, option: pickedOption })
}

const updateQuantity = (productId: string, option: string, quantity: number) => {
  if (quantity <= 0) cart.value = cart.value.filter((item) => item.productId !== productId || item.option !== option)
  else {
    const found = cart.value.find((item) => item.productId === productId && item.option === option)
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
  user.value = await fertilizerApi.loginWithEmail(email.value, password.value)
  orders.value = await fertilizerApi.getOrders()
  isLoading.value = false
  move('account')
}

const loginSocial = async (provider: SocialProvider) => {
  isLoading.value = true
  user.value = await fertilizerApi.loginWithSocial(provider)
  orders.value = await fertilizerApi.getOrders()
  isLoading.value = false
  move('account')
}

const applyCoupon = async () => {
  const result = await fertilizerApi.applyCoupon(couponCode.value, subtotal.value + shippingFee.value)
  discount.value = result.discount
  couponMessage.value = result.message
}

const checkout = async () => {
  if (!user.value) { move('login'); return }
  isLoading.value = true
  const result = await fertilizerApi.checkout(orderTotal.value, cart.value)
  checkoutMessage.value = `${result.orderId} 주문이 생성되었습니다.`
  cart.value = []
  discount.value = 0
  isLoading.value = false
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
            <option v-for="option in selectedProduct.options" :key="option" :value="option">{{ option }}</option>
          </select>
          <div class="grid gap-3 sm:grid-cols-2">
            <button class="primary-btn" @click="addToCart(selectedProduct.id, selectedOption); move('cart')">바로 구매</button>
            <button class="secondary-btn" @click="addToCart(selectedProduct.id, selectedOption)">장바구니 담기</button>
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
          <article v-for="item in cartDetails" :key="`${item.productId}-${item.option}`" class="flex gap-4 rounded-3xl bg-white p-4 shadow-sm">
            <img :src="item.product.image" :alt="item.product.name" class="h-28 w-28 rounded-2xl object-cover" />
            <div class="flex-1">
              <h3 class="font-black">{{ item.product.name }}</h3>
              <p class="text-sm text-slate-500">옵션: {{ item.option }}</p>
              <p class="mt-2 font-bold">{{ formatPrice(item.product.price) }}원</p>
              <div class="mt-3 flex items-center gap-2">
                <button class="qty-btn" @click="updateQuantity(item.productId, item.option, item.quantity - 1)">-</button>
                <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
                <button class="qty-btn" @click="updateQuantity(item.productId, item.option, item.quantity + 1)">+</button>
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
      <section v-if="page === 'checkout'" class="mx-auto max-w-3xl space-y-5 rounded-[2rem] bg-white p-8 shadow-soft">
        <h2 class="text-3xl font-black">주문/결제</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <input class="input" placeholder="받는 사람" :value="user?.name ?? ''" />
          <input class="input" placeholder="연락처" value="010-0000-0000" />
          <input class="input md:col-span-2" placeholder="배송지" value="서울시 강남구 테헤란로 123" />
        </div>
        <div class="rounded-3xl bg-slate-50 p-5">
          <p class="font-black">결제 수단</p>
          <div class="mt-3 grid gap-2 md:grid-cols-3">
            <label v-for="method in ['신용카드', '간편결제', '무통장입금']" :key="method" class="rounded-2xl bg-white p-4 font-bold">
              <input name="pay" type="radio" class="mr-2" :checked="method === '신용카드'" />{{ method }}
            </label>
          </div>
        </div>
        <div class="flex gap-2">
          <input v-model="couponCode" class="input" placeholder="쿠폰 코드 (FARM10, GREEN5000)" />
          <button class="secondary-btn whitespace-nowrap" @click="applyCoupon">쿠폰 적용</button>
        </div>
        <p v-if="couponMessage" class="text-sm font-bold text-brand-700">{{ couponMessage }}</p>
        <div class="flex items-center justify-between rounded-3xl bg-slate-900 p-5 text-white">
          <span>총 결제금액</span>
          <strong class="text-2xl">{{ formatPrice(orderTotal) }}원</strong>
        </div>
        <button class="primary-btn w-full" :disabled="isLoading || !cartDetails.length" @click="checkout">
          {{ isLoading ? '처리 중...' : '목업 결제하기' }}
        </button>
        <p v-if="checkoutMessage" class="rounded-2xl bg-green-50 p-4 font-bold text-green-700">{{ checkoutMessage }}</p>
      </section>

      <!-- ⑥ 로그인 -->
      <section v-if="page === 'login'" class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <div class="rounded-[2rem] bg-white p-8 shadow-soft">
          <h2 class="text-3xl font-black">이메일 로그인</h2>
          <p class="mt-2 text-slate-500">목업 로그인입니다. 어떤 이메일/비밀번호든 로그인됩니다.</p>
          <div class="mt-6 space-y-3">
            <input v-model="email" class="input" type="email" placeholder="이메일" />
            <input v-model="password" class="input" type="password" placeholder="비밀번호" />
            <button class="primary-btn w-full" :disabled="isLoading" @click="loginEmail">로그인</button>
          </div>
          <div class="mt-5 flex justify-between text-sm font-bold text-brand-700">
            <button>회원가입</button><button>비밀번호 찾기</button>
          </div>
        </div>
        <div class="rounded-[2rem] bg-slate-900 p-8 text-white shadow-soft">
          <h2 class="text-3xl font-black">소셜 로그인</h2>
          <p class="mt-2 text-slate-300">목업 소셜 로그인. 실제 OAuth 없이 바로 로그인됩니다.</p>
          <div class="mt-6 space-y-3">
            <button class="social-btn bg-white text-slate-900" @click="loginSocial('google')">Google로 계속하기</button>
            <button class="social-btn bg-[#FEE500] text-slate-900" @click="loginSocial('kakao')">Kakao로 계속하기</button>
            <button class="social-btn bg-[#03C75A] text-white" @click="loginSocial('naver')">Naver로 계속하기</button>
          </div>
        </div>
      </section>

      <!-- ⑦ 마이페이지 -->
      <section v-if="page === 'account'" class="space-y-6">
        <div class="rounded-[2rem] bg-white p-8 shadow-soft">
          <p class="text-sm font-bold text-brand-600">{{ user?.membership ?? 'GUEST' }} MEMBER</p>
          <h2 class="mt-2 text-3xl font-black">{{ user?.name ?? '게스트' }}님, 안녕하세요</h2>
          <p class="text-slate-500">{{ user?.email ?? '로그인 후 주문 내역과 찜 상품을 확인하세요.' }}</p>
        </div>
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="rounded-3xl bg-white p-6 shadow-sm">
            <h3 class="text-xl font-black">주문 내역</h3>
            <article v-for="order in orders" :key="order.id" class="mt-4 rounded-2xl bg-slate-50 p-4">
              <div class="flex justify-between font-bold"><span>{{ order.id }}</span><span>{{ order.status }}</span></div>
              <p class="mt-1 text-sm text-slate-500">{{ order.createdAt }} · {{ formatPrice(order.total) }}원</p>
              <p class="mt-2 text-sm">{{ order.items.map((item) => `${item.productName} ${item.quantity}개`).join(', ') }}</p>
            </article>
          </div>
          <div class="rounded-3xl bg-white p-6 shadow-sm">
            <h3 class="text-xl font-black">찜한 상품</h3>
            <article v-for="product in wishlistProducts" :key="product.id" class="mt-4 flex gap-3 rounded-2xl bg-slate-50 p-3">
              <img :src="product.image" :alt="product.name" class="h-16 w-16 rounded-xl object-cover" />
              <div>
                <p class="font-bold">{{ product.name }}</p>
                <p class="text-sm text-slate-500">{{ formatPrice(product.price) }}원</p>
              </div>
            </article>
            <p v-if="!wishlistProducts.length" class="mt-4 text-sm text-slate-500">아직 찜한 상품이 없습니다.</p>
          </div>
        </div>
      </section>

    </main>

    <footer class="mt-16 border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
      <p class="font-bold text-slate-600">비료 쇼핑몰</p>
      <p class="mt-1">목업 데이터로 구성된 프론트엔드 데모입니다. 백엔드 연동 전 화면 검증용입니다.</p>
    </footer>
  </div>
</template>
