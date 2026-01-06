<template>
  <v-container fluid class="pa-0 pa-md-4">
    <!-- Welcome Header -->
    <div class="mb-8">
      <h1 class="text-h4 font-weight-bold text-primary">
        Dzień dobry, {{ userFirstName }}!
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1 mt-1">
        {{ currentDatestamp }}
      </p>
    </div>

    <!-- Quick Actions Grid -->
    <h2 class="text-h6 font-weight-bold mb-4">Szybkie akcje</h2>
    <v-row class="mb-8">
      <v-col cols="6" sm="6" md="4" lg="2.4" v-for="action in quickActions" :key="action.title">
        <v-card @click="action.action ? action.action() : $router.push(action.to)" :color="action.color"
          variant="outlined" class="h-100 cursor-pointer" hover>
          <v-card-text class="d-flex flex-column align-center justify-center py-6 text-center"
            style="gap: 12px; height: 140px;">
            <v-avatar :color="action.color" variant="tonal" size="48">
              <v-icon :color="action.color" size="24">{{ action.icon }}</v-icon>
            </v-avatar>
            <span class="font-weight-bold text-body-2">{{ action.title }}</span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Widgets Row -->
    <v-row>
      <!-- Today's Lessons Widget (Full Width) -->
      <v-col cols="12">
        <v-card class="h-100 rounded-lg" elevation="2" border>
          <v-card-title class="d-flex flex-wrap justify-space-between align-center pa-4">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-calendar-clock</v-icon>
              <span class="font-weight-bold">Dzisiejsze zajęcia</span>
            </div>

            <!-- Filters -->
            <div style="min-width: 200px;" class="mt-2 mt-sm-0">
              <v-autocomplete v-model="selectedGroupFilter" :items="groupsStore.groups" item-title="code"
                item-value="id" label="Filtruj wg grupy" variant="outlined" density="compact" hide-details clearable
                prepend-inner-icon="mdi-filter-variant" placeholder="Wszystkie grupy"
                class="filter-select"></v-autocomplete>
            </div>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-0">
            <div v-if="filteredLessons.length > 0">
              <v-list lines="two" class="pa-0">
                <v-list-item v-for="(lesson, index) in filteredLessons" :key="lesson.id"
                  :class="{ 'border-b': index !== filteredLessons.length - 1 }" class="py-3 px-4 lesson-item">
                  <template v-slot:prepend>
                    <div class="d-flex flex-column align-center mr-4" style="width: 50px;">
                      <span class="text-h6 font-weight-bold text-primary leading-none">{{
                        formatTimeOnly(lesson.starts_at) }}</span>
                      <span class="text-caption text-grey">{{ formatTimeOnly(lesson.ends_at) }}</span>
                    </div>
                  </template>

                  <v-list-item-title class="font-weight-bold mb-1">
                    {{ lesson.subject.name }}
                    <v-chip size="x-small" :color="getTypeColor(lesson.lesson_type)" class="ml-2 font-weight-medium"
                      label>
                      {{ getTypeName(lesson.lesson_type) }}
                    </v-chip>
                  </v-list-item-title>

                  <v-list-item-subtitle class="d-flex flex-wrap align-center text-body-2 mt-1">
                    <div class="d-flex align-center mr-4 mb-1">
                      <v-icon size="16" class="mr-1 text-grey-darken-1">mdi-account-group</v-icon>
                      <span class="text-grey-darken-3">{{ lesson.group.code }}</span>
                    </div>
                    <div class="d-flex align-center mr-4 mb-1">
                      <v-icon size="16" class="mr-1 text-grey-darken-1">mdi-door</v-icon>
                      <span class="text-grey-darken-3">{{ lesson.room.building }}/{{ lesson.room.number }}</span>
                    </div>
                    <div class="d-flex align-center mb-1">
                      <v-icon size="16" class="mr-1 text-grey-darken-1">mdi-account-tie</v-icon>
                      <span class="text-grey-darken-3">{{ lesson.lecturer.name }}</span>
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>

            <!-- Empty State -->
            <div v-else class="d-flex flex-column align-center justify-center py-10 text-center">
              <v-avatar color="surface-variant" variant="tonal" size="80" class="mb-4">
                <v-icon size="40" color="medium-emphasis">mdi-calendar-blank</v-icon>
              </v-avatar>
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-1">Brak zajęć</h3>
              <p class="text-caption text-grey">
                {{ selectedGroupFilter ? 'Dla wybranej grupy' : 'Na dzień dzisiejszy' }}
              </p>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="justify-center pa-2">
            <v-btn variant="text" color="primary" to="/schedule" class="text-caption font-weight-bold">
              Zobacz pełny kalendarz <v-icon icon="mdi-arrow-right" size="small" class="ml-1"></v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Send Notification Dialog -->
    <v-dialog v-model="showNotificationDialog" max-width="500px">
      <v-card>
        <v-card-title class="pa-6 pb-4 bg-primary text-white">
          <span class="text-h6">Wyślij powiadomienie do wszystkich</span>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form @submit.prevent="sendNotification">
            <v-alert type="info" variant="tonal" class="mb-4" density="compact">
              Wiadomość zostanie wysłana do wszystkich użytkowników systemu.
            </v-alert>

            <v-text-field v-model="notifTitle" label="Tytuł" variant="outlined" required></v-text-field>

            <v-textarea v-model="notifMessage" label="Wiadomość" variant="outlined" rows="3" required></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showNotificationDialog = false">Anuluj</v-btn>
          <v-btn color="primary" variant="text" @click="sendNotification" :loading="notificationsStore.loading"
            :disabled="!isNotificationValid">Wyślij</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLessonsStore } from '@/stores/lessons'
