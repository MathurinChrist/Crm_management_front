<template>
  <q-page class="q-pa-md">

    <!-- Header avec actions -->
    <div class="row items-center q-mb-md">
      <h1 class="text-h4 q-ma-none">Tâches</h1>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        label="Nouvelle tâche"
        @click="openTaskForm"
        no-caps
      />
      <q-btn
        flat
        round
        icon="filter_list"
        class="q-ml-sm"
      >
        <q-tooltip>Filtrer les tâches</q-tooltip>
      </q-btn>
    </div>

    <!-- Tabs de statut -->
    <q-tabs
      v-model="activeTab"
      align="left"
      active-color="primary"
      indicator-color="primary"
      class="text-grey"
    >
      <q-tab name="all" label="Toutes" icon="list"/>
      <q-tab name="todo" label="À faire" icon="radio_button_unchecked"/>
      <q-tab name="in_progress" label="En cours" icon="pending_actions"/>
      <q-tab name="done" label="Terminées" icon="check_circle"/>
    </q-tabs>

    <q-separator />

    <!-- Liste des tâches -->
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

    <ViewTaskComponent @refresh-task ="refreshTasks" />

<!--    <q-dialog v-model="showTaskForm">-->
<!--      <task-form :task="editingTask" @close="showTaskForm = false" @saved="handleTaskSaved"/>-->
<!--    </q-dialog>-->
  </q-page>
</template>


<script>
import { date } from 'quasar'
import ViewTaskComponent from 'src/modules/Tasks/Components/ViewTaskComponent.vue'
export default {
  components: { ViewTaskComponent },
  data () {
    return {
      activeTab: 'all',
      showTaskDetail: false,
      showTaskForm: false,
      selectedTask: {},
      editingTask: null,
      newComment: '',
      tasks: [
        {
          id: 9,
          title: "Préparer la réunion client",
          context: "Travail",
          description: "Créer l'ordre du jour et les slides de présentation",
          status: "todo",
          createdAt: "2025-07-01T09:00:00Z",
          updatedAt: "2025-07-01T09:00:00Z",
          project: {
            id: 101,
            createdBy: { firstName: "Alice", lastName: "Dupont" }
          },
          createdBy: { firstName: "Alice", lastName: "Dupont" }
        },
        {
          id: 10,
          title: "Acheter les courses",
          context: "Personnel",
          description: "Fruits, légumes, lait et céréales",
          status: "done",
          createdAt: "2025-07-15T12:30:00Z",
          updatedAt: "2025-07-15T12:30:00Z",
          project: {
            id: 102,
            createdBy: { firstName: "Léo", lastName: "Martin" }
          },
          createdBy: { firstName: "Léo", lastName: "Martin" }
        },
        {
          id: 3,
          title: "Corriger les bugs de production",
          context: "Développement",
          description: "Voir le ticket #3472 et appliquer les correctifs",
          status: "in_progress",
          createdAt: "2025-07-16T14:00:00Z",
          updatedAt: "2025-07-16T14:00:00Z",
          project: {
            id: 103,
            createdBy: { firstName: "Sophie", lastName: "Moreau" }
          },
          createdBy: { firstName: "Sophie", lastName: "Moreau" }
        },
        {
          id: 4,
          title: "Envoyer les factures de juin",
          context: "Comptabilité",
          description: "Envoyer les factures aux clients avant le 20 juillet",
          status: "todo",
          createdAt: "2025-07-10T10:00:00Z",
          updatedAt: "2025-07-10T10:00:00Z",
          project: {
            id: 104,
            createdBy: { firstName: "Clara", lastName: "Lemoine" }
          },
          createdBy: { firstName: "Clara", lastName: "Lemoine" }
        },
        {
          id: 5,
          title: "Nettoyer la base de données",
          context: "Maintenance",
          description: "Supprimer les anciens logs et entrées obsolètes",
          status: "in_progress",
          createdAt: "2025-07-14T08:45:00Z",
          updatedAt: "2025-07-14T08:45:00Z",
          project: {
            id: 105,
            createdBy: { firstName: "Mathurin", lastName: "Kimbembe" }
          },
          createdBy: { firstName: "Mathurin", lastName: "Kimbembe" }
        }
      ]
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

