<template>
  <div class="schedule-view">
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Plan Lekcji</h1>
      
      <v-btn color="primary" @click="showAddDialog = true" :disabled="!canAddLesson">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj zajęcia
      </v-btn>
    </div>

    <!-- Filtry -->
    <v-card class="mb-4">
      <v-card-text>
        <schedule-filters 
          @filter-change="handleFilterChange" 
          :loading="loading" 
        />
      </v-card-text>
    </v-card>

    <!-- Kalendarz -->
    <v-card :loading="loading" style="min-height: 600px">
      <schedule-calendar 
        :lessons="lessonsStore.lessons" 
        @edit-lesson="editLesson"
        @select-slot="handleSlotSelect"
      />
    </v-card>

    <!-- Add/Edit Dialog -->
    <lesson-dialog
      v-model="showAddDialog"
      :lesson="selectedLesson"
      :initial-date="selectedDate"
      @save="refreshLessons"
      @close="closeDialog"
    />
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
  name: 'ScheduleView',
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
      lessonsStore.fetchLessons()
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
      closeDialog,
      refreshLessons
    }
  }
}
</script>
