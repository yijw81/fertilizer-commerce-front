<script setup lang="ts">
import { useShopStore } from '../../store/shop'
import { formatPrice } from '../../utils/format'

const store = useShopStore()
</script>

<template>
  <div class="rounded-3xl bg-white p-6 shadow-sm">
    <h3 class="text-xl font-black">찜한 상품</h3>
    <article v-for="product in store.wishlistProducts" :key="product.id" class="mt-4 flex gap-3 rounded-2xl bg-slate-50 p-3">
      <img :src="product.image" :alt="product.name" class="h-16 w-16 rounded-xl object-cover" />
      <div class="flex-1">
        <p class="font-bold">{{ product.name }}</p>
        <p class="text-sm text-slate-500">{{ formatPrice(product.price) }}원</p>
      </div>
      <div class="flex flex-col gap-2">
        <button class="primary-btn text-xs px-3 py-1.5" @click="store.addToCart(product.id)">담기</button>
        <button class="icon-btn text-xs" @click="store.toggleWishlist(product.id)">♥</button>
      </div>
    </article>
    <p v-if="!store.wishlistProducts.length" class="mt-6 text-center text-sm text-slate-500">아직 찜한 상품이 없습니다.</p>
  </div>
</template>
