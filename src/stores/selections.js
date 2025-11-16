import { defineStore } from 'pinia'

export const useSelectionsStore = defineStore('selections', {
  state: () => ({
    selections: [
      {
        id: 1,
        user_id: 3,
        group_id: 1,
        selected_at: '2024-11-10T10:00:00Z'
      },
      {
        id: 2,
        user_id: 3,
        group_id: 2,
        selected_at: '2024-11-10T10:05:00Z'
      },
      {
        id: 3,
        user_id: 4,
        group_id: 1,
        selected_at: '2024-11-11T14:30:00Z'
      },
      {
        id: 4,
        user_id: 4,
        group_id: 3,
        selected_at: '2024-11-12T09:15:00Z'
      }
    ]
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
    addSelection(selection) {
      // Check if user is already in this group
      const existing = this.selections.find(s => 
        s.user_id === selection.user_id && s.group_id === selection.group_id
      )
      
      if (!existing) {
        const id = Math.max(...this.selections.map(s => s.id)) + 1
        this.selections.push({
          ...selection,
          id,
          selected_at: new Date().toISOString()
        })
      }
    },
    
    removeSelection(userId, groupId) {
      const index = this.selections.findIndex(selection => 
        selection.user_id === userId && selection.group_id === groupId
      )
      if (index !== -1) {
        this.selections.splice(index, 1)
      }
    },
    
    deleteSelection(id) {
      const index = this.selections.findIndex(selection => selection.id === id)
      if (index !== -1) {
        this.selections.splice(index, 1)
      }
    }
  }
})