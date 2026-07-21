import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'products', component: () => import('../views/ProductListView.vue') },
  { path: '/crop-finder', name: 'crop-finder', component: () => import('../views/CropFinderView.vue') },
  { path: '/products/:id', name: 'product-detail', component: () => import('../views/ProductDetailView.vue') },
  { path: '/cart', name: 'cart', component: () => import('../views/CartView.vue') },
  { path: '/checkout', name: 'checkout', component: () => import('../views/CheckoutView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/account', name: 'account', component: () => import('../views/AccountView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
