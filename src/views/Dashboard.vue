<template>
  <div>
    <h1 class="text-h4 mb-6">Dashboard</h1>
    
    <!-- Karty statystyk -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3">mdi-account-group</v-icon>
            Użytkownicy
          </v-card-title>
          <v-card-text class="text-h3">
            {{ usersStore.users.length }}
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3">mdi-school</v-icon>
            Programy
          </v-card-title>
          <v-card-text class="text-h3">
            {{ programsStore.programs.length }}
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" dark>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3">mdi-account-multiple</v-icon>
            Grupy
          </v-card-title>
          <v-card-text class="text-h3">
            {{ groupsStore.groups.length }}
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="info" dark>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3">mdi-calendar-clock</v-icon>
            Dzisiejsze zajęcia
          </v-card-title>
          <v-card-text class="text-h3">
            {{ lessonsStore.getLessonsToday.length }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Dzisiejsze zajęcia -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3">mdi-calendar-today</v-icon>
            Dzisiejsze zajęcia
          </v-card-title>
          <v-card-text>
            <v-list v-if="lessonsStore.getLessonsToday.length > 0">
              <v-list-item
                v-for="lesson in lessonsStore.getLessonsToday"
                :key="lesson.id"
              >
                <v-list-item-title>
                  {{ lesson.subject.name }} - {{ lesson.group.code }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatTime(lesson.starts_at) }} - {{ formatTime(lesson.ends_at) }} | 
                  Sala {{ lesson.room.number }} | {{ lesson.lecturer.name }}
                </v-list-item-subtitle>
                <template v-slot:prepend>
                  <v-icon :color="getStatusColor(lesson.status)">
                    mdi-circle
                  </v-icon>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center pa-4">
              <v-icon size="48" color="grey">mdi-calendar-blank</v-icon>
              <p class="text-grey mt-2">Brak zajęć na dziś</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Oczekujące powiadomienia -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3">mdi-bell-alert</v-icon>
            Oczekujące powiadomienia
          </v-card-title>
          <v-card-text>
            <v-list v-if="notificationsStore.getPendingNotifications.length > 0">
              <v-list-item
                v-for="notification in notificationsStore.getPendingNotifications.slice(0, 5)"
                :key="notification.id"
                density="compact"
              >
                <v-list-item-title>
                  {{ notification.payload.title }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ notification.payload.message }}
                </v-list-item-subtitle>
                <template v-slot:prepend>
                  <v-icon color="warning">mdi-clock-outline</v-icon>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center pa-4">
              <v-icon size="48" color="grey">mdi-bell-check</v-icon>
              <p class="text-grey mt-2">Brak oczekujących powiadomień</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { useUsersStore } from '@/stores/users'
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
      notificationsStore
    }
  },
  methods: {
    formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getStatusColor(status) {
      switch (status) {
        case 'scheduled': return 'success'
        case 'rescheduled': return 'warning'
        case 'cancelled': return 'error'
        default: return 'grey'
      }
    }
  }
}
</script>