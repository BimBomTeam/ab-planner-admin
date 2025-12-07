import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = '/api/v1'

export const useSelectionsStore = defineStore('selections', {
  state: () => ({
    selections: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getSelectionById: (state) => (id) => {
      return state.selections.find(selection => selection.id === id)
    },
    getSelectionsByUser: (state) => (userId) => {
      return state.selections.filter(selection => selection.user_id === userId)
    },
    getSelectionsByGroup: (state) => (groupId) => {
      return state.selections.filter(selection => selection.group_id === groupId)
    },
    getUsersInGroup: (state) => (groupId) => {
      return state.selections
        .filter(selection => selection.group_id === groupId)
        .map(selection => selection.user_id)
    }
  },
  
  actions: {
    async fetchSelections() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`${API_URL}/student-group-selection`)
        this.selections = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się pobrać wyborów'
        throw error
      } finally {
        this.loading = false
      }
    },

    async addSelection(selectionData) {
      this.loading = true
      this.error = null
      try {
        const payload = {
            user_id: parseInt(selectionData.user_id),
            group_id: parseInt(selectionData.group_id)
        }
        // API uses PUT for upsert
        const response = await axios.put(`${API_URL}/student-group-selection`, payload)
        
        // The API returns the created/updated selection object
        // We should check if it already exists in our list to update or push
        const index = this.selections.findIndex(s => s.id === response.data.id)
        if (index !== -1) {
            this.selections[index] = response.data
        } else {
            this.selections.push(response.data)
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się dodać wyboru'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteSelection(id) {
      this.loading = true
      this.error = null
      try {
        const selection = this.getSelectionById(id)
        if (!selection) {
            throw new Error('Selection not found locally')
        }

        // API uses DELETE with query params, not ID
        await axios.delete(`${API_URL}/student-group-selection`, {
            params: {
                user_id: selection.user_id,
                group_id: selection.group_id
            }
        })
        
        this.selections = this.selections.filter(s => s.id !== id)
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się usunąć wyboru'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})