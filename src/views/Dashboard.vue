<template>
  <div>
    <h1 class="text-h4 mb-6">Dashboard</h1>
    
    <!-- Karty statystyk -->
    <v-row class="mb-6">
      <v-col cols="6" md="3">
        <v-card color="primary" dark>
          <v-card-title class="d-flex align-center text-subtitle-2 text-md-h6 px-3">
            <v-icon class="mr-2 mr-md-3" size="small">mdi-account-group</v-icon>
            Użytkownicy
          </v-card-title>
          <v-card-text class="text-h4 text-md-h3 px-3">
            {{ usersStore.users.length }}
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="6" md="3">
        <v-card color="success" dark>
          <v-card-title class="d-flex align-center text-subtitle-2 text-md-h6 px-3">
            <v-icon class="mr-2 mr-md-3" size="small">mdi-school</v-icon>
            Programy
          </v-card-title>
          <v-card-text class="text-h4 text-md-h3 px-3">
            {{ programsStore.programs.length }}
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="6" md="3">
        <v-card color="warning" dark>
          <v-card-title class="d-flex align-center text-subtitle-2 text-md-h6 px-3">
            <v-icon class="mr-2 mr-md-3" size="small">mdi-account-multiple</v-icon>
            Grupy
          </v-card-title>
          <v-card-text class="text-h4 text-md-h3 px-3">
            {{ groupsStore.groups.length }}
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="6" md="3">
        <v-card color="info" dark>
          <v-card-title class="d-flex align-center text-subtitle-2 text-md-h6 px-3">
            <v-icon class="mr-2 mr-md-3" size="small">mdi-calendar-clock</v-icon>
            Dzisiejsze zajęcia
          </v-card-title>
          <v-card-text class="text-h4 text-md-h3 px-3">
            {{ lessonsStore.getLessonsToday.length }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Zajęcia -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="elevation-3">
          <v-card-title class="d-flex flex-wrap justify-space-between align-center bg-primary text-white pa-3">
            <div class="d-flex align-center mb-2 mb-sm-0">
              <v-icon class="mr-2" size="24">mdi-calendar-today</v-icon>
              <span class="text-h6">Zajęcia</span>
            </div>
            
            <div class="d-flex align-center justify-end flex-grow-1 flex-sm-grow-0">
              <v-btn
                icon
                size="small"
                variant="text"
                class="text-white"
                @click="changeDate(-1)"
              >
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="text"
                    class="text-white mx-1 px-2 font-weight-bold"
                  >
                    {{ formatDisplayDate(selectedDate) }}
                    <v-icon size="small" class="ml-1">mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                
                <v-date-picker
                  v-model="selectedDate"
                  locale="pl"
                  show-adjacent-months
                  elevation="8"
                  color="primary"
                ></v-date-picker>
              </v-menu>
              
              <v-btn
                icon
                size="small"
                variant="text"
                class="text-white"
                @click="changeDate(1)"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-0">
            <div v-if="getLessonsByDate.length > 0">
              <v-list class="py-0">
                <v-list-item
                  v-for="(lesson, index) in getLessonsByDate"
                  :key="lesson.id"
                  class="border-b px-4 py-3"
                  :class="{ 'bg-grey-lighten-5': index % 2 === 0 }"
                >
                  <template v-slot:prepend>
                    <v-avatar :color="getStatusColor(lesson.status)" size="32">
                      <v-icon color="white" size="16">{{ getTypeIcon(lesson.lesson_type) }}</v-icon>
                    </v-avatar>
                  </template>

                  <div class="flex-grow-1">
                    <v-list-item-title class="font-weight-bold text-body-1 mb-2">
                      {{ lesson.subject.name }}
                    </v-list-item-title>
                    
                    <div class="d-flex flex-column" style="gap: 6px;">
                      <div class="d-flex align-center">
                        <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                        {{ formatTime(lesson.starts_at) }} - {{ formatTime(lesson.ends_at) }}
                      </div>
                      <div class="d-flex align-center">
                        <v-icon size="14" class="mr-1">mdi-account-group</v-icon>
                        {{ lesson.group.code }}
                        <v-divider vertical class="mx-2"></v-divider>
                        <v-icon size="14" class="mr-1">mdi-door</v-icon>
                        Sala {{ lesson.room.building }}/{{ lesson.room.number }}
                        <v-divider vertical class="mx-2"></v-divider>
                        <v-icon size="14" class="mr-1">mdi-account</v-icon>
                        {{ lesson.lecturer.name }}
                      </div>
                    </div>
                  </div>

                  <template v-slot:append>
                    <v-chip
                      :color="getStatusColor(lesson.status)"
                      size="small"
                      variant="outlined"
                      class="text-caption"
                    >
                      {{ getStatusLabel(lesson.status) }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </div>
            
            <div v-else class="text-center pa-8">
              <v-icon size="80" color="grey-lighten-2">mdi-calendar-blank-outline</v-icon>
              <h3 class="text-h6 text-grey mt-4">Brak zajęć</h3>
              <p class="text-grey">{{ isToday ? 'na dziś' : 'w wybranym dniu' }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Oczekujące powiadomienia -->
      <v-col cols="12" md="4">
        <v-card class="elevation-3 h-100">
          <v-card-title class="d-flex align-center bg-warning text-white pa-4">
            <v-icon class="mr-3" size="28">mdi-bell-ring</v-icon>
            <span class="text-h6">Powiadomienia</span>
          </v-card-title>
          
          <v-card-text class="pa-0">
            <div v-if="notificationsStore.getPendingNotifications.length > 0">
              <v-list class="py-0">
                <v-list-item
                  v-for="(notification, index) in notificationsStore.getPendingNotifications.slice(0, 6)"
                  :key="notification.id"
                  class="border-b px-4 py-3"
                  :class="{ 'bg-grey-lighten-5': index % 2 === 0 }"
                >
                  <template v-slot:prepend>
                    <v-avatar :color="getNotificationColor(notification.payload.type)" size="28">
                      <v-icon color="white" size="14">{{ getNotificationIcon(notification.payload.type) }}</v-icon>
                    </v-avatar>
                  </template>

                  <div>
                    <v-list-item-title class="text-body-2 font-weight-medium mb-1">
                      {{ notification.payload.title }}
                    </v-list-item-title>
                    
                    <v-list-item-subtitle class="text-caption">
                      {{ notification.payload.message }}
                    </v-list-item-subtitle>
                  </div>

                  <template v-slot:append>
                    <div class="text-caption text-grey">
                      {{ formatTimeAgo(notification.created_at) }}
                    </div>
                  </template>
                </v-list-item>
              </v-list>
              
              <v-card-actions v-if="notificationsStore.getPendingNotifications.length > 6" class="justify-center pa-2">
                <v-btn 
                  size="small" 
                  variant="text" 
                  color="primary"
                  to="/notifications"
                >
                  Zobacz wszystkie ({{ notificationsStore.getPendingNotifications.length }})
                </v-btn>
              </v-card-actions>
            </div>
            
            <div v-else class="text-center pa-8">
              <v-icon size="60" color="grey-lighten-2">mdi-bell-check-outline</v-icon>
              <h4 class="text-subtitle-1 text-grey mt-3">Wszystko odhaczone!</h4>
              <p class="text-caption text-grey">Brak oczekujących powiadomień</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useProgramsStore } from '@/stores/programs'
import { useGroupsStore } from '@/stores/groups'
import { useLessonsStore } from '@/stores/lessons'
import { useNotificationsStore } from '@/stores/notifications'

export default {
  name: 'Dashboard',
  setup() {
    const usersStore = useUsersStore()
    const programsStore = useProgramsStore()
    const groupsStore = useGroupsStore()
    const lessonsStore = useLessonsStore()
    const notificationsStore = useNotificationsStore()
    
    return {
      usersStore,
      programsStore,
      groupsStore,
      lessonsStore,
      notificationsStore,
      authStore: useAuthStore()
    }
  },
  data() {
    return {
      selectedDate: new Date()
    }
  },
  computed: {
    getLessonsByDate() {
      const selectedDateStr = this.selectedDate.toDateString()
      return this.lessonsStore.lessons.filter(lesson => {
        const lessonDate = new Date(lesson.starts_at).toDateString()
        return lessonDate === selectedDateStr
      }).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    },
    isToday() {
      const today = new Date().toDateString()
      const selected = this.selectedDate.toDateString()
      return today === selected
    }
  },
  methods: {
    changeDate(direction) {
      const newDate = new Date(this.selectedDate)
      newDate.setDate(newDate.getDate() + direction)
      this.selectedDate = newDate
    },
    formatDisplayDate(date) {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      
      if (date.toDateString() === today.toDateString()) {
        return 'Dziś'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Wczoraj'
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Jutro'
      } else {
        return date.toLocaleDateString('pl-PL', {
          day: 'numeric',
          month: 'short',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        })
      }
    },
    formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatTimeAgo(dateString) {
      const now = new Date()
      const date = new Date(dateString)
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m temu`
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h temu`
      } else {
        return `${Math.floor(diffInMinutes / 1440)}d temu`
      }
    },
    getStatusColor(status) {
      switch (status) {
        case 'scheduled': return 'success'
        case 'rescheduled': return 'warning'
        case 'cancelled': return 'error'
        default: return 'grey'
      }
    },
    getStatusLabel(status) {
      switch (status) {
        case 'scheduled': return 'Zaplanowane'
        case 'rescheduled': return 'Przełożone'
        case 'cancelled': return 'Odwołane'
        default: return status
      }
    },
    getTypeIcon(type) {
      switch (type) {
        case 'lecture': return 'mdi-school'
        case 'lab': return 'mdi-flask'
        case 'seminar': return 'mdi-account-group'
        case 'project': return 'mdi-code-braces'
        default: return 'mdi-book'
      }
    },
    getNotificationColor(type) {
      switch (type) {
        case 'lesson_added': return 'success'
        case 'lesson_rescheduled': return 'warning'
        case 'lesson_cancelled': return 'error'
        case 'lesson_reminder': return 'info'
        default: return 'primary'
      }
    },
    getNotificationIcon(type) {
      switch (type) {
        case 'lesson_added': return 'mdi-plus-circle'
        case 'lesson_rescheduled': return 'mdi-clock-edit'
        case 'lesson_cancelled': return 'mdi-cancel'
        case 'lesson_reminder': return 'mdi-bell'
        default: return 'mdi-information'
      }
    }
  },
  mounted() {
    if (this.authStore.isAdmin) {
      this.usersStore.fetchUsers()
    }
    this.programsStore.fetchPrograms()
    this.groupsStore.fetchGroups()
    this.lessonsStore.fetchLessons()
    this.notificationsStore.fetchNotifications() 
  }
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.h-100 {
  height: 100%;
}

.v-btn--outlined.text-white {
  border-color: rgba(255, 255, 255, 0.7) !important;
}

.v-btn--outlined.text-white:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-color: white !important;
}

.v-list-item {
  min-height: auto !important;
}

.v-list-item__prepend {
  margin-right: 16px !important;
}

.v-list-item__append {
  margin-left: 16px !important;
}
</style>
