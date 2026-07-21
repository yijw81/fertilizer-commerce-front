<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'

const route = useRoute()
const router = useRouter()
const store = useShopStore()

onMounted(async () => {
  const paymentKey = typeof route.query.paymentKey === 'string' ? route.query.paymentKey : undefined
  const orderId = typeof route.query.orderId === 'string' ? route.query.orderId : undefined
  const amount = route.query.amount ? Number(route.query.amount) : undefined

  await store.confirmPendingPayment({ paymentKey, orderId, amount })
  router.replace({ name: 'payment-success' })
})
</script>

<template>
  <section class="mx-auto max-w-xl space-y-6 rounded-[2rem] bg-white p-10 text-center shadow-soft">
    <div class="flex flex-col items-center gap-4">
      <div class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">✅</div>
      <h2 class="text-3xl font-black">결제 완료!</h2>
      <p class="text-slate-500">주문이 성공적으로 완료되었습니다.</p>
      <p v-if="store.checkoutMessage" class="rounded-xl bg-slate-50 px-4 py-2 text-sm font-mono text-slate-600">주문번호: {{ store.checkoutMessage }}</p>
    </div>
    <div class="flex gap-3">
      <button class="secondary-btn flex-1" @click="router.push({ name: 'account' })">주문 내역 보기</button>
      <button class="primary-btn flex-1" @click="router.push({ name: 'products' })">쇼핑 계속하기</button>
    </div>
  </section>
</template>
