<template>
    <div class="schedule-unified">
        <div class="d-flex justify-space-between align-center mb-6">
            <h1 class="text-h4">Plan Zajęć</h1>
        </div>

        <v-card>
            <v-tabs v-model="tab" color="primary" align-tabs="start">
                <v-tab value="calendar">Kalendarz</v-tab>
                <v-tab value="list">Lista</v-tab>
            </v-tabs>

            <v-card-text>
                <v-window v-model="tab" :touch="false">
                    <v-window-item value="calendar">
                        <calendar-tab />
                    </v-window-item>

                    <v-window-item value="list">
                        <lessons-tab />
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { ref } from 'vue'
import CalendarTab from '@/components/schedule/CalendarTab.vue'
import LessonsTab from '@/components/schedule/LessonsTab.vue'

export default {
    name: 'ScheduleUnified',
    components: {
        CalendarTab,
        LessonsTab
    },
    setup() {
        const tab = ref('calendar')
        return { tab }
    }
}
</script>
