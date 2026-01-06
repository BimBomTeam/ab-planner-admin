<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800px">
    <v-card>
      <v-card-title class="pa-6 pb-4">
        <span class="text-h5">{{ editedLesson.id ? 'Edytuj' : 'Dodaj' }} zajęcia</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <v-select v-model="editedLesson.subject" :items="subjectsStore.subjects" item-title="name" item-value="id"
                label="Przedmiot" variant="outlined" required return-object></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="editedLesson.group" :items="groupsStore.groups" item-title="code" item-value="id"
                label="Grupa" variant="outlined" required return-object></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-menu v-model="menuStart" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <v-text-field v-bind="props" :model-value="formatDateTimeDisplay(editedLesson.starts_at)"
                    label="Początek zajęć" variant="outlined" required prepend-inner-icon="mdi-calendar-clock"
                    readonly></v-text-field>
                </template>
                <v-card>
                  <v-card-text>
                    <v-date-picker v-model="editedLessonStartDate" locale="pl" show-adjacent-months></v-date-picker>
                    <v-time-picker v-model="editedLessonStartTime" format="24hr" class="mt-4"></v-time-picker>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="updateStartDateTime">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>
            </v-col>

            <v-col cols="12" md="6">
              <v-menu v-model="menuEnd" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <v-text-field v-bind="props" :model-value="formatDateTimeDisplay(editedLesson.ends_at)"
                    label="Koniec zajęć" variant="outlined" required prepend-inner-icon="mdi-calendar-clock"
                    readonly></v-text-field>
                </template>
                <v-card>
                  <v-card-text>
                    <v-date-picker v-model="editedLessonEndDate" locale="pl" show-adjacent-months></v-date-picker>
                    <v-time-picker v-model="editedLessonEndTime" format="24hr" class="mt-4"></v-time-picker>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="updateEndDateTime">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>
            </v-col>

            <v-col cols="12" md="4">
              <v-select v-model="editedLesson.lesson_type" :items="lessonTypes" label="Typ zajęć" variant="outlined"
                required></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-select v-model="editedLesson.status" :items="lessonsStore.lessonStatuses" item-title="label"
                item-value="value" label="Status" variant="outlined" required></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-select v-model="editedLesson.room" :items="roomsWithLabels" item-title="roomLabel" item-value="id"
                label="Sala" variant="outlined" required return-object></v-select>
            </v-col>

            <v-col cols="12">
              <v-select v-model="editedLesson.lecturer" :items="lecturers" item-title="name" item-value="id"
                label="Wykładowca" variant="outlined" required return-object></v-select>
            </v-col>

            <!-- Recurrence Options -->
            <v-col cols="12" v-if="!editedLesson.id">
              <v-checkbox v-model="isRecurring" label="Powtarzaj zajęcia (seria)" hide-details></v-checkbox>
            </v-col>

            <v-col cols="12" md="6" v-if="isRecurring && !editedLesson.id">
              <v-text-field v-model.number="repeatEveryDays" label="Powtarzaj co (dni)" type="number" min="1"
                variant="outlined" required></v-text-field>
            </v-col>

            <v-col cols="12" md="6" v-if="isRecurring && !editedLesson.id">
              <v-text-field v-model.number="occurrences" label="Liczba powtórzeń" type="number" min="1"
                variant="outlined" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeDialog">Anuluj</v-btn>
        <v-btn color="primary" variant="text" @click="saveLesson" :disabled="!isFormValid">Zapisz</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useLessonsStore } from '@/stores/lessons'
import { useGroupsStore } from '@/stores/groups'
import { useProgramsStore } from '@/stores/programs'
import { useSubjectsStore } from '@/stores/subjects'
import { useUsersStore } from '@/stores/users'
import { useRoomsStore } from '@/stores/rooms'

