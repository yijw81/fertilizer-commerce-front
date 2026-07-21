<script setup lang="ts">
import { useShopStore } from '../../store/shop'
import { formatPrice } from '../../utils/format'

const store = useShopStore()
</script>

<template>
  <div class="rounded-3xl bg-white p-6 shadow-sm">
    <h3 class="text-xl font-black">주문 내역</h3>
    <article v-for="order in store.orders" :key="order.id" class="mt-4 rounded-2xl bg-slate-50 p-4">
      <div class="flex justify-between font-bold">
        <span class="text-sm font-mono text-slate-600">{{ order.id }}</span>
        <span class="rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-700">{{ order.status }}</span>
      </div>
      <p class="mt-1 text-sm text-slate-500">{{ order.createdAt }} · {{ formatPrice(order.total) }}원</p>
      <p class="mt-2 text-sm text-slate-700">{{ order.items.map((item) => `${item.productName} ${item.quantity}개`).join(', ') }}</p>
    </article>
    <p v-if="!store.orders.length" class="mt-6 text-center text-sm text-slate-500">주문 내역이 없습니다.</p>
  </div>
</template>
