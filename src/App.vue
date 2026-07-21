<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useShopStore } from './store/shop'

const store = useShopStore()

onMounted(() => {
  store.loadInitialData()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AppHeader />
    <main class="mx-auto max-w-7xl px-4 py-8">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>
