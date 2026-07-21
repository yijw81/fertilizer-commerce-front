<script setup lang="ts">
import { ref } from 'vue'
import { useShopStore } from '../../store/shop'

const store = useShopStore()

const pwCurrent = ref('')
const pwNew = ref('')
const pwNewConfirm = ref('')
const pwError = ref('')
const pwSuccess = ref(false)

const changePassword = async () => {
  pwError.value = ''
  pwSuccess.value = false
  if (pwNew.value !== pwNewConfirm.value) { pwError.value = '새 비밀번호가 일치하지 않습니다.'; return }
  if (pwNew.value.length < 8) { pwError.value = '비밀번호는 8자 이상이어야 합니다.'; return }
  try {
    await store.changePassword(pwCurrent.value, pwNew.value)
    pwSuccess.value = true
    pwCurrent.value = ''
    pwNew.value = ''
    pwNewConfirm.value = ''
  } catch (err) {
    pwError.value = err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.'
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-sm">
    <h3 class="text-xl font-black">비밀번호 변경</h3>
    <div class="mt-4 space-y-3">
      <div>
        <label class="mb-1 block text-sm font-bold text-slate-700">현재 비밀번호</label>
        <input v-model="pwCurrent" class="input" type="password" placeholder="현재 비밀번호" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-bold text-slate-700">새 비밀번호</label>
        <input v-model="pwNew" class="input" type="password" placeholder="8자 이상 입력하세요" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-bold text-slate-700">새 비밀번호 확인</label>
        <input v-model="pwNewConfirm" class="input" type="password" placeholder="새 비밀번호를 다시 입력하세요" @keyup.enter="changePassword" />
      </div>
      <p v-if="pwError" class="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600">{{ pwError }}</p>
      <p v-if="pwSuccess" class="rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700">비밀번호가 성공적으로 변경되었습니다.</p>
      <button
        class="primary-btn w-full"
        :disabled="store.isLoading || !pwCurrent || !pwNew || !pwNewConfirm"
        @click="changePassword"
      >
        {{ store.isLoading ? '처리 중...' : '비밀번호 변경' }}
      </button>
    </div>
  </div>
</template>
