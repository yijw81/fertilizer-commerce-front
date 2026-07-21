<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useShopStore } from '../../store/shop'
import type { Address } from '../../types/fertilizer'

const store = useShopStore()

const addressForm = ref<Omit<Address, 'id'>>({ label: '', receiverName: '', phone: '', address: '', detailAddress: '', isDefault: false })
const editingAddressId = ref<string | null>(null)
const showAddressForm = ref(false)
const addressError = ref('')

onMounted(() => {
  store.loadAddresses()
})

const openAddressForm = (addr?: Address) => {
  addressError.value = ''
  if (addr) {
    editingAddressId.value = addr.id
    addressForm.value = { label: addr.label, receiverName: addr.receiverName, phone: addr.phone, address: addr.address, detailAddress: addr.detailAddress, isDefault: addr.isDefault }
  } else {
    editingAddressId.value = null
    addressForm.value = { label: '', receiverName: '', phone: '', address: '', detailAddress: '', isDefault: false }
  }
  showAddressForm.value = true
}

const saveAddress = async () => {
  addressError.value = ''
  if (!addressForm.value.receiverName || !addressForm.value.phone || !addressForm.value.address) {
    addressError.value = '받는 사람, 연락처, 주소는 필수입니다.'
    return
  }
  try {
    await store.saveAddress(editingAddressId.value, addressForm.value)
    showAddressForm.value = false
  } catch (err) {
    addressError.value = err instanceof Error ? err.message : '저장에 실패했습니다.'
  }
}

const deleteAddress = async (id: string) => {
  if (!confirm('이 주소를 삭제하시겠습니까?')) return
  await store.deleteAddress(id)
}
</script>

<template>
  <div class="rounded-3xl bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-black">배송지 관리</h3>
      <button class="primary-btn text-sm" @click="openAddressForm()">+ 새 배송지</button>
    </div>

    <!-- 주소 목록 -->
    <div class="mt-4 space-y-3">
      <article v-for="addr in store.addresses" :key="addr.id" class="rounded-2xl border border-slate-100 p-4 transition hover:border-brand-200">
        <div class="flex items-start justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-black text-slate-600">{{ addr.label || '배송지' }}</span>
            <span v-if="addr.isDefault" class="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-black text-brand-700">기본</span>
          </div>
          <div class="flex shrink-0 gap-2 text-sm">
            <button v-if="!addr.isDefault" class="font-bold text-slate-400 hover:text-brand-600" @click="store.setDefaultAddress(addr.id)">기본 설정</button>
            <button class="font-bold text-slate-400 hover:text-brand-600" @click="openAddressForm(addr)">수정</button>
            <button class="font-bold text-red-300 hover:text-red-500" @click="deleteAddress(addr.id)">삭제</button>
          </div>
        </div>
        <p class="mt-2 font-bold">{{ addr.receiverName }} · {{ addr.phone }}</p>
        <p class="mt-0.5 text-sm text-slate-600">{{ addr.address }} {{ addr.detailAddress }}</p>
      </article>
      <p v-if="!store.addresses.length" class="py-8 text-center text-sm text-slate-500">등록된 배송지가 없습니다.</p>
    </div>

    <!-- 주소 추가/수정 폼 -->
    <div v-if="showAddressForm" class="mt-6 rounded-2xl bg-slate-50 p-5 space-y-3">
      <h4 class="font-black">{{ editingAddressId ? '배송지 수정' : '새 배송지 추가' }}</h4>
      <div class="grid gap-3 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-bold text-slate-600">배송지 이름</label>
          <input v-model="addressForm.label" class="input" placeholder="예: 집, 회사" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-slate-600">받는 사람 <span class="text-red-400">*</span></label>
          <input v-model="addressForm.receiverName" class="input" placeholder="받는 사람 이름" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-slate-600">연락처 <span class="text-red-400">*</span></label>
          <input v-model="addressForm.phone" class="input" placeholder="010-0000-0000" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-slate-600">주소 <span class="text-red-400">*</span></label>
          <input v-model="addressForm.address" class="input" placeholder="기본 주소" />
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs font-bold text-slate-600">상세 주소</label>
          <input v-model="addressForm.detailAddress" class="input" placeholder="상세 주소 (동/호수 등)" />
        </div>
        <div class="sm:col-span-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="addressForm.isDefault" class="h-4 w-4 rounded accent-brand-600" />
            <span class="text-sm font-bold text-slate-700">기본 배송지로 설정</span>
          </label>
        </div>
      </div>
      <p v-if="addressError" class="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600">{{ addressError }}</p>
      <div class="flex gap-2">
        <button class="primary-btn flex-1" :disabled="store.isLoading" @click="saveAddress">{{ store.isLoading ? '저장 중...' : '저장' }}</button>
        <button class="secondary-btn" @click="showAddressForm = false">취소</button>
      </div>
    </div>
  </div>
</template>
