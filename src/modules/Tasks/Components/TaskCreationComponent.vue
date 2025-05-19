<template>
  <q-dialog v-model="dialog"  transition-show="scale" transition-hide="fade">
    <q-card class="task-form-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 text-weight-bold">{{ isEditMode ? 'Modifier la tâche' : 'Créer une nouvelle tâche' }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-md">
        <q-form @submit="submitForm" @reset="resetForm" class="q-gutter-md">
          <q-input v-model="form.title" label="Titre *" filled :rules="[val => !!val || 'Champ obligatoire']" lazy-rules class="animated fadeIn">
            <template v-slot:prepend>
              <q-icon name="title" />
            </template>
          </q-input>

          <q-input v-model="form.context" label="Contexte *" filled :rules="[val => !!val || 'Champ obligatoire']" lazy-rules class="animated fadeIn delay-1">
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-input>

          <q-input v-model="form.description" label="Description" filled type="textarea" autogrow class="animated fadeIn delay-2">
            <template v-slot:prepend>
              <q-icon name="notes" />
            </template>
          </q-input>

          <div class="row">
            <div class="col-md-6 col-12">
              <q-select v-model="form.status" :options="statusOptions" label="Statut *" filled :rules="[val => !!val || 'Champ obligatoire']" emit-value map-options class="animated fadeIn delay-3">
                <template v-slot:prepend>
                  <q-icon name="flag" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" class="status-option">
                    <q-item-section avatar>
                      <q-icon :name="statusIcon(scope.opt.value)" :color="statusColor(scope.opt.value)" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-md-6 col-12">
              <q-select v-model="form.project" :options="projectOptions" label="Projet *" disable filled :rules="[val => !!val || 'Champ obligatoire']" emit-value readonly map-options class="animated fadeIn delay-4">
                <template v-slot:prepend>
                  <q-icon name="folder" />
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-mt-lg justify-end">
            <q-btn label="Annuler" flat color="grey" @click="resetForm" class="q-mr-sm animated fadeIn delay-5"/>
            <q-btn :label="isEditMode ? 'Mettre à jour' : 'Créer'" color="primary" type="submit" class="animated fadeIn delay-6" :loading="submitting"/>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { useQuasar } from 'quasar'
import { useProjectStore } from "src/modules/Projects/store/projectStore.js"
import { useTaskStore } from "src/modules/Tasks/Store/TaskStore.js"

export default {
  name: 'CreateTaskForm',
  data() {
    return {
      dialog: false,
      submitting: false,
      isEditMode: false,
      form: {
        title: '',
        context: '',
        description: '',
        status: null,
        project: null
      },
      projectOptions: []
    }
  },
  setup() {
    const projectStore = useProjectStore()
    const taskStore = useTaskStore()
    const $q = useQuasar()
    return { $q, projectStore, taskStore }
  },
  mounted() {
    this.$emitter.on('open:dialog', this.openDialog)
    this.$emitter.on('edit:task', this.editTask)
  },
  beforeUnmount() {
    this.$emitter.off('open:dialog', this.openDialog)
    this.$emitter.off('edit:task', this.editTask)
    this.dialog = false
  },
  computed: {
    statusOptions () {
      return [
        { label: 'À faire', value: 'todo' },
        { label: 'En cours', value: 'in_progress' },
        { label: 'Terminé', value: 'done' }
      ]
    },
    currentProject() {
      return this.projectStore.getCurrentProject()
    }
  },
  methods: {
    statusColor(status) {
      switch(status) {
        case 'done': return 'positive'
        case 'in_progress': return 'primary'
        case 'todo': return 'grey'
        default: return 'dark'
      }
    },
    statusIcon(status) {
      switch(status) {
        case 'done': return 'check_circle'
        case 'in_progress': return 'hourglass_empty'
        case 'todo': return 'schedule'
        default: return 'help'
      }
    },
    openDialog(data) {
      if (data.name !== 'taskDialog') return
      this.isEditMode = false
      this.projectOptions = this.projectStore.getAllProjects().map(project => ({
        label: project?.name,
        value: project?.id
      }))
      this.form.project = this.currentProject?.id
      this.dialog = true
    },
    editTask(task) {
      this.isEditMode = true
      this.form = {
        id: task.id,
        title: task.title,
        context: task.context,
        description: task.description,
        status: this.statusOptions.find(opt => opt.value === task.status),
        project: task.projectId
      }
      this.projectOptions = this.projectStore.getAllProjects().map(project => ({
        label: project?.name,
        value: project?.id
      }))
      this.dialog = true
    },
    submitForm() {
      this.submitting = true
      const payload = {
        ...this.form
      }

      const action = this.isEditMode
        ? this.taskStore.updateTask(payload)
        : this.taskStore.createTask(payload)

      action.then(() => {
        this.$q.notify({
          message: this.isEditMode ? 'Tâche mise à jour' : 'Tâche créée',
          color: 'positive',
          icon: 'check_circle',
          position: 'top-right'
        })
        this.$emit('task-created')
        this.resetForm()
        this.dialog = false
      }).catch(() => {
        this.$q.notify({
          message: 'Erreur lors de la sauvegarde',
          color: 'negative',
          icon: 'error',
          position: 'top-right'
        })
      }).finally(() => {
        this.submitting = false
      })
    },
    resetForm() {
      this.form = {
        id: null,
        title: '',
        context: '',
        description: '',
        status: null,
        project: this.currentProject?.id || null
      }
      this.dialog = false
      this.isEditMode = false
    }
  }
}
</script>

<style scoped lang="scss">
.task-form-card {
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.status-option {
  transition: all 0.3s ease;

  &:hover {
    background-color: #f5f5f5;
  }
}

// Animations
.animated {
  animation-duration: 0.5s;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }
.delay-6 { animation-delay: 0.6s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fadeIn {
  animation-name: fadeIn;
}

@media (max-width: 600px) {
  .task-form-card {
    max-width: 95vw;
  }
}
</style>
