<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <h1 class="text-h4 q-ma-none">Tâches</h1>
      <q-space />
    </div>

    <q-tabs
      v-model="activeTab"
      align="left"
      active-color="primary"
      indicator-color="primary"
      class="text-grey"
    >
      <q-tab name="all" label="Toutes" icon="list"/>
      <q-tab name="todo" label="À faire" icon="radio_button_unchecked"/>
      <q-tab name="current" label="En cours" icon="pending_actions"/>
      <q-tab name="done" label="Terminées" icon="check_circle"/>
    </q-tabs>

    <q-separator />
    <div v-if="taskLoading" class="full-width flex flex-center">
      <q-spinner size="50px" color="primary" />
    </div>
    <div v-else>
      <q-list bordered separator class="rounded-borders q-my-md">
        <q-item
          v-for="task in filteredTasks"
          :key="task.id"
          clickable
          v-ripple
          @click="openTaskDetail(task)"
          class="task-item"
        >
          <q-item-section avatar>
            <q-icon :name="statusIcon(task.status)" :color="statusColor(task.status)" size="md"/>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ task.title }}</q-item-label>
            <q-item-label caption class="row items-center">
              <span v-if="task.context" class="q-mr-sm"><q-icon name="label" size="xs" /> {{ task.context }}</span>
              <span><q-icon name="folder" size="xs" /> Projet {{ task.project.createdBy.firstName }}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side class="row items-center">
            <q-avatar size="sm" color="grey-3" text-color="primary" class="q-mr-sm">
              {{ task.createdBy.firstName.charAt(0) }}{{ task.createdBy.lastName.charAt(0) }}
            </q-avatar>
            <q-icon name="chevron_right" color="grey" />
          </q-item-section>
        </q-item>

        <q-item v-if="filteredTasks.length === 0">
          <q-item-section class="text-center text-grey-6">
            <q-icon name="search_off" size="2em" />
            <div>Aucune tâche trouvée</div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <ViewTaskComponent @refresh-task ="refreshTasks" />
  </q-page>
</template>


<script>
import { date } from 'quasar'
import ViewTaskComponent from 'src/modules/Tasks/Components/ViewTaskComponent.vue'
import { useTaskStore } from 'src/modules/Tasks/Store/TaskStore.js'
export default {
  components: { ViewTaskComponent },
  setup () {
    const taskStore = useTaskStore()
    return {
      taskStore
    }
  },
  data () {
    return {
      taskLoading: false,
      activeTab: 'all',
      showTaskDetail: false,
      showTaskForm: false,
      selectedTask: {},
      editingTask: null,
      newComment: '',
      tasks: []
    }
  },
  computed: {
    filteredTasks () {
      if (this.activeTab === 'all') {
        return this.tasks
      }
      return this.tasks.filter(t => t.status === this.activeTab)
    }
  },
  mounted() {
    this.taskLoading = false
    this.taskStore.getTaskForAllProjects().then(data => {
      this.tasks = data.tasks
    })
  },

  methods: {
    statusIcon (status) {
      return {
        todo: 'radio_button_unchecked',
        in_progress: 'pending_actions',
        done: 'check_circle'
      }[status] || 'help_outline'
    },

    statusColor (status) {
      return {
        todo: 'orange',
        in_progress: 'blue',
        done: 'green'
      }[status] || 'grey'
    },

    formatStatus (status) {
      return {
        todo: 'À faire',
        in_progress: 'En cours',
        done: 'Terminée'
      }[status] || status
    },

    formatDate (dateStr) {
      return date.formatDate(dateStr, 'DD MMM YYYY, HH:mm')
    },

    openTaskDetail (task) {
      this.selectedTask = { ...task }
      this.$emitter.emit('open:task', this.selectedTask)
    },

    openTaskForm () {
      this.editingTask = null
      this.showTaskForm = true
    },

    editTask (task) {
      this.editingTask = { ...task }
      this.showTaskDetail = false
      this.showTaskForm = true
    },

    addComment () {
      if (!this.newComment.trim()) return
      console.log('Commentaire ajouté :', this.newComment)
      this.newComment = ''
    },

    handleTaskSaved (task) {
      this.showTaskForm = false
      const idx = this.tasks.findIndex(t => t.id === task.id)
      if (idx >= 0) {
        this.tasks.splice(idx, 1, task)
      } else {
        this.tasks.unshift(task)
      }
    }
  }
}
</script>


<style scoped>
.task-item {
  transition: all 0.3s ease;
  border-radius: 6px;
}
.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.rounded-borders {
  border-radius: 8px;
}
</style>

