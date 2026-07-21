<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'

const store = useShopStore()
const router = useRouter()

const forgotEmail = ref('')
const forgotStep = ref<'input' | 'sent'>('input')
const forgotError = ref('')

const forgotPassword = async () => {
  forgotError.value = ''
  try {
    await store.forgotPassword(forgotEmail.value)
    forgotStep.value = 'sent'
  } catch (err) {
    forgotError.value = err instanceof Error ? err.message : '요청에 실패했습니다. 다시 시도해주세요.'
  }
}
</script>

<template>
  <section class="mx-auto max-w-lg rounded-[2rem] bg-white p-8 shadow-soft">
    <template v-if="forgotStep === 'input'">
      <div>
        <h2 class="text-3xl font-black">비밀번호 찾기</h2>
        <p class="mt-2 text-slate-500">가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
      </div>
      <div class="mt-6 space-y-3">
        <div>
          <label class="mb-1 block text-sm font-bold text-slate-700">이메일</label>
          <input
            v-model="forgotEmail"
            class="input"
            type="email"
            placeholder="가입 이메일을 입력하세요"
            @keyup.enter="forgotPassword"
          />
        </div>
        <p v-if="forgotError" class="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600">{{ forgotError }}</p>
        <button
          class="primary-btn w-full"
          :disabled="store.isLoading || !forgotEmail"
          @click="forgotPassword"
        >
          {{ store.isLoading ? '처리 중...' : '재설정 링크 보내기' }}
        </button>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col items-center gap-4 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-4xl">📧</div>
        <h2 class="text-2xl font-black">이메일을 확인하세요</h2>
        <p class="text-slate-500">
          <span class="font-bold text-slate-800">{{ forgotEmail }}</span>으로<br />비밀번호 재설정 링크를 보내드렸습니다.
        </p>
        <p class="text-sm text-slate-400">이메일이 오지 않으면 스팸함을 확인하거나 아래 버튼을 눌러 다시 시도해주세요.</p>
        <button
          class="secondary-btn"
          @click="forgotStep = 'input'"
        >
          다시 시도하기
        </button>
      </div>
    </template>
    <p class="mt-6 text-center text-sm text-slate-500">
      <button class="font-bold text-brand-700" @click="router.push({ name: 'login' })">로그인으로 돌아가기</button>
    </p>
  </section>
</template>
