import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = '/api/v1'

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    groups: [],
    loading: false,
    error: null,
    groupTypes: [
      { code: 'lecture', label: 'Wykład' },
      { code: 'lab', label: 'Laboratorium' },
      { code: 'seminar', label: 'Seminarium' },
      { code: 'project', label: 'Projekt' }
    ]
  }),

  getters: {
    getGroupById: (state) => (id) => {
      return state.groups.find(group => group.id === id)
    },
    getGroupsByProgram: (state) => (programId) => {
      return state.groups.filter(group => group.program.id === programId)
    },
    getGroupsByType: (state) => (groupType) => {
      return state.groups.filter(group => group.group_type.code === groupType)
    }
  },

  actions: {
    async fetchGroups(filters = {}) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const params = new URLSearchParams()
        if (filters.program_id) params.append('program_id', filters.program_id)
        if (filters.program_year_id) params.append('program_year_id', filters.program_year_id)
        if (filters.specialization_id) params.append('specialization_id', filters.specialization_id)
        if (filters.group_type) params.append('group_type', filters.group_type)

        const response = await axios.get(`${API_URL}/groups`, {
          params
        })
        this.groups = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się pobrać listy grup'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createGroup(groupData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const payload = {
            ...groupData,
            program_id: parseInt(groupData.program_id),
            program_year_id: parseInt(groupData.program_year_id),
            specialization_id: parseInt(groupData.specialization_id)
        }

        const response = await axios.post(`${API_URL}/groups`, payload)
        this.groups.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się utworzyć grupy'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateGroup(id, groupData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const response = await axios.patch(`${API_URL}/groups/${id}`, groupData)
        const index = this.groups.findIndex(g => g.id === id)
        if (index !== -1) {
          this.groups[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się zaktualizować grupy'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteGroup(id) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        await axios.delete(`${API_URL}/groups/${id}`)
        this.groups = this.groups.filter(g => g.id !== id)
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się usunąć grupy'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
