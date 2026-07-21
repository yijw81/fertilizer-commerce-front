<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'

const route = useRoute()
const router = useRouter()
const store = useShopStore()

onMounted(() => {
  const message = typeof route.query.message === 'string' ? route.query.message : '결제가 취소되었습니다.'
  store.restorePendingCartAfterFailure(message)
  router.replace({ name: 'payment-fail' })
})
</script>

<template>
  <section class="mx-auto max-w-xl space-y-6 rounded-[2rem] bg-white p-10 text-center shadow-soft">
    <div class="flex flex-col items-center gap-4">
      <div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">❌</div>
      <h2 class="text-3xl font-black">결제 실패</h2>
      <p class="text-slate-500">{{ store.paymentError }}</p>
    </div>
    <div class="flex gap-3">
      <button class="secondary-btn flex-1" @click="router.push({ name: 'products' })">쇼핑 계속하기</button>
      <button class="primary-btn flex-1" @click="router.push({ name: 'checkout' })">다시 시도하기</button>
    </div>
  </section>
</template>
