import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [
      {
        id: 1,
        username: 'jan.kowalski',
        email: 'jan.kowalski@edu.pl',
        first_name: 'Jan',
        last_name: 'Kowalski',
        role: 'student',
        active: true,
        is_student: true,
        is_teacher: false,
        is_admin: false,
        program_id: 1,
        year: 2,
        specialization: 'Inżynieria oprogramowania',
        phone: '123-456-789'
      },
      {
        id: 2,
        username: 'anna.nowak',
        email: 'anna.nowak@edu.pl',
        first_name: 'Anna',
        last_name: 'Nowak',
        role: 'teacher',
        active: true,
        is_student: false,
        is_teacher: true,
        is_admin: false,
        program_id: null,
        year: null,
        specialization: null,
        phone: '987-654-321'
      },
      {
        id: 3,
        username: 'piotr.wisniak',
        email: 'piotr.wisniak@edu.pl',
        first_name: 'Piotr',
        last_name: 'Wiśniak',
        role: 'student',
        active: true,
        is_student: true,
        is_teacher: false,
        is_admin: false,
        program_id: 2,
        year: 1,
        specialization: 'Matematyka stosowana',
        phone: '555-123-456'
      },
      {
        id: 4,
        username: 'admin',
        email: 'admin@edu.pl',
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        active: true,
        is_student: false,
        is_teacher: false,
        is_admin: true,
        program_id: null,
        year: null,
        specialization: null,
        phone: '000-000-000'
      },
      {
        id: 5,
        username: 'dr.kowal',
        email: 'dr.kowal@edu.pl',
        first_name: 'Dr Jan',
        last_name: 'Kowal',
        role: 'teacher',
        active: true,
        is_student: false,
        is_teacher: true,
        is_admin: false,
        program_id: null,
        year: null,
        specialization: null,
        phone: '111-222-333'
      }
    ]
  }),

  getters: {
    allUsers: (state) => state.users,
    
    studentUsers: (state) => state.users.filter(user => user.is_student),
    
    teacherUsers: (state) => state.users.filter(user => user.is_teacher),
    
    adminUsers: (state) => state.users.filter(user => user.is_admin),
    
    activeUsers: (state) => state.users.filter(user => user.active),
    
    getUserById: (state) => (id) => state.users.find(user => user.id === id),
    
    getUsersByProgram: (state) => (programId) => 
      state.users.filter(user => user.program_id === programId),
    
    // UserSummary model format
    getUserSummary: (state) => (id) => {
      const user = state.users.find(user => user.id === id)
      if (!user) return null
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    },
    
    // UserProfile model format
    getUserProfile: (state) => (id) => {
      const user = state.users.find(user => user.id === id)
      if (!user) return null
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        active: user.active,
        is_student: user.is_student,
        is_teacher: user.is_teacher,
        is_admin: user.is_admin
      }
    },
    
    getUsersByRole: (state) => (roleCode) => {
      return state.users.filter(user => user.role === roleCode)
    }
  },
  
  actions: {
    addUser(userData) {
      const id = Math.max(...this.users.map(u => u.id), 0) + 1
      this.users.push({
        id,
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role || 'student',
        active: userData.active ?? true,
        is_student: userData.is_student ?? userData.role === 'student',
        is_teacher: userData.is_teacher ?? userData.role === 'teacher', 
        is_admin: userData.is_admin ?? userData.role === 'admin',
        program_id: userData.program_id || null,
        year: userData.year || null,
        specialization: userData.specialization || null,
        phone: userData.phone || ''
      })
    },
    
    updateUser(id, updates) {
      const index = this.users.findIndex(user => user.id === id)
      if (index !== -1) {
        // Update role-based flags if role changes
        if (updates.role) {
          updates.is_student = updates.role === 'student'
          updates.is_teacher = updates.role === 'teacher'
          updates.is_admin = updates.role === 'admin'
        }
        this.users[index] = { ...this.users[index], ...updates }
      }
    },
    
    deleteUser(id) {
      const index = this.users.findIndex(user => user.id === id)
      if (index !== -1) {
        this.users.splice(index, 1)
      }
    }
  }
})