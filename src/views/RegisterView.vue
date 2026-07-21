<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'

const store = useShopStore()
const router = useRouter()

const registerName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerPasswordConfirm = ref('')
const registerError = ref('')

const register = async () => {
  registerError.value = ''
  if (registerPassword.value !== registerPasswordConfirm.value) {
    registerError.value = '비밀번호가 일치하지 않습니다.'
    return
  }
  if (registerPassword.value.length < 8) {
    registerError.value = '비밀번호는 8자 이상이어야 합니다.'
    return
  }
  try {
    await store.register(registerName.value, registerEmail.value, registerPassword.value)
    router.push({ name: 'account' })
  } catch (err) {
    registerError.value = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
  }
}
</script>

<template>
  <section class="mx-auto max-w-lg space-y-6 rounded-[2rem] bg-white p-8 shadow-soft">
    <div>
      <h2 class="text-3xl font-black">회원가입</h2>
      <p class="mt-2 text-slate-500">비료 쇼핑몰의 다양한 혜택을 누려보세요.</p>
    </div>
    <div class="space-y-3">
      <div>
        <label class="mb-1 block text-sm font-bold text-slate-700">이름</label>
        <input v-model="registerName" class="input" type="text" placeholder="이름을 입력하세요" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-bold text-slate-700">이메일</label>
        <input v-model="registerEmail" class="input" type="email" placeholder="이메일을 입력하세요" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-bold text-slate-700">비밀번호</label>
        <input v-model="registerPassword" class="input" type="password" placeholder="8자 이상 입력하세요" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-bold text-slate-700">비밀번호 확인</label>
        <input
          v-model="registerPasswordConfirm"
          class="input"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          @keyup.enter="register"
        />
      </div>
      <p v-if="registerError" class="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600">{{ registerError }}</p>
      <button
        class="primary-btn w-full"
        :disabled="store.isLoading || !registerName || !registerEmail || !registerPassword || !registerPasswordConfirm"
        @click="register"
      >
        {{ store.isLoading ? '처리 중...' : '회원가입' }}
      </button>
    </div>
    <p class="text-center text-sm text-slate-500">
      이미 계정이 있으신가요?
      <button class="font-bold text-brand-700" @click="router.push({ name: 'login' })">로그인</button>
    </p>
  </section>
</template>
