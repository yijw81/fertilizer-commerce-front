<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'
import { formatPrice } from '../utils/format'

const store = useShopStore()
const router = useRouter()
</script>

<template>
  <section class="grid gap-8 lg:grid-cols-[1fr_360px]">
    <div class="space-y-4">
      <h2 class="text-3xl font-black">장바구니</h2>
      <article v-for="item in store.cartDetails" :key="`${item.productId}-${item.optionLabel}`" class="flex gap-4 rounded-3xl bg-white p-4 shadow-sm">
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
            <button class="qty-btn" @click="store.updateQuantity(item.productId, item.optionLabel, item.quantity - 1)">-</button>
            <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
            <button class="qty-btn" @click="store.updateQuantity(item.productId, item.optionLabel, item.quantity + 1)">+</button>
          </div>
        </div>
      </article>
      <div v-if="!store.cartDetails.length" class="rounded-3xl bg-white p-10 text-center shadow-sm">
        <p class="text-5xl">🧺</p>
        <p class="mt-4 font-bold text-slate-500">장바구니가 비어 있습니다.</p>
        <button class="primary-btn mt-5" @click="router.push({ name: 'products' })">상품 보러가기</button>
      </div>
    </div>
    <aside class="h-fit rounded-3xl bg-white p-6 shadow-soft">
      <h3 class="text-xl font-black">주문 요약</h3>
      <dl class="mt-5 space-y-3 text-sm">
        <div class="flex justify-between"><dt>상품 금액</dt><dd>{{ formatPrice(store.subtotal) }}원</dd></div>
        <div class="flex justify-between"><dt>배송비</dt><dd>{{ store.shippingFee === 0 ? '무료' : formatPrice(store.shippingFee) + '원' }}</dd></div>
        <div class="flex justify-between text-brand-700"><dt>할인</dt><dd>-{{ formatPrice(store.discount) }}원</dd></div>
        <div class="flex justify-between border-t pt-4 text-xl font-black"><dt>결제 예정</dt><dd>{{ formatPrice(store.orderTotal) }}원</dd></div>
      </dl>
      <p class="mt-3 text-xs text-slate-400">5만원 이상 구매 시 무료 배송</p>
      <button class="primary-btn mt-6 w-full" :disabled="!store.cartDetails.length" @click="router.push({ name: 'checkout' })">주문하기</button>
    </aside>
  </section>
</template>
