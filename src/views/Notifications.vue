<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Powiadomienia</h1>
      <v-btn color="primary" @click="showAddDialog = true">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj powiadomienie
      </v-btn>
    </div>

    <!-- Statystyki -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card color="warning" dark>
          <v-card-text class="d-flex align-center">
            <v-icon class="mr-3" size="40">mdi-clock-outline</v-icon>
            <div>
              <div class="text-h4">{{ notificationsStore.getNotificationsByStatus('pending').length }}</div>
              <div>Oczekujące</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="4">
        <v-card color="success" dark>
          <v-card-text class="d-flex align-center">
            <v-icon class="mr-3" size="40">mdi-check-circle</v-icon>
            <div>
              <div class="text-h4">{{ notificationsStore.getNotificationsByStatus('sent').length }}</div>
              <div>Wysłane</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="4">
        <v-card color="error" dark>
          <v-card-text class="d-flex align-center">
            <v-icon class="mr-3" size="40">mdi-alert-circle</v-icon>
            <div>
              <div class="text-h4">{{ notificationsStore.getNotificationsByStatus('failed').length }}</div>
              <div>Nieudane</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtry -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="userFilter"
              :items="usersStore.users"
              item-title="email"
              item-value="id"
              label="Użytkownik"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <div class="d-flex gap-2">
              <v-btn 
                color="success" 
                @click="sendPendingNotifications"
                :disabled="!hasPendingNotifications"
              >
                <v-icon class="mr-2">mdi-send</v-icon>
                Wyślij oczekujące
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Lista powiadomień -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredNotifications"
        item-value="id"
      >
        <template #item.user_id="{ item }">
          <div v-if="getUser(item.user_id)">
            <div class="font-weight-medium">{{ getUser(item.user_id).name }}</div>
            <div class="text-caption text-grey">{{ getUser(item.user_id).email }}</div>
          </div>
        </template>
        
        <template #item.payload="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.payload.title }}</div>
            <div class="text-caption text-grey">{{ item.payload.message }}</div>
            <v-chip
              size="x-small"
              color="info"
              variant="outlined"
              class="mt-1"
            >
              {{ item.payload.type }}
            </v-chip>
          </div>
        </template>
        
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>
        
        <template #item.attempts="{ item }">
          <v-chip
            :color="item.attempts > 2 ? 'error' : item.attempts > 0 ? 'warning' : 'success'"
            size="small"
            variant="outlined"
          >
            {{ item.attempts }}
          </v-chip>
        </template>
        
        <template #item.created_at="{ item }">
          <div>
            <div>{{ formatDate(item.created_at) }}</div>
            <div class="text-caption text-grey">{{ formatTime(item.created_at) }}</div>
          </div>
        </template>
        
        <template #item.sent_at="{ item }">
          <div v-if="item.sent_at">
            <div>{{ formatDate(item.sent_at) }}</div>
            <div class="text-caption text-grey">{{ formatTime(item.sent_at) }}</div>
          </div>
          <span v-else class="text-grey">-</span>
        </template>
        
        <template #item.actions="{ item }">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
                v-bind="props"
              ></v-btn>
            </template>
            <v-list>
              <v-list-item
                v-if="item.status === 'pending'"
                @click="markAsSent(item)"
              >
                <v-list-item-title>
                  <v-icon class="mr-2">mdi-check</v-icon>
                  Oznacz jako wysłane
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="item.status === 'pending'"
                @click="markAsFailed(item)"
              >
                <v-list-item-title>
                  <v-icon class="mr-2">mdi-close</v-icon>
                  Oznacz jako nieudane
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="deleteNotification(item)" class="text-error">
                <v-list-item-title>
                  <v-icon class="mr-2">mdi-delete</v-icon>
                  Usuń
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog dodawania powiadomienia -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Dodaj powiadomienie</span>
        </v-card-title>
        
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newNotification.user_id"
                  :items="usersStore.users"
                  item-title="email"
                  item-value="id"
                  label="Użytkownik"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newNotification.payload.title"
                  label="Tytuł"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="newNotification.payload.message"
                  label="Wiadomość"
                  variant="outlined"
                  required
                  rows="3"
                ></v-textarea>
              </v-col>
              
              <v-col cols="12">
                <v-select
                  v-model="newNotification.payload.type"
                  :items="notificationTypes"
                  label="Typ powiadomienia"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">Anuluj</v-btn>
          <v-btn color="primary" @click="saveNotification">Dodaj</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog potwierdzenia usunięcia -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Potwierdź usunięcie</v-card-title>
        <v-card-text>
          Czy na pewno chcesz usunąć powiadomienie "{{ notificationToDelete?.payload?.title }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Anuluj</v-btn>
          <v-btn color="error" @click="confirmDelete">Usuń</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useNotificationsStore } from '@/stores/notifications'
