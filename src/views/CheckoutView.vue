<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'
import type { PaymentMethodType, PaymentOption } from '../store/shop'
import { formatPrice } from '../utils/format'

const store = useShopStore()
const router = useRouter()

const paymentMethodTab = ref<PaymentMethodType>('normal')
const selectedPaymentOption = ref<PaymentOption>('CARD')

const selectNormal = () => {
  paymentMethodTab.value = 'normal'
  selectedPaymentOption.value = 'CARD'
}
const selectSimple = () => {
  paymentMethodTab.value = 'simple'
  selectedPaymentOption.value = 'KAKAOPAY'
}

const handleCheckout = async () => {
  if (!store.user) {
    router.push({ name: 'login' })
    return
  }
  await store.checkout(selectedPaymentOption.value)
}
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-6 rounded-[2rem] bg-white p-8 shadow-soft">
    <h2 class="text-3xl font-black">주문/결제</h2>

    <!-- 배송 정보 -->
    <div class="space-y-3">
      <h3 class="text-lg font-black">배송 정보</h3>
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model="store.receiverName" class="input" :placeholder="store.user?.name ?? '받는 사람'" />
        <input v-model="store.receiverPhone" class="input" placeholder="연락처" />
        <input v-model="store.deliveryAddress" class="input md:col-span-2" placeholder="배송지" />
      </div>
    </div>

    <!-- 쿠폰 -->
    <div class="space-y-2">
      <h3 class="text-lg font-black">할인 쿠폰</h3>
      <div class="flex gap-2">
        <input v-model="store.couponCode" class="input" placeholder="쿠폰 코드 (FARM10, GREEN5000)" />
        <button class="secondary-btn whitespace-nowrap" @click="store.applyCoupon">쿠폰 적용</button>
      </div>
      <p v-if="store.couponMessage" class="text-sm font-bold text-brand-700">{{ store.couponMessage }}</p>
    </div>

    <!-- 결제 수단 -->
    <div class="space-y-4">
      <h3 class="text-lg font-black">결제 수단</h3>

      <!-- 탭 -->
      <div class="relative grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          class="relative z-10 rounded-lg py-2 text-sm font-bold transition-colors"
          :class="paymentMethodTab === 'normal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
          @click="selectNormal"
        >신용/체크카드</button>
        <button
          class="relative z-10 rounded-lg py-2 text-sm font-bold transition-colors"
          :class="paymentMethodTab === 'simple' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
          @click="selectSimple"
        >간편결제</button>
      </div>

      <!-- 일반 결제 -->
      <div v-if="paymentMethodTab === 'normal'" class="flex gap-3">
        <label class="payment-card" :class="{ 'payment-card--active': selectedPaymentOption === 'CARD' }">
          <input type="radio" name="payment" value="CARD" v-model="selectedPaymentOption" class="sr-only" />
          <span class="text-2xl">💳</span>
          <span class="text-sm font-bold">카드 결제</span>
        </label>
      </div>

      <!-- 간편결제 -->
      <div v-if="paymentMethodTab === 'simple'" class="flex gap-3">
        <label class="payment-card" :class="{ 'payment-card--active': selectedPaymentOption === 'KAKAOPAY' }">
          <input type="radio" name="payment" value="KAKAOPAY" v-model="selectedPaymentOption" class="sr-only" />
          <span class="text-xl font-black text-[#3A1D1D]" style="font-family: sans-serif;">kakao<span class="text-[#FFE500]">pay</span></span>
        </label>
        <label class="payment-card" :class="{ 'payment-card--active': selectedPaymentOption === 'TOSSPAY' }">
          <input type="radio" name="payment" value="TOSSPAY" v-model="selectedPaymentOption" class="sr-only" />
          <span class="text-xl font-black text-[#0064FF]">toss<span class="text-[#0064FF]">pay</span></span>
        </label>
        <label class="payment-card" :class="{ 'payment-card--active': selectedPaymentOption === 'NAVERPAY' }">
          <input type="radio" name="payment" value="NAVERPAY" v-model="selectedPaymentOption" class="sr-only" />
          <span class="text-xl font-black text-[#03C75A]">N<span class="text-slate-800">pay</span></span>
        </label>
      </div>
    </div>

    <!-- 최종 금액 -->
    <div class="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2 text-sm">
      <div class="flex justify-between"><span class="text-slate-500">상품 금액</span><span>{{ formatPrice(store.subtotal) }}원</span></div>
      <div class="flex justify-between"><span class="text-slate-500">배송비</span><span>{{ store.shippingFee === 0 ? '무료' : formatPrice(store.shippingFee) + '원' }}</span></div>
      <div v-if="store.discount" class="flex justify-between text-brand-700"><span>할인</span><span>-{{ formatPrice(store.discount) }}원</span></div>
      <div class="flex justify-between border-t border-slate-200 pt-3 text-xl font-black">
        <span>총 결제금액</span>
        <span class="text-brand-700">{{ formatPrice(store.orderTotal) }}원</span>
      </div>
    </div>

    <button
      class="primary-btn w-full py-4 text-lg"
      :disabled="store.isLoading || !store.cartDetails.length"
      @click="handleCheckout"
    >
      {{ store.isLoading ? '처리 중...' : `${formatPrice(store.orderTotal)}원 결제하기` }}
    </button>

    <ul class="space-y-1 pl-4 text-xs text-slate-400 list-disc">
      <li>결제는 토스페이먼츠를 통해 안전하게 처리됩니다.</li>
      <li>주문 완료 후 마이페이지에서 주문 내역을 확인할 수 있습니다.</li>
      <li>결제 취소는 배송 준비 전까지 가능합니다.</li>
    </ul>
  </section>
</template>
