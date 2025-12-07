<template>
  <v-row>
    <v-col cols="12" md="4">
      <v-select
        v-model="filters.group_id"
        :items="groupsStore.groups"
        item-title="code"
        item-value="id"
        label="Grupa"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        @update:model-value="emitFilters"
      ></v-select>
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        v-model="filters.lecturer_user_id"
        :items="teachers"
        item-title="last_name"
        item-value="id"
        label="Nauczyciel"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        @update:model-value="emitFilters"
      >
        <template v-slot:item="{ props, item }">
          <v-list-item v-bind="props" :title="`${item.raw.first_name} ${item.raw.last_name}`" :subtitle="item.raw.email"></v-list-item>
        </template>
        <template v-slot:selection="{ item }">
          {{ item.raw.first_name }} {{ item.raw.last_name }}
        </template>
      </v-select>
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        v-model="filters.room_id"
        :items="roomsStore.rooms"
        item-title="number"
        item-value="id"
        label="Sala"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        @update:model-value="emitFilters"
      >
        <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :title="item.raw.number" :subtitle="`Budynek: ${item.raw.building} (Poj: ${item.raw.capacity})`"></v-list-item>
        </template>
      </v-select>
    </v-col>
  </v-row>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useGroupsStore } from '@/stores/groups'
import { useUsersStore } from '@/stores/users'
import { useRoomsStore } from '@/stores/rooms'

export default {
  name: 'ScheduleFilters',
  emits: ['filter-change'],
  setup(props, { emit }) {
    const groupsStore = useGroupsStore()
    const usersStore = useUsersStore()
    const roomsStore = useRoomsStore()

    const filters = ref({
      group_id: null,
      lecturer_user_id: null,
      room_id: null
    })

    const teachers = computed(() => usersStore.teacherUsers)

    const emitFilters = () => {
      // Remove null values
      const activeFilters = Object.fromEntries(
        Object.entries(filters.value).filter(([_, v]) => v != null)
      )
      emit('filter-change', activeFilters)
    }

    onMounted(async () => {
      // Load necessary data if empty
      if (groupsStore.groups.length === 0) await groupsStore.fetchGroups()
      if (usersStore.users.length === 0) await usersStore.fetchUsers()
      if (roomsStore.rooms.length === 0) await roomsStore.fetchRooms()
    })

    return {
      filters,
      groupsStore,
      usersStore,
      roomsStore,
      teachers,
      emitFilters
    }
  }
}
</script>
