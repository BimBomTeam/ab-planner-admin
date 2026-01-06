import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', {
    state: () => ({
        show: false,
        text: '',
        color: 'error',
        timeout: 5000
    }),
    actions: {
        showMessage(text, color = 'info') {
            this.text = text
            this.color = color
            this.show = true
        },
        showError(text) {
            this.showMessage(text, 'error')
        },
        showSuccess(text) {
            this.showMessage(text, 'success')
        }
    }
})
