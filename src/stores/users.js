import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = '/api/v1'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
    roles: [
      { id: 1, code: 'student', label: 'Student' },
      { id: 2, code: 'teacher', label: 'Wykładowca' },
      { id: 3, code: 'admin', label: 'Administrator' }
    ]
  }),

  getters: {
    allUsers: (state) => state.users,
    allRoles: (state) => state.roles,
    
    // Note: Backend might not return these flags directly, but we can infer or filter based on role object
    studentUsers: (state) => state.users.filter(user => user.role.code === 'student'),
    
    teacherUsers: (state) => state.users.filter(user => user.role.code === 'teacher'),
    
    adminUsers: (state) => state.users.filter(user => user.role.code === 'admin'),
    
    getUserById: (state) => (id) => state.users.find(user => user.id === id),
    
    getUsersByRole: (state) => (roleCode) => {
      return state.users.filter(user => user.role.code === roleCode)
    },
    
    getRoleIdByCode: (state) => (code) => {
      const role = state.roles.find(r => r.code === code)
      return role ? role.id : null
    }
  },

  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        this.users = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się pobrać listy użytkowników'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUnassignedStudents() {
      // Helper action if needed, though filtering fetchUsers might be enough
      // Depending on API capabilities. For now reusing fetchUsers + getter
      await this.fetchUsers()
      return this.studentUsers
    },

    async updateUserRole(userId, roleIdOrCode) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      let roleId = roleIdOrCode
      if (typeof roleIdOrCode === 'string') {
        const role = this.roles.find(r => r.code === roleIdOrCode)
        if (role) roleId = role.id
        else throw new Error('Invalid role code')
      }
      
      try {
        const response = await axios.patch(`${API_URL}/users/${userId}/role`, 
          { role_id: roleId },
          { headers: { Authorization: `Bearer ${authStore.token}` } }
        )
        
        // Update local state
        const index = this.users.findIndex(u => u.id === userId)
        if (index !== -1) {
          this.users[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się zmienić roli użytkownika'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
