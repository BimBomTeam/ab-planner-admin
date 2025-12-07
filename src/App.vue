<template>
  <v-app>
    <!-- Navigation Drawer - only show when authenticated -->
    <v-navigation-drawer v-if="authStore.isAuthenticated" v-model="drawerModel" :temporary="$vuetify.display.mobile"
      :permanent="!$vuetify.display.mobile" width="280">
      <v-list-item prepend-icon="mdi-school" title="Admin Panel" subtitle="AB Planner" class="sidebar-header">
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav class="sidebar">
        <v-list-item v-for="item in menuItems" :key="item.title" :prepend-icon="item.icon" :title="item.title"
          :to="item.to" :value="item.value"></v-list-item>
      </v-list>


    </v-navigation-drawer>

    <!-- App Bar - only show when authenticated -->
    <v-app-bar v-if="authStore.isAuthenticated">
      <v-app-bar-nav-icon v-if="$vuetify.display.mobile" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>AB Planner Admin</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- User info -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" prepend-icon="mdi-account-circle">
            {{ authStore.user?.name || 'User' }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title class="text-caption text-grey">
              {{ authStore.user?.email }}
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="handleLogout">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Wyloguj</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn icon="mdi-bell" variant="text"></v-btn>
    </v-app-bar>

    <v-main :class="{ 'pa-0': !authStore.isAuthenticated }">
      <v-container v-if="authStore.isAuthenticated" fluid>
        <router-view />
      </v-container>
      <router-view v-else />
    </v-main>
  </v-app>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      drawer: true,
      menuItems: [
        {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
          to: '/dashboard',
          value: 'dashboard'
        },
        {
          title: 'Użytkownicy',
          icon: 'mdi-account-group',
          to: '/users',
          value: 'users'
        },
        {
          title: 'Programy',
          icon: 'mdi-school',
          to: '/programs',
          value: 'programs'
        },
        {
          title: 'Grupy',
          icon: 'mdi-account-multiple',
          to: '/groups',
          value: 'groups'
        },
        {
          title: 'Zajęcia',
          icon: 'mdi-calendar-clock',
          to: '/lessons',
          value: 'lessons'
        },
        {
          title: 'Powiadomienia',
          icon: 'mdi-bell',
          to: '/notifications',
          value: 'notifications'
        },
        {
          title: 'Plan lekcji',
          icon: 'mdi-calendar-multiselect',
          to: '/schedule',
          value: 'schedule'
        },
        {
          title: 'Sale',
          icon: 'mdi-door',
          to: '/rooms',
          value: 'rooms'
        },
        {
          title: 'Przedmioty',
          icon: 'mdi-book-open-variant',
          to: '/subjects',
          value: 'subjects'
        },
        {
          title: 'Wybory studentów',
          icon: 'mdi-clipboard-check',
          to: '/student-selections',
          value: 'student-selections'
        }
      ]
    }
  },

  computed: {
    // Keep drawer open on desktop, allow toggle on mobile
    drawerModel: {
      get() {
        return this.$vuetify.display.mobile ? this.drawer : true
      },
      set(value) {
        this.drawer = value
      }
    }
  },

  watch: {
    // Watch for authentication changes and redirect
    'authStore.isAuthenticated': {
      handler(newVal) {
        // Don't redirect if we're on the callback page (it handles its own errors)
        if (!newVal && this.$route.path !== '/login' && this.$route.path !== '/auth/callback') {
          this.$router.push('/login')
        }
      }
    }
  },

  mounted() {
    // Auto-close drawer on mobile initially
    if (this.$vuetify.display.mobile) {
      this.drawer = false
    }

    // Check authentication status on app load
    this.authStore.checkAuth()
  },

  methods: {
    async handleLogout() {
      await this.authStore.logout()
    }
  }
}
</script>

<style>
.v-application {
  font-family: 'Roboto', sans-serif !important;
}

/* Sidebar padding improvements */
.sidebar-header {
  padding: 20px 16px !important;
}

.sidebar .v-list {
  padding: 8px 12px !important;
}

.sidebar .v-list-item {
  margin: 2px 0 !important;
  padding: 8px 12px !important;
}

/* Desktop - always show sidebar */
@media (min-width: 961px) {
  .v-navigation-drawer {
    position: fixed !important;
  }
}
</style>