import { useUsersStore } from '@/stores/users'

export default {
  name: 'Notifications',
  setup() {
    const notificationsStore = useNotificationsStore()
    const usersStore = useUsersStore()
    return { notificationsStore, usersStore }
  },
  data() {
    return {
      statusFilter: null,
      userFilter: null,
      showAddDialog: false,
      showDeleteDialog: false,
      notificationToDelete: null,
      newNotification: {
        user_id: null,
        payload: {
          title: '',
          message: '',
          type: ''
        }
      },
      notificationTypes: [
        { title: 'Nowe zajęcia', value: 'lesson_added' },
        { title: 'Zmiana terminu', value: 'lesson_rescheduled' },
        { title: 'Odwołane zajęcia', value: 'lesson_cancelled' },
        { title: 'Przypomnienie', value: 'lesson_reminder' },
        { title: 'Ogólne', value: 'general' }
      ],
      headers: [
        { title: 'ID', key: 'id', width: '60px' },
        { title: 'Użytkownik', key: 'user_id' },
        { title: 'Powiadomienie', key: 'payload' },
        { title: 'Status', key: 'status' },
        { title: 'Próby', key: 'attempts' },
        { title: 'Utworzono', key: 'created_at' },
        { title: 'Wysłano', key: 'sent_at' },
        { title: 'Akcje', key: 'actions', sortable: false, width: '100px' }
      ]
    }
  },
  computed: {
    filteredNotifications() {
      let notifications = this.notificationsStore.notifications
      
      if (this.statusFilter) {
        notifications = notifications.filter(notification => notification.status === this.statusFilter)
      }
      
      if (this.userFilter) {
        notifications = notifications.filter(notification => notification.user_id === this.userFilter)
      }
      
      return notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
    statusOptions() {
      return [
        { title: 'Wszystkie', value: null },
        ...this.notificationsStore.notificationStatuses.map(status => ({
          title: status.label,
          value: status.value
        }))
      ]
    },
    userOptions() {
      return [
        { title: 'Wszyscy', value: null },
        ...this.usersStore.users.map(user => ({
          title: user.name,
          value: user.id
        }))
      ]
    },
    hasPendingNotifications() {
      return this.notificationsStore.getPendingNotifications.length > 0
    }
  },
  methods: {
    markAsSent(notification) {
      this.notificationsStore.markAsSent(notification.id)
    },
    
    markAsFailed(notification) {
      this.notificationsStore.markAsFailed(notification.id)
    },
    
    deleteNotification(notification) {
      this.notificationToDelete = notification
      this.showDeleteDialog = true
    },
    
    confirmDelete() {
      if (this.notificationToDelete) {
        this.notificationsStore.deleteNotification(this.notificationToDelete.id)
        this.showDeleteDialog = false
        this.notificationToDelete = null
      }
    },
    
    sendPendingNotifications() {
      this.notificationsStore.getPendingNotifications.forEach(notification => {
        this.notificationsStore.markAsSent(notification.id)
      })
    },
    
    saveNotification() {
      this.notificationsStore.addNotification(this.newNotification)
      this.closeDialog()
    },
    
    closeDialog() {
      this.showAddDialog = false
      this.newNotification = {
        user_id: null,
        payload: {
          title: '',
          message: '',
          type: ''
        }
      }
    },
    
    getUser(userId) {
      return this.usersStore.getUserById(userId)
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('pl-PL')
    },
    
    formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getStatusColor(status) {
      switch (status) {
        case 'sent': return 'success'
        case 'pending': return 'warning'
        case 'failed': return 'error'
        default: return 'grey'
      }
    },
    
    getStatusLabel(status) {
      const statusObj = this.notificationsStore.notificationStatuses.find(s => s.value === status)
      return statusObj ? statusObj.label : status
    }
  }
}
</script>