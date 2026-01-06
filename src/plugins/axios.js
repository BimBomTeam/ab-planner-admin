import axios from 'axios'
import { useSnackbarStore } from '@/stores/snackbar'

export function setupAxios() {
    axios.interceptors.response.use(
        response => response,
        error => {
            const snackbar = useSnackbarStore()
            // Skip if error was cancelled or no response
            if (!error.response) {
                if (axios.isCancel(error)) {
                    return Promise.reject(error)
                }
                snackbar.showError('Błąd połączenia z serwerem.')
                return Promise.reject(error)
            }

            const status = error.response.status
            const detail = error.response.data?.detail

            if (detail) {
                // Handle "still in use" errors specifically
                if (typeof detail === 'string' && (detail.includes('still in use') || detail.includes('is used by'))) {
                    snackbar.showError('Nie można usunąć elementu, ponieważ jest on powiązany z innymi danymi (np. zajęciami, grupami). Usuń najpierw powiązane elementy.')
                } else if (status === 403 || status === 401) {
                    // Auth errors handled mostly by router/auth store, but we can show message if needed
                    // snackbar.showError('Brak uprawnień.')
                } else {
                    // Show the backend error message directly for other cases
                    // translating if possible or using raw
                    snackbar.showError(detail)
                }
            } else {
                snackbar.showError(`Wystąpił błąd: ${status}`)
            }
            return Promise.reject(error)
        }
    )
}
