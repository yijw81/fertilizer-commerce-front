<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'

const store = useShopStore()
const router = useRouter()
const route = useRoute()

const goProducts = () => router.push({ name: 'products' })
const focusSearch = () => {
  if (route.name !== 'products') router.push({ name: 'products' })
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
      <button class="text-left" @click="goProducts">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-600">Fertilizer</p>
        <h1 class="text-2xl font-black">비료 쇼핑몰</h1>
      </button>
      <div class="hidden flex-1 items-center rounded-2xl bg-slate-100 px-4 py-2 md:flex">
        <span>🔎</span>
        <input v-model="store.searchKeyword" class="w-full bg-transparent px-3 outline-none" placeholder="비료명, 브랜드, 작물명 검색" @focus="focusSearch" />
      </div>
      <nav class="ml-auto flex items-center gap-2 text-sm font-semibold">
        <button class="nav-btn" @click="goProducts">상품</button>
        <button class="nav-btn flex items-center gap-1" @click="router.push({ name: 'crop-finder' })">
          <span>🌱</span><span class="hidden sm:inline">작물별 찾기</span>
        </button>
        <button class="nav-btn" @click="router.push({ name: 'cart' })">장바구니 {{ store.cartCount > 0 ? store.cartCount : '' }}</button>
        <button class="nav-btn" @click="router.push({ name: store.user ? 'account' : 'login' })">{{ store.user ? '마이페이지' : '로그인' }}</button>
      </nav>
    </div>
  </header>
</template>
