<template>
    <div class="calendar-tab">
        <div
            class="d-flex flex-column flex-md-row justify-md-space-between align-center mb-6 text-center text-md-left gap-4">
            <div class="d-flex flex-column flex-sm-row align-center mb-4 mb-md-0">
                <div class="d-flex align-center mb-2 mb-sm-0">
                    <v-btn icon="mdi-chevron-left" variant="text" @click="prevWeek"></v-btn>
                    <v-btn variant="text" class="mx-2" @click="today">Dzisiaj</v-btn>
                    <v-btn icon="mdi-chevron-right" variant="text" @click="nextWeek"></v-btn>
                </div>
                <h2 class="text-subtitle-1 text-sm-h6 ml-sm-4 font-weight-medium">{{ dateRangeText }}</h2>
            </div>

            <v-btn color="primary" variant="tonal" @click="openAddDialog" :disabled="!canAddLesson" block
                class="d-md-none">
                <v-icon class="mr-2">mdi-plus</v-icon>
                Dodaj zajęcia
            </v-btn>

            <v-btn color="primary" variant="tonal" @click="openAddDialog" :disabled="!canAddLesson"
                class="d-none d-md-flex">
                <v-icon class="mr-2">mdi-plus</v-icon>
                Dodaj zajęcia
            </v-btn>
        </div>

        <!-- Filtry -->
        <v-card class="mb-4">
            <v-card-text>
                <schedule-filters @filter-change="handleFilterChange" :loading="loading" />
            </v-card-text>
        </v-card>

        <!-- Kalendarz -->
        <v-card :loading="loading" style="min-height: 600px">
            <schedule-calendar :lessons="lessonsStore.lessons" :current-date="currentViewDate" @edit-lesson="editLesson"
                @select-slot="handleSlotSelect" />
        </v-card>

        <!-- Add/Edit Dialog -->
        <lesson-dialog v-model="showAddDialog" :lesson="selectedLesson" :initial-date="selectedDate"
            @save="refreshLessons" @close="closeDialog" />
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useLessonsStore } from '@/stores/lessons'
import { useAuthStore } from '@/stores/auth'
import ScheduleFilters from '@/components/schedule/ScheduleFilters.vue'
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar.vue'
import LessonDialog from '@/components/schedule/LessonDialog.vue'

export default {
    name: 'CalendarTab',
    components: {
        ScheduleFilters,
        ScheduleCalendar,
        LessonDialog
    },
    setup() {
        const lessonsStore = useLessonsStore()
        const authStore = useAuthStore()
        const showAddDialog = ref(false)
        const selectedLesson = ref(null)
        const selectedDate = ref(null)
        const currentFilters = ref({})
        const currentViewDate = ref(new Date())

        const dateRangeText = computed(() => {
            const curr = new Date(currentViewDate.value)
            const day = curr.getDay()
            const diff = curr.getDate() - day + (day === 0 ? -6 : 1)
            const start = new Date(curr.setDate(diff))
            const end = new Date(start)
            end.setDate(start.getDate() + 6)

            const options = { month: 'long', day: 'numeric' }
            return `${start.toLocaleDateString('pl-PL', options)} - ${end.toLocaleDateString('pl-PL', options)}`
        })

        const prevWeek = () => {
            const d = new Date(currentViewDate.value)
            d.setDate(d.getDate() - 7)
            currentViewDate.value = d
        }

        const nextWeek = () => {
            const d = new Date(currentViewDate.value)
            d.setDate(d.getDate() + 7)
            currentViewDate.value = d
        }

        const today = () => {
            currentViewDate.value = new Date()
        }

        const loading = computed(() => lessonsStore.loading)

        // Permission check
        const canAddLesson = computed(() => {
            // Teachers and Admins can add lessons
            return authStore.isTeacher || authStore.isAdmin
        })

        const handleFilterChange = (filters) => {
            currentFilters.value = filters
            lessonsStore.fetchLessons(filters)
        }

        const editLesson = (lesson) => {
            // Check permission: Teacher can only edit their own lessons
            if (authStore.isTeacher && lesson.lecturer.id !== authStore.user.id) {
                // Optionally show a notification that they can't edit this
                return
            }

            selectedLesson.value = lesson
            showAddDialog.value = true
        }

        const handleSlotSelect = (date) => {
            selectedDate.value = date
            selectedLesson.value = null
            showAddDialog.value = true
        }

        const openAddDialog = () => {
            selectedLesson.value = null
            selectedDate.value = null
            showAddDialog.value = true
        }

        const closeDialog = () => {
            showAddDialog.value = false
            selectedLesson.value = null
            selectedDate.value = null
        }

        const refreshLessons = () => {
            lessonsStore.fetchLessons(currentFilters.value)
            closeDialog()
        }

        onMounted(() => {
            if (lessonsStore.lessons.length === 0) {
                lessonsStore.fetchLessons()
            }
        })

        return {
            lessonsStore,
            showAddDialog,
            selectedLesson,
            selectedDate,
            loading,
            canAddLesson,
            handleFilterChange,
            editLesson,
            handleSlotSelect,
            openAddDialog,
            closeDialog,
            closeDialog,
            refreshLessons,
            currentViewDate,
            dateRangeText,
            prevWeek,
            nextWeek,
            today
        }
    }
}
</script>
