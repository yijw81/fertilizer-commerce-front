<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'
import { formatPrice } from '../utils/format'
import NutrientBadges from '../components/NutrientBadges.vue'
import type { Product } from '../types/fertilizer'

const store = useShopStore()
const router = useRouter()

const selectedCropId = ref('')

watchEffect(() => {
  if (!selectedCropId.value && store.cropEffects.length) {
    selectedCropId.value = store.cropEffects[0].cropId
  }
})

const selectedCrop = computed(() => store.cropEffects.find((c) => c.cropId === selectedCropId.value))
const selectedCropProducts = computed(() => {
  if (!selectedCrop.value) return []
  return selectedCrop.value.recommendedProducts
    .map((rec) => ({ ...rec, product: store.findProduct(rec.productId) }))
    .filter((r): r is typeof r & { product: Product } => Boolean(r.product))
})
</script>

<template>
  <section class="space-y-8">
    <div>
      <h2 class="text-3xl font-black">🌱 작물로 비료 찾기</h2>
      <p class="mt-2 text-slate-500">재배 중인 작물을 선택하면 최적의 비료와 예상 효능을 안내해드립니다.</p>
    </div>

    <!-- 작물 선택 -->
    <div class="flex flex-wrap gap-3">
      <button
        v-for="crop in store.cropEffects"
        :key="crop.cropId"
        class="rounded-2xl px-5 py-3 text-lg font-black transition"
        :class="selectedCropId === crop.cropId ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-slate-700 shadow-sm hover:bg-brand-50'"
        @click="selectedCropId = crop.cropId"
      >
        {{ crop.cropIcon }} {{ crop.cropName }}
      </button>
    </div>

    <!-- 선택된 작물 결과 -->
    <div v-if="selectedCrop" class="space-y-6">
      <h3 class="text-2xl font-black">{{ selectedCrop.cropIcon }} {{ selectedCrop.cropName }}에 추천하는 비료</h3>

      <div v-for="rec in selectedCropProducts" :key="rec.productId" class="overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <div class="grid gap-0 lg:grid-cols-[300px_1fr]">
          <!-- 상품 정보 -->
          <div class="flex flex-col justify-between bg-brand-50 p-6">
            <div>
              <img :src="rec.product.image" :alt="rec.product.name" class="h-40 w-full rounded-2xl object-cover" />
              <p class="mt-3 text-xs font-bold text-brand-600">{{ rec.product.brand }}</p>
              <h4 class="mt-1 text-xl font-black">{{ rec.product.name }}</h4>
              <div class="mt-2">
                <NutrientBadges :nutrients="rec.product.nutrients" />
              </div>
              <p class="mt-3 text-2xl font-black">{{ formatPrice(rec.product.price) }}원</p>
            </div>
            <div class="mt-4 flex gap-2">
              <button class="primary-btn flex-1" @click="store.addToCart(rec.productId)">담기</button>
              <button class="secondary-btn" @click="router.push({ name: 'product-detail', params: { id: rec.productId } })">상세</button>
            </div>
          </div>

          <!-- 효능 정보 -->
          <div class="space-y-5 p-6">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-xs font-black uppercase tracking-widest text-slate-400">시비 시기</p>
                <p class="mt-1 font-bold text-slate-800">{{ rec.timing }}</p>
              </div>
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-xs font-black uppercase tracking-widest text-slate-400">시비 방법</p>
                <p class="mt-1 font-bold text-slate-800">{{ rec.dosage }}</p>
              </div>
            </div>

            <div>
              <p class="font-black text-brand-700">🌿 {{ selectedCrop.cropName }}에 나타나는 효능</p>
              <ul class="mt-3 space-y-2">
                <li v-for="effect in rec.effects" :key="effect" class="flex items-start gap-3 rounded-2xl bg-green-50 p-3">
                  <span class="mt-0.5 text-brand-600">✓</span>
                  <span class="text-sm font-bold text-slate-700">{{ effect }}</span>
                </li>
              </ul>
            </div>

            <div class="rounded-2xl border border-slate-100 p-4">
              <p class="text-xs font-black uppercase tracking-widest text-slate-400">적용 방법</p>
              <p class="mt-1 text-sm text-slate-600">{{ rec.product.applicationMethod }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
