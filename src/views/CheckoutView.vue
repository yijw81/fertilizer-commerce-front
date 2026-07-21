<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'
import { formatPrice } from '../utils/format'

const store = useShopStore()
const router = useRouter()

const paymentMethods = ['신용카드', '간편결제', '무통장입금']

const handleCheckout = async () => {
  if (!store.user) {
    router.push({ name: 'login' })
    return
  }
  await store.checkout()
}
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-5 rounded-[2rem] bg-white p-8 shadow-soft">
    <h2 class="text-3xl font-black">주문/결제</h2>
    <div class="grid gap-4 md:grid-cols-2">
      <input class="input" placeholder="받는 사람" :value="store.user?.name ?? ''" />
      <input class="input" placeholder="연락처" value="010-0000-0000" />
      <input class="input md:col-span-2" placeholder="배송지" value="서울시 강남구 테헤란로 123" />
    </div>
    <div class="rounded-3xl bg-slate-50 p-5">
      <p class="font-black">결제 수단</p>
      <div class="mt-3 grid gap-2 md:grid-cols-3">
        <label v-for="method in paymentMethods" :key="method" class="rounded-2xl bg-white p-4 font-bold">
          <input name="pay" type="radio" class="mr-2" :checked="method === '신용카드'" />{{ method }}
        </label>
      </div>
    </div>
    <div class="flex gap-2">
      <input v-model="store.couponCode" class="input" placeholder="쿠폰 코드 (FARM10, GREEN5000)" />
      <button class="secondary-btn whitespace-nowrap" @click="store.applyCoupon">쿠폰 적용</button>
    </div>
    <p v-if="store.couponMessage" class="text-sm font-bold text-brand-700">{{ store.couponMessage }}</p>
    <div class="flex items-center justify-between rounded-3xl bg-slate-900 p-5 text-white">
      <span>총 결제금액</span>
      <strong class="text-2xl">{{ formatPrice(store.orderTotal) }}원</strong>
    </div>
    <button class="primary-btn w-full" :disabled="store.isLoading || !store.cartDetails.length" @click="handleCheckout">
      {{ store.isLoading ? '처리 중...' : '목업 결제하기' }}
    </button>
    <p v-if="store.checkoutMessage" class="rounded-2xl bg-green-50 p-4 font-bold text-green-700">{{ store.checkoutMessage }}</p>
  </section>
</template>
