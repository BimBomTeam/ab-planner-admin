import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_URL = '/api/v1'

export const useProgramsStore = defineStore('programs', {
  state: () => ({
    programs: [],
    loading: false,
    error: null
  }),
  
  getters: {
    allPrograms: (state) => state.programs,
    
    getProgramById: (state) => (id) => {
      return state.programs.find(program => program.id === id)
    }
  },
  
  actions: {
    async fetchPrograms() {
      const authStore = useAuthStore()
      this.loading = true
      try {
        const response = await axios.get(`${API_URL}/programs`)
        this.programs = response.data
      } catch (error) {
        console.error('Error fetching programs:', error)
        this.error = error
      } finally {
        this.loading = false
      }
    },
    
    async addProgram(programData) {
      const authStore = useAuthStore()
      this.loading = true
      try {
        await axios.post(`${API_URL}/programs`, programData)
        await this.fetchPrograms()
      } catch (error) {
        console.error('Error adding program:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateProgram(id, programData) {
      const authStore = useAuthStore()
      this.loading = true
      try {
        // API expects { name: "..." }, but UI might pass full object
        const payload = { name: programData.name }
        await axios.patch(`${API_URL}/programs/${id}`, payload)
        await this.fetchPrograms()
      } catch (error) {
        console.error('Error updating program:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteProgram(id) {
      const authStore = useAuthStore()
      this.loading = true
      try {
        await axios.delete(`${API_URL}/programs/${id}`)
        await this.fetchPrograms()
      } catch (error) {
        console.error('Error deleting program:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Program Years
    async addYear(programId, year) {
        const authStore = useAuthStore()
        try {
            await axios.post(`${API_URL}/program-years`, { program_id: programId, year: year })
            await this.fetchPrograms() // Refresh to get updated nested structure
        } catch (error) {
            console.error('Error adding program year:', error)
            throw error
        }
    },

    async deleteYear(yearId) {
        const authStore = useAuthStore()
        try {
            await axios.delete(`${API_URL}/program-years/${yearId}`)
             await this.fetchPrograms()
        } catch (error) {
            console.error('Error deleting program year:', error)
            throw error
        }
    },

    // Specializations
    async addSpecialization(programId, name) {
        const authStore = useAuthStore()
        try {
            await axios.post(`${API_URL}/specializations`, { program_id: programId, name: name })
            await this.fetchPrograms()
        } catch (error) {
            console.error('Error adding specialization:', error)
            throw error
        }
    },

    async deleteSpecialization(specId) {
        const authStore = useAuthStore()
        try {
            await axios.delete(`${API_URL}/specializations/${specId}`)
            await this.fetchPrograms()
        } catch (error) {
            console.error('Error deleting specialization:', error)
            throw error
        }
    }
  }
})
