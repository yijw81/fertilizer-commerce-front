<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'
import { fertilizerApi } from '../services/mockApi'
import { formatPrice } from '../utils/format'
import NutrientBadges from '../components/NutrientBadges.vue'
import type { Review } from '../types/fertilizer'

const route = useRoute()
const router = useRouter()
const store = useShopStore()

const selectedOption = ref('')
const reviews = ref<Review[]>([])

const productId = computed(() => String(route.params.id))
const product = computed(() => store.findProduct(productId.value))

watch(
  () => [productId.value, store.products.length] as const,
  async () => {
    if (!product.value) return
    selectedOption.value = product.value.options[0] ?? ''
    reviews.value = await fertilizerApi.getReviews(productId.value)
  },
  { immediate: true },
)

const buyNow = () => {
  store.addToCart(productId.value, selectedOption.value)
  router.push({ name: 'cart' })
}
</script>

<template>
  <section v-if="product" class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
    <img :src="product.image" :alt="product.name" class="h-[480px] w-full rounded-[2rem] object-cover shadow-soft" />
    <div class="space-y-6 rounded-[2rem] bg-white p-8 shadow-sm">
      <div>
        <p class="text-sm font-bold text-brand-600">{{ product.brand }}</p>
        <h2 class="mt-2 text-4xl font-black">{{ product.name }}</h2>
        <p class="mt-3 text-slate-500">{{ product.description }}</p>
      </div>

      <NutrientBadges :nutrients="product.nutrients" size="base" labeled />

      <div class="rounded-2xl bg-slate-50 p-4 text-sm">
        <p class="font-black">시비 방법</p>
        <p class="mt-1 text-slate-600">{{ product.applicationMethod }}</p>
        <p class="mt-2 font-black">적용 작물</p>
        <p class="mt-1 text-slate-600">{{ product.targetCrops.join(', ') }}</p>
      </div>

      <div class="flex items-end gap-3">
        <strong class="text-4xl">{{ formatPrice(product.price) }}원</strong>
        <del v-if="product.originalPrice" class="text-lg text-slate-400">{{ formatPrice(product.originalPrice) }}원</del>
      </div>
      <p class="font-bold">⭐ {{ product.rating }} · 리뷰 {{ product.reviewCount }}개 · 재고 {{ product.stock }}개</p>
      <select v-model="selectedOption" class="input">
        <option v-for="option in product.options" :key="option" :value="option">{{ option }}</option>
      </select>
      <div class="grid gap-3 sm:grid-cols-2">
        <button class="primary-btn" @click="buyNow">바로 구매</button>
        <button class="secondary-btn" @click="store.addToCart(product.id, selectedOption)">장바구니 담기</button>
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
  <p v-else class="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">상품 정보를 불러오는 중입니다...</p>
</template>
