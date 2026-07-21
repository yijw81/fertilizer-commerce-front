import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'products', component: () => import('../views/ProductListView.vue') },
  { path: '/crop-finder', name: 'crop-finder', component: () => import('../views/CropFinderView.vue') },
  { path: '/products/:id', name: 'product-detail', component: () => import('../views/ProductDetailView.vue') },
  { path: '/cart', name: 'cart', component: () => import('../views/CartView.vue') },
  { path: '/checkout', name: 'checkout', component: () => import('../views/CheckoutView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/ForgotPasswordView.vue') },
  { path: '/account', name: 'account', component: () => import('../views/AccountView.vue') },
  { path: '/payment-success', name: 'payment-success', component: () => import('../views/PaymentSuccessView.vue') },
  { path: '/payment-fail', name: 'payment-fail', component: () => import('../views/PaymentFailView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
