<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'
import ProductCard from '../components/ProductCard.vue'

const store = useShopStore()
const router = useRouter()
</script>

<template>
  <section class="space-y-6">
    <div class="overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-700 to-brand-500 p-8 text-white shadow-soft">
      <p class="text-sm font-bold uppercase tracking-widest text-brand-100">비료 전문 쇼핑몰</p>
      <h2 class="mt-2 text-4xl font-black leading-tight md:text-5xl">작물이 건강하게<br />자라도록</h2>
      <p class="mt-3 max-w-xl text-brand-100">질소·인산·칼륨 단비부터 복합비료·유기질·미량원소까지, 모든 비료를 한 곳에서 만나세요.</p>
      <button class="mt-5 rounded-2xl bg-white px-6 py-3 font-black text-brand-700 shadow-sm hover:bg-brand-50" @click="router.push({ name: 'crop-finder' })">
        🌱 작물로 비료 찾기
      </button>
    </div>

    <div class="rounded-3xl bg-white p-5 shadow-sm">
      <div class="grid gap-3 md:grid-cols-[1fr_220px]">
        <input v-model="store.searchKeyword" class="input" placeholder="검색어를 입력하세요" />
        <select v-model="store.sortKey" class="input">
          <option value="popular">인기순</option>
          <option value="priceLow">낮은 가격순</option>
          <option value="priceHigh">높은 가격순</option>
          <option value="rating">평점순</option>
        </select>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="category in store.categories"
          :key="category.id"
          class="rounded-full px-4 py-2 text-sm font-bold transition"
          :class="store.selectedCategory === category.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
          @click="store.selectedCategory = category.id"
        >
          {{ category.icon }} {{ category.name }}
        </button>
      </div>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard v-for="product in store.filteredProducts" :key="product.id" :product="product" />
    </div>
    <p v-if="store.filteredProducts.length === 0" class="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">검색 결과가 없습니다.</p>
  </section>
</template>
