<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawerModel"
      :temporary="$vuetify.display.mobile"
      :permanent="!$vuetify.display.mobile"
      width="280"
    >
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        title="Admin Panel"
        subtitle="AB Planner"
      >
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :value="item.value"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon 
        v-if="$vuetify.display.mobile"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>AB Planner Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-bell" variant="text"></v-btn>
      <v-btn icon="mdi-account" variant="text"></v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
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
  
  mounted() {
    // Auto-close drawer on mobile initially
    if (this.$vuetify.display.mobile) {
      this.drawer = false
    }
  }
}
</script>

<style>
.v-application {
  font-family: 'Roboto', sans-serif !important;
}

/* Ensure proper mobile behavior */
@media (max-width: 960px) {
  .v-navigation-drawer--temporary {
    z-index: 1005 !important;
  }
}

/* Desktop - always show sidebar */
@media (min-width: 961px) {
  .v-navigation-drawer {
    position: fixed !important;
  }
}
</style>
