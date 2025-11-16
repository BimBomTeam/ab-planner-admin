import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Users from '@/views/Users.vue'
import Programs from '@/views/Programs.vue'
import Groups from '@/views/Groups.vue'
import Lessons from '@/views/Lessons.vue'
import Notifications from '@/views/Notifications.vue'
import StudentSelections from '@/views/StudentSelections.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  {
    path: '/programs',
    name: 'Programs',
    component: Programs
  },
  {
    path: '/groups',
    name: 'Groups',
    component: Groups
  },
  {
    path: '/lessons',
    name: 'Lessons',
    component: Lessons
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications
  },
  {
    path: '/student-selections',
    name: 'StudentSelections',
    component: StudentSelections
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router