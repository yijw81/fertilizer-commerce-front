<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useShopStore } from '../store/shop'
import type { SocialProvider } from '../types/fertilizer'

const store = useShopStore()
const router = useRouter()

const handleEmailLogin = async () => {
  await store.loginEmail()
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
      <p class="mt-2 text-slate-500">목업 로그인입니다. 어떤 이메일/비밀번호든 로그인됩니다.</p>
      <div class="mt-6 space-y-3">
        <input v-model="store.email" class="input" type="email" placeholder="이메일" />
        <input v-model="store.password" class="input" type="password" placeholder="비밀번호" />
        <button class="primary-btn w-full" :disabled="store.isLoading" @click="handleEmailLogin">로그인</button>
      </div>
      <div class="mt-5 flex justify-between text-sm font-bold text-brand-700">
        <button>회원가입</button><button>비밀번호 찾기</button>
      </div>
    </div>
    <div class="rounded-[2rem] bg-slate-900 p-8 text-white shadow-soft">
      <h2 class="text-3xl font-black">소셜 로그인</h2>
      <p class="mt-2 text-slate-300">목업 소셜 로그인. 실제 OAuth 없이 바로 로그인됩니다.</p>
      <div class="mt-6 space-y-3">
        <button class="social-btn bg-white text-slate-900" @click="handleSocialLogin('google')">Google로 계속하기</button>
        <button class="social-btn bg-[#FEE500] text-slate-900" @click="handleSocialLogin('kakao')">Kakao로 계속하기</button>
        <button class="social-btn bg-[#03C75A] text-white" @click="handleSocialLogin('naver')">Naver로 계속하기</button>
      </div>
    </div>
  </section>
</template>
