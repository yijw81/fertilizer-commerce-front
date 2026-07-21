<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'
import OrdersTab from '../components/account/OrdersTab.vue'
import WishlistTab from '../components/account/WishlistTab.vue'
import AddressesTab from '../components/account/AddressesTab.vue'
import PasswordTab from '../components/account/PasswordTab.vue'

type AccountTab = 'orders' | 'wishlist' | 'addresses' | 'password'
const TABS: [AccountTab, string][] = [
  ['orders', '주문 내역'],
  ['wishlist', '찜한 상품'],
  ['addresses', '배송지 관리'],
  ['password', '비밀번호 변경'],
]

const store = useShopStore()
const router = useRouter()
const route = useRoute()

const accountTab = computed<AccountTab>(() => {
  const tab = route.query.tab
  return TABS.some(([key]) => key === tab) ? (tab as AccountTab) : 'orders'
})

const selectTab = (tab: AccountTab) => {
  router.replace({ name: 'account', query: { tab } })
}

const handleLogout = () => {
  store.logout()
  router.push({ name: 'products' })
}
</script>

<template>
  <section class="space-y-6">
    <!-- 프로필 헤더 -->
    <div class="rounded-[2rem] bg-white p-8 shadow-soft">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-bold text-brand-600">{{ store.user?.membership ?? 'GUEST' }} MEMBER</p>
          <h2 class="mt-1 text-3xl font-black">{{ store.user?.name ?? '게스트' }}님, 안녕하세요</h2>
          <p class="mt-1 text-slate-500">{{ store.user?.email ?? '로그인 후 이용해주세요.' }}</p>
        </div>
        <button v-if="store.user" class="secondary-btn text-sm" @click="handleLogout">로그아웃</button>
      </div>
    </div>

    <!-- 탭 -->
    <div class="flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm">
      <button
        v-for="tab in TABS"
        :key="tab[0]"
        class="whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition"
        :class="accountTab === tab[0] ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100'"
        @click="selectTab(tab[0])"
      >
        {{ tab[1] }}
      </button>
    </div>

    <OrdersTab v-if="accountTab === 'orders'" />
    <WishlistTab v-if="accountTab === 'wishlist'" />
    <AddressesTab v-if="accountTab === 'addresses'" />
    <PasswordTab v-if="accountTab === 'password'" />
  </section>
</template>
