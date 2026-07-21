<script setup lang="ts">
import { useShopStore } from '../store/shop'
import { formatPrice } from '../utils/format'

const store = useShopStore()
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-[2rem] bg-white p-8 shadow-soft">
      <p class="text-sm font-bold text-brand-600">{{ store.user?.membership ?? 'GUEST' }} MEMBER</p>
      <h2 class="mt-2 text-3xl font-black">{{ store.user?.name ?? '게스트' }}님, 안녕하세요</h2>
      <p class="text-slate-500">{{ store.user?.email ?? '로그인 후 주문 내역과 찜 상품을 확인하세요.' }}</p>
    </div>
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-3xl bg-white p-6 shadow-sm">
        <h3 class="text-xl font-black">주문 내역</h3>
        <article v-for="order in store.orders" :key="order.id" class="mt-4 rounded-2xl bg-slate-50 p-4">
          <div class="flex justify-between font-bold"><span>{{ order.id }}</span><span>{{ order.status }}</span></div>
          <p class="mt-1 text-sm text-slate-500">{{ order.createdAt }} · {{ formatPrice(order.total) }}원</p>
          <p class="mt-2 text-sm">{{ order.items.map((item) => `${item.productName} ${item.quantity}개`).join(', ') }}</p>
        </article>
      </div>
      <div class="rounded-3xl bg-white p-6 shadow-sm">
        <h3 class="text-xl font-black">찜한 상품</h3>
        <article v-for="product in store.wishlistProducts" :key="product.id" class="mt-4 flex gap-3 rounded-2xl bg-slate-50 p-3">
          <img :src="product.image" :alt="product.name" class="h-16 w-16 rounded-xl object-cover" />
          <div>
            <p class="font-bold">{{ product.name }}</p>
            <p class="text-sm text-slate-500">{{ formatPrice(product.price) }}원</p>
          </div>
        </article>
        <p v-if="!store.wishlistProducts.length" class="mt-4 text-sm text-slate-500">아직 찜한 상품이 없습니다.</p>
      </div>
    </div>
  </section>
</template>
