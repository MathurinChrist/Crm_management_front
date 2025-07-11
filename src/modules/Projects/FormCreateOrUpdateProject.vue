<template>
  <q-dialog
    v-model="showDialog"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card class="project-form-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 text-weight-bold">
          <q-icon :name="isEditMode ? 'edit' : 'add'" class="q-mr-sm" />
          {{ isEditMode ? 'Modifier le projet' : 'Nouveau Projet' }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-md">
        <q-form class="q-gutter-md" @submit.prevent="handleSubmit">
          <q-input
            filled
            v-model="project.name"
            label="Nom du projet *"
            :rules="[val => !!val || 'Champ obligatoire']"
            lazy-rules
            class="animated fadeIn"
          >
            <template v-slot:prepend>
              <q-icon name="badge" />
            </template>
          </q-input>

          <q-select
            filled
            v-model="project.status"
            label="Statut *"
            :options="statusOptions"
            :rules="[val => !!val || 'Sélection requise']"
            :readonly="!isEditMode"
            emit-value
            map-options
            class="animated fadeIn delay-1"
          >
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

          <q-input
            filled
            v-model="project.description"
            label="Description"
            type="textarea"
            rows="5"
            autogrow
            class="animated fadeIn delay-2"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-input>

          <div class="row justify-end q-mt-lg">
            <q-btn
              label="Annuler"
              flat
              color="grey"
              v-close-popup
              class="q-mr-sm animated fadeIn delay-3"
              :disable="loading"
            />
            <q-btn
              :label="isEditMode ? 'Mettre à jour' : 'Créer'"
              color="primary"
              type="submit"
              class="animated fadeIn delay-4"
              :loading="loading"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                {{ isEditMode ? 'Mise à jour...' : 'Création...' }}
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useProjectStore } from 'src/modules/Projects/store/projectStore.js'

const $q = useQuasar()
const projectStore = useProjectStore()

defineExpose({ openDialogForCreate, openDialogForEdit })
const emit = defineEmits(['project-updated'])

const showDialog = ref(false)
const isEditMode = ref(false)
const loading = ref(false)

const statusOptions = [
  { label: 'A faire', value: 'todo' },
  { label: 'En cours', value: 'current' },
  { label: 'Terminé', value: 'done' }
]

const project = ref({
  id: null,
  name: '',
  status: 'todo',
  description: ''
})

function statusColor(status) {
  switch(status) {
    case 'done': return 'positive'
    case 'current': return 'primary'
    case 'todo': return 'grey'
    default: return 'dark'
  }
}

function statusIcon(status) {
  switch(status) {
    case 'completed': return 'check_circle'
    case 'in_progress': return 'hourglass_empty'
    case 'pending': return 'schedule'
    default: return 'help'
  }
}

function openDialogForCreate() {
  resetProject()
  isEditMode.value = false
  showDialog.value = true
}

function openDialogForEdit(existingProject) {
  project.value = {
    ...existingProject
  }
  isEditMode.value = true
  showDialog.value = true
}

function resetProject() {
  project.value = {
    id: null,
    name: '',
    status: 'todo',
    description: ''
  }
}

async function handleSubmit() {
  loading.value = true

  try {
    const payload = {
      ...project.value
    }

    if (isEditMode.value) {
      await updateProject(payload)
    } else {
      await createProject(payload)
    }

    emit('project-updated')
    showDialog.value = false

    $q.notify({
      message: isEditMode.value ? 'Projet mis à jour' : 'Projet créé',
      color: 'positive',
      icon: 'check_circle',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Erreur lors de l\'envoi :', error)
    $q.notify({
      message: 'Erreur lors de l\'opération',
      color: 'negative',
      icon: 'error',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

async function createProject(payload) {
  await projectStore.createProject(payload)
}

async function updateProject(payload) {
  await projectStore.updateProject(payload)
}
</script>

<style scoped lang="scss">
.project-form-card {
  width: 100%;
  min-width: 400px;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

  .status-option {
    transition: all 0.3s ease;

    &:hover {
      background-color: #f5f5f5;
    }
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fadeIn {
  animation-name: fadeIn;
}

@media (max-width: 600px) {
  .project-form-card {
    min-width: 90vw;
  }
}
</style>
