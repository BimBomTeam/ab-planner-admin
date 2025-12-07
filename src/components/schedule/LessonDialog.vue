<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="pa-4 bg-primary text-white">
        <span class="text-h5">{{ isEditing ? 'Edytuj zajęcia' : 'Dodaj zajęcia' }}</span>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="form" v-model="valid">
          <v-container>
            <v-row>
              <!-- Subject -->
              <v-col cols="12">
                <v-select
                  v-model="formData.subject_id"
                  :items="subjectsStore.subjects"
                  item-title="name"
                  item-value="id"
                  label="Przedmiot"
                  variant="outlined"
                  :rules="[v => !!v || 'Przedmiot jest wymagany']"
                  required
                ></v-select>
              </v-col>

              <!-- Group -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.group_id"
                  :items="groupsStore.groups"
                  item-title="code"
                  item-value="id"
                  label="Grupa"
                  variant="outlined"
                  :rules="[v => !!v || 'Grupa jest wymagana']"
                  required
                ></v-select>
              </v-col>

              <!-- Room -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.room_id"
                  :items="roomsStore.rooms"
                  item-title="number"
                  item-value="id"
                  label="Sala"
                  variant="outlined"
                  :rules="[v => !!v || 'Sala jest wymagana']"
                  required
                >
                   <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.raw.number" :subtitle="`Budynek: ${item.raw.building} (Poj: ${item.raw.capacity})`"></v-list-item>
                   </template>
                </v-select>
              </v-col>

              <!-- Lecturer -->
              <v-col cols="12">
                <v-select
                  v-model="formData.lecturer_user_id"
                  :items="teachers"
                  item-title="last_name"
                  item-value="id"
                  label="Wykładowca"
                  variant="outlined"
                  :rules="[v => !!v || 'Wykładowca jest wymagany']"
                  :disabled="isTeacher"
                  required
                >
                  <template v-slot:selection="{ item }">
                    {{ item.raw.first_name }} {{ item.raw.last_name }}
                  </template>
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :title="`${item.raw.first_name} ${item.raw.last_name}`"></v-list-item>
                  </template>
                </v-select>
              </v-col>

              <!-- Date & Time -->
              <v-col cols="12" md="6">
                <v-date-input
                    v-model="date"
                    label="Data"
                    variant="outlined"
                    prepend-icon=""
                ></v-date-input>
              </v-col>
              
               <!-- Using text fields for time for simplicity, ideally time picker -->
              <v-col cols="6" md="3">
                <v-text-field
                  v-model="startTime"
                  label="Od"
                  type="time"
                  variant="outlined"
                  :rules="[v => !!v || 'Wymagane']"
                ></v-text-field>
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model="endTime"
                  label="Do"
                  type="time"
                  variant="outlined"
                  :rules="[v => !!v || 'Wymagane']"
                ></v-text-field>
              </v-col>
              
              <!-- Type & Status -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.lesson_type"
                  :items="lessonsStore.lessonTypes"
                  item-title="label"
                  item-value="value"
                  label="Typ zajęć"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.status"
                  :items="lessonsStore.lessonStatuses"
                  item-title="label"
                  item-value="value"
                  label="Status"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              
              <!-- Series Options (Only for new) -->
              <v-col cols="12" v-if="!isEditing">
                <v-checkbox
                    v-model="isSeries"
                    label="Utwórz serię (powtarzalne zajęcia)"
                    density="compact"
                    hide-details
                ></v-checkbox>
              </v-col>
              
              <v-col cols="12" md="6" v-if="!isEditing && isSeries">
                 <v-text-field
                    v-model.number="seriesData.occurrences"
                    label="Liczba spotkań"
                    type="number"
                    variant="outlined"
                    min="2"
                    max="52"
                 ></v-text-field>
              </v-col>
               <v-col cols="12" md="6" v-if="!isEditing && isSeries">
                 <v-text-field
                    v-model.number="seriesData.repeat_every_days"
                    label="Co ile dni"
                    type="number"
                    variant="outlined"
                    min="1"
                 ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn
          v-if="isEditing"
          color="error"
          variant="text"
          prepend-icon="mdi-delete"
          @click="deleteLesson"
        >
          Usuń
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="close">Anuluj</v-btn>
        <v-btn
          color="primary"
          @click="save"
          :loading="saving"
          :disabled="!valid"
        >
          Zapisz
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useLessonsStore } from '@/stores/lessons'
import { useSubjectsStore } from '@/stores/subjects'
import { useRoomsStore } from '@/stores/rooms'
import { useGroupsStore } from '@/stores/groups'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'

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
    const subjectsStore = useSubjectsStore()
    const roomsStore = useRoomsStore()
    const groupsStore = useGroupsStore()
    const usersStore = useUsersStore()
    const authStore = useAuthStore()

    const form = ref(null)
    const valid = ref(false)
    const saving = ref(false)

    // Form State
    const date = ref(new Date())
    const startTime = ref('08:00')
    const endTime = ref('09:30')
    
    // Default form data
    const defaultData = {
        subject_id: null,
        group_id: null,
        room_id: null,
        lecturer_user_id: null,
        status: 'scheduled',
        lesson_type: 'lecture'
    }
    
    const formData = ref({ ...defaultData })
    
    // Series State
    const isSeries = ref(false)
    const seriesData = ref({
        occurrences: 15, // Semester default roughly
        repeat_every_days: 7 // Weekly
    })

    const isEditing = computed(() => !!props.lesson)
    const isTeacher = computed(() => authStore.isTeacher)
    const teachers = computed(() => usersStore.teacherUsers)
    
    // Dialog Model
    const dialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    // Watchers to populate form
    watch(() => props.modelValue, (val) => {
      if (val) {
        if (props.lesson) {
            // Edit Mode
            const l = props.lesson
            formData.value = {
                subject_id: l.subject.id,
                group_id: l.group.id,
                room_id: l.room.id,
                lecturer_user_id: l.lecturer.id,
                status: l.status,
                lesson_type: l.lesson_type
            }
            
            const start = new Date(l.starts_at)
            const end = new Date(l.ends_at)
            date.value = start
            startTime.value = start.toTimeString().slice(0, 5)
            endTime.value = end.toTimeString().slice(0, 5)
            
            isSeries.value = false
        } else {
            // Create Mode
            formData.value = { ...defaultData }
            
            // If user is teacher, auto-select them
            if (isTeacher.value) {
                formData.value.lecturer_user_id = authStore.user.id
            }
            
            if (props.initialDate) {
                date.value = props.initialDate
                // Default start time is often current hour or 8:00
                const h = props.initialDate.getHours()
                // If clicked on day (00:00), default to 8:00
                if (h === 0) {
                     startTime.value = '08:00'
                     endTime.value = '09:30'
                } else {
                     startTime.value = `${String(h).padStart(2, '0')}:00`
                     endTime.value = `${String(h+1).padStart(2, '0')}:30`
                }
            } else {
                 date.value = new Date()
            }
        }
      }
    })

    const close = () => {
      emit('close')
    }

    const save = async () => {
       if (!valid.value) return
       saving.value = true
       
       try {
           // Combine date and time
           const d = new Date(date.value)
           const dateStr = d.toISOString().split('T')[0]
           
           const starts_at = `${dateStr}T${startTime.value}:00Z` // Assuming local for now, but API might want ISO
           // Actually, better to construct proper Date objects and then ISO string
           // But naive approach:
           const startD = new Date(`${dateStr}T${startTime.value}`)
           const endD = new Date(`${dateStr}T${endTime.value}`)
           
           const data = {
               ...formData.value,
               starts_at: startD.toISOString(),
               ends_at: endD.toISOString()
           }
           
           if (isEditing.value) {
               await lessonsStore.updateLesson(props.lesson.id, data)
           } else {
               if (isSeries.value) {
                   await lessonsStore.createLessonSeries({
                       lesson: data,
                       repeat_every_days: seriesData.value.repeat_every_days,
                       occurrences: seriesData.value.occurrences
                   })
               } else {
                   await lessonsStore.createLesson(data)
               }
           }
           emit('save')
       } catch (e) {
           console.error(e)
           // ideally show snackbar
       } finally {
           saving.value = false
       }
    }
    
    const deleteLesson = async () => {
        if (!confirm('Czy na pewno chcesz usunąć te zajęcia?')) return
        saving.value = true
        try {
            await lessonsStore.deleteLesson(props.lesson.id)
            emit('save')
        } catch (e) {
            console.error(e)
        } finally {
            saving.value = false
        }
    }

    onMounted(async () => {
        // Ensure data is loaded
        if (subjectsStore.subjects.length === 0) await subjectsStore.fetchSubjects()
        if (roomsStore.rooms.length === 0) await roomsStore.fetchRooms()
        if (groupsStore.groups.length === 0) await groupsStore.fetchGroups()
        if (usersStore.users.length === 0) await usersStore.fetchUsers() // Need teachers
    })

    return {
      dialog,
      form,
      valid,
      saving,
      formData,
      date,
      startTime,
      endTime,
      isEditing,
      isTeacher,
      teachers,
      lessonsStore,
      subjectsStore,
      roomsStore,
      groupsStore,
      usersStore,
      isSeries,
      seriesData,
      close,
      save,
      deleteLesson
    }
  }
}
</script>
