import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Dashboard from '@/views/Dashboard.vue'
import Users from '@/views/Users.vue'
import Programs from '@/views/Programs.vue'
import Groups from '@/views/Groups.vue'
import Lessons from '@/views/Lessons.vue'
import Notifications from '@/views/Notifications.vue'
import StudentSelections from '@/views/StudentSelections.vue'
import Login from '@/views/Login.vue'
import AuthCallback from '@/views/AuthCallback.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
    meta: { requiresGuest: false, skipAuth: true }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAuth: true }
  },
  {
    path: '/programs',
    name: 'Programs',
    component: Programs,
    meta: { requiresAuth: true }
  },
  {
    path: '/groups',
    name: 'Groups',
    component: Groups,
    meta: { requiresAuth: true }
  },
  {
    path: '/lessons',
    name: 'Lessons',
    component: Lessons,
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { requiresAuth: true }
  },
  {
    path: '/student-selections',
    name: 'StudentSelections',
    component: StudentSelections,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Skip auth checks for routes with skipAuth meta
  const skipAuth = to.matched.some(record => record.meta.skipAuth)

  if (skipAuth) {
    next()
    return
  }

  // Check if user is authenticated
  authStore.checkAuth()

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    // Redirect to dashboard if trying to access guest-only route while logged in
    next('/dashboard')
  } else {
    next()
  }
})

export default router