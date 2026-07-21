<script setup lang="ts">
import { nutrientColor } from '../utils/format'
import type { NutrientInfo } from '../types/fertilizer'

const props = withDefaults(
  defineProps<{ nutrients: NutrientInfo; size?: 'sm' | 'base'; labeled?: boolean }>(),
  { size: 'sm', labeled: false },
)

const labels = { n: '질소(N)', p: '인산(P)', k: '칼륨(K)' }
const labelFor = (type: 'n' | 'p' | 'k') => (props.labeled ? labels[type] : type.toUpperCase())
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <span v-if="nutrients.n" :class="[nutrientColor('n'), 'nutrient-badge', size === 'base' ? 'text-sm' : '']">{{ labelFor('n') }} {{ nutrients.n }}%</span>
    <span v-if="nutrients.p" :class="[nutrientColor('p'), 'nutrient-badge', size === 'base' ? 'text-sm' : '']">{{ labelFor('p') }} {{ nutrients.p }}%</span>
    <span v-if="nutrients.k" :class="[nutrientColor('k'), 'nutrient-badge', size === 'base' ? 'text-sm' : '']">{{ labelFor('k') }} {{ nutrients.k }}%</span>
  </div>
</template>