import { useGroupsStore } from '@/stores/groups'
import { useNotificationsStore } from '@/stores/notifications'
import { useUsersStore } from '@/stores/users'
import { useSnackbarStore } from '@/stores/snackbar'

export default {
  name: 'Dashboard',
  setup() {
    const authStore = useAuthStore()
    const lessonsStore = useLessonsStore()
    const groupsStore = useGroupsStore()
    const notificationsStore = useNotificationsStore()
    const usersStore = useUsersStore()
    const snackbar = useSnackbarStore()

    const selectedGroupFilter = ref(null)
    const showNotificationDialog = ref(false)
    const notifTitle = ref('')
    const notifMessage = ref('')
    const notifTargetUser = ref(null)

    // User Data
    const userFirstName = computed(() => {
      if (!authStore.user?.name) return 'Użytkowniku'
      return authStore.user.name.split(' ')[0]
    })

    const currentDatestamp = computed(() => {
      return new Date().toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    const isNotificationValid = computed(() => {
      return !!notifTitle.value && !!notifMessage.value
    })

    const openNotificationDialog = () => {
      notifTitle.value = ''
      notifMessage.value = ''
      notifTargetUser.value = null
      showNotificationDialog.value = true
    }

    // Quick Actions Config
    const quickActions = [
      { title: 'Dodaj zajęcia', icon: 'mdi-calendar-plus', color: 'primary', to: '/schedule' },
      { title: 'Wyślij powiadomienie', icon: 'mdi-send', color: 'deep-purple', action: openNotificationDialog },
      { title: 'Użytkownicy', icon: 'mdi-account-group', color: 'info', to: '/users' },
      { title: 'Programy studiów', icon: 'mdi-school', color: 'success', to: '/programs' },
      { title: 'Grupy dziekańskie', icon: 'mdi-account-multiple-outline', color: 'warning', to: '/groups' },
      { title: 'Sale dydaktyczne', icon: 'mdi-door-open', color: 'indigo', to: '/rooms' },
    ]

    // Lessons filtering
    const filteredLessons = computed(() => {
      const todayStr = new Date().toDateString()

      let lessons = lessonsStore.lessons.filter(l => {
        const lDate = new Date(l.starts_at).toDateString()
        return lDate === todayStr && l.status !== 'cancelled'
      })

      if (selectedGroupFilter.value) {
        lessons = lessons.filter(l => l.group.id === selectedGroupFilter.value)
      }

      return lessons.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    })

    const sendNotification = async () => {
      if (!notifTitle.value || !notifMessage.value) return

      try {
        await notificationsStore.createNotification({
          user_id: 0,
          payload: {
            title: notifTitle.value,
            message: notifMessage.value,
            type: 'manual'
          },
          read: false
        })
        snackbar.showSuccess('Powiadomienie wysłane do wszystkich!')
        showNotificationDialog.value = false
      } catch (error) {
        console.error(error)
        snackbar.showError('Błąd wysyłania powiadomienia')
      }
    }

    // Helpers
    const formatTimeOnly = (dateStr) => {
      return new Date(dateStr).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    }

    const getTypeColor = (type) => {
      switch (type) {
        case 'lecture': return 'blue-lighten-4 text-blue-darken-4'
        case 'lab': return 'green-lighten-4 text-green-darken-4'
        case 'project': return 'orange-lighten-4 text-orange-darken-4'
        default: return 'grey-lighten-4'
      }
    }

    const getTypeName = (type) => {
      const map = { lecture: 'Wykład', lab: 'Laboratorium', project: 'Projekt', seminar: 'Seminarium' }
      return map[type] || type
    }

    onMounted(async () => {
      await Promise.all([
        lessonsStore.fetchLessons(),
        groupsStore.fetchGroups(),
        usersStore.fetchUsers()
      ])
    })

    return {
      userFirstName,
      currentDatestamp,
      quickActions,
      groupsStore,
      usersStore,
      notificationsStore,
      selectedGroupFilter,
      filteredLessons,
      formatTimeOnly,
      getTypeColor,
      getTypeName,
      showNotificationDialog,
      notifTitle,
      notifMessage,
      sendNotification,
      openNotificationDialog,
      isNotificationValid
    }
  }
}
</script>

<style scoped>
.leading-none {
  line-height: 1;
}



.cursor-pointer {
  cursor: pointer;
}
</style>
