<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Product } from '../types/fertilizer'
import { formatPrice } from '../utils/format'
import { useShopStore } from '../store/shop'
import NutrientBadges from './NutrientBadges.vue'

const props = defineProps<{ product: Product }>()

const router = useRouter()
const store = useShopStore()

const openProduct = () => router.push({ name: 'product-detail', params: { id: props.product.id } })
</script>

<template>
  <article class="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-soft">
    <button class="block w-full" @click="openProduct">
      <img :src="product.image" :alt="product.name" class="h-52 w-full object-cover" />
    </button>
    <div class="space-y-3 p-5">
      <div class="flex flex-wrap gap-2">
        <span v-for="badge in product.badges" :key="badge" class="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">{{ badge }}</span>
      </div>
      <NutrientBadges :nutrients="product.nutrients" />
      <button class="text-left" @click="openProduct">
        <p class="text-xs font-bold text-slate-400">{{ product.brand }}</p>
        <h3 class="text-lg font-black">{{ product.name }}</h3>
      </button>
      <p class="text-sm text-slate-500">⭐ {{ product.rating }} ({{ product.reviewCount }}) · 재고 {{ product.stock }}</p>
      <div class="flex items-end gap-2">
        <strong class="text-2xl">{{ formatPrice(product.price) }}원</strong>
        <del v-if="product.originalPrice" class="text-sm text-slate-400">{{ formatPrice(product.originalPrice) }}원</del>
      </div>
      <div class="flex gap-2">
        <button class="primary-btn flex-1" @click="store.addToCart(product.id)">담기</button>
        <button class="icon-btn" @click="store.toggleWishlist(product.id)">{{ store.wishlist.includes(product.id) ? '♥' : '♡' }}</button>
      </div>
    </div>
  </article>
</template>
