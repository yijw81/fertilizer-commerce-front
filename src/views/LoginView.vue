<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'
import type { SocialProvider } from '../types/fertilizer'

const store = useShopStore()
const router = useRouter()

const email = ref('')
const password = ref('')

const handleEmailLogin = async () => {
  if (store.isLoading) return
  await store.loginEmail(email.value, password.value)
  router.push({ name: 'account' })
}

const handleSocialLogin = async (provider: SocialProvider) => {
  await store.loginSocial(provider)
  router.push({ name: 'account' })
}
</script>

<template>
  <section class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
    <div class="rounded-[2rem] bg-white p-8 shadow-soft">
      <h2 class="text-3xl font-black">이메일 로그인</h2>
      <p class="mt-2 text-slate-500">이메일과 비밀번호로 로그인하세요.</p>
      <div class="mt-6 space-y-3">
        <input v-model="email" class="input" type="email" placeholder="이메일" />
        <input v-model="password" class="input" type="password" placeholder="비밀번호" @keyup.enter="handleEmailLogin" />
        <button class="primary-btn w-full" :disabled="store.isLoading" @click="handleEmailLogin">로그인</button>
      </div>
      <div class="mt-5 flex justify-between text-sm font-bold text-brand-700">
        <button @click="router.push({ name: 'register' })">회원가입</button>
        <button @click="router.push({ name: 'forgot-password' })">비밀번호 찾기</button>
      </div>
    </div>
    <div class="rounded-[2rem] bg-slate-900 p-8 text-white shadow-soft">
      <h2 class="text-3xl font-black">소셜 로그인</h2>
      <p class="mt-2 text-slate-300">소셜 계정으로 간편하게 로그인하세요.</p>
      <div class="mt-6 space-y-3">
        <button class="social-btn bg-white text-slate-900" @click="handleSocialLogin('google')">Google로 계속하기</button>
        <button class="social-btn bg-[#FEE500] text-slate-900" @click="handleSocialLogin('kakao')">Kakao로 계속하기</button>
        <button class="social-btn bg-[#03C75A] text-white" @click="handleSocialLogin('naver')">Naver로 계속하기</button>
      </div>
    </div>
  </section>
</template>