export default {
  name: 'LessonDialog',
  props: {
    modelValue: Boolean,
    lesson: Object,
    initialDate: Date
  },
  emits: ['update:modelValue', 'save', 'close'],
  setup(props, { emit }) {
    const lessonsStore = useLessonsStore()
    const groupsStore = useGroupsStore()
    const programsStore = useProgramsStore()
    const subjectsStore = useSubjectsStore()
    const usersStore = useUsersStore()
    const roomsStore = useRoomsStore()

    const editedLesson = ref({})
    const editedLessonStartDate = ref(null)
    const editedLessonStartTime = ref(null)
    const editedLessonEndDate = ref(null)
    const editedLessonEndTime = ref(null)

    const menuStart = ref(false)
    const menuEnd = ref(false)

    // Recurrence fields
    const isRecurring = ref(false)
    const repeatEveryDays = ref(7)
    const occurrences = ref(1)

    const lessonTypes = [
      { title: 'Wykład', value: 'lecture' },
      { title: 'Laboratorium', value: 'lab' },
      { title: 'Seminarium', value: 'seminar' },
      { title: 'Projekt', value: 'project' }
    ]

    const lecturers = computed(() => {
      return usersStore.getUsersByRole('lecturer').map(user => ({
        id: user.id,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email
      }))
    })

    const roomsWithLabels = computed(() => {
      return roomsStore.rooms.map(room => ({
        id: room.id,
        number: room.number,
        building: room.building,
        capacity: room.capacity,
        roomLabel: `${room.building || 'N/A'}/${room.number || 'N/A'} (${room.capacity || 0} miejsc)`
      }))
    })

    const formatDateTimeDisplay = (dateTime) => {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      return date.toLocaleString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const updateStartDateTime = () => {
      if (editedLessonStartDate.value && editedLessonStartTime.value) {
        const date = new Date(editedLessonStartDate.value)
        const [hours, minutes] = editedLessonStartTime.value.split(':')
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        editedLesson.value.starts_at = date.toISOString()

        // Automatically set end time to 90 minutes later
        const endDate = new Date(date)
        endDate.setMinutes(endDate.getMinutes() + 90)
        editedLesson.value.ends_at = endDate.toISOString()
        editedLessonEndDate.value = endDate
        editedLessonEndTime.value = endDate.toTimeString().slice(0, 5)

        menuStart.value = false
      }
    }

    const updateEndDateTime = () => {
      if (editedLessonEndDate.value && editedLessonEndTime.value) {
        const date = new Date(editedLessonEndDate.value)
        const [hours, minutes] = editedLessonEndTime.value.split(':')
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        editedLesson.value.ends_at = date.toISOString()
        menuEnd.value = false
      }
    }

    const initNewLesson = () => {
      let startDate

      if (props.initialDate) {
        startDate = new Date(props.initialDate)
      } else {
        startDate = new Date()
        startDate.setDate(startDate.getDate() + 1)
        startDate.setHours(8, 0, 0, 0)
      }

      const endTime = new Date(startDate)
      endTime.setMinutes(endTime.getMinutes() + 90)

      editedLesson.value = {
        starts_at: startDate.toISOString(),
        ends_at: endTime.toISOString(),
        status: 'scheduled',
        lesson_type: 'lecture'
      }

      editedLessonStartDate.value = startDate
      editedLessonStartTime.value = startDate.toTimeString().slice(0, 5)
      editedLessonEndDate.value = endTime
      editedLessonEndTime.value = endTime.toTimeString().slice(0, 5)

      // Reset recurrence
      isRecurring.value = false
      repeatEveryDays.value = 7
      occurrences.value = 1
    }

    const initEditLesson = (lesson) => {
      editedLesson.value = { ...lesson }

      // Reset recurrence (editing series not supported in this simple view yet)
      isRecurring.value = false
      repeatEveryDays.value = 7
      occurrences.value = 1

      // Fix room object
      if (editedLesson.value.room) {
        const matchingRoom = roomsWithLabels.value.find(r => r.id === editedLesson.value.room.id)
        if (matchingRoom) {
          editedLesson.value.room = matchingRoom
        }
      }

      if (lesson.starts_at) {
        const startDate = new Date(lesson.starts_at)
        editedLessonStartDate.value = startDate
        editedLessonStartTime.value = startDate.toTimeString().slice(0, 5)
      }
      if (lesson.ends_at) {
        const endDate = new Date(lesson.ends_at)
        editedLessonEndDate.value = endDate
        editedLessonEndTime.value = endDate.toTimeString().slice(0, 5)
      }
    }

    watch(() => props.modelValue, (val) => {
      if (val) {
        // Fetch data when dialog opens
        subjectsStore.fetchSubjects()
        groupsStore.fetchGroups()
        usersStore.fetchUsers()
        roomsStore.fetchRooms()

        if (props.lesson) {
          initEditLesson(props.lesson)
        } else {
          initNewLesson()
        }
      }
    })

    const closeDialog = () => {
      emit('update:modelValue', false)
      emit('close')
    }

    const saveLesson = async () => {
      const payload = {
        ...editedLesson.value,
        subject_id: editedLesson.value.subject?.id,
        group_id: editedLesson.value.group?.id,
        room_id: editedLesson.value.room?.id,
        lecturer_user_id: editedLesson.value.lecturer?.id
      }

      delete payload.subject
      delete payload.group
      delete payload.room
      delete payload.lecturer

      try {
        if (editedLesson.value.id) {
          await lessonsStore.updateLesson(editedLesson.value.id, payload)
        } else {
          if (isRecurring.value) {
            const seriesPayload = {
              lesson: payload,
              repeat_every_days: repeatEveryDays.value,
              occurrences: occurrences.value
            }
            await lessonsStore.createLessonSeries(seriesPayload)
          } else {
            await lessonsStore.createLesson(payload)
          }
        }
        emit('save')
        closeDialog()
      } catch (e) {
        console.error(e)
      }
    }

    const isFormValid = computed(() => {
      const basicValid = !!editedLesson.value.subject &&
        !!editedLesson.value.group &&
        !!editedLesson.value.starts_at &&
        !!editedLesson.value.ends_at &&
        !!editedLesson.value.lesson_type &&
        !!editedLesson.value.status &&
        !!editedLesson.value.room &&
        !!editedLesson.value.lecturer

      if (!basicValid) return false

      // Check if end time is after start time
      const start = new Date(editedLesson.value.starts_at)
      const end = new Date(editedLesson.value.ends_at)
      if (end <= start) return false

      if (isRecurring.value && !editedLesson.value.id) {
        return repeatEveryDays.value >= 1 && occurrences.value >= 1
      }

      return true
    })

    return {
      editedLesson,
      editedLessonStartDate,
      editedLessonStartTime,
      editedLessonEndDate,
      editedLessonEndTime,
      menuStart,
      menuEnd,
      isRecurring,
      repeatEveryDays,
      occurrences,
      lessonTypes,
      lecturers,
      roomsWithLabels,
      subjectsStore,
      groupsStore,
      lessonsStore,
      formatDateTimeDisplay,
      updateStartDateTime,
      updateEndDateTime,
      closeDialog,
      saveLesson,
      isFormValid
    }
  }
}
</script>