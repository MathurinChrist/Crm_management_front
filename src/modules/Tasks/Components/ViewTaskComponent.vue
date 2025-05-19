<template>
  <q-dialog v-model="viewTask" transition-show="jump-up" transition-hide="jump-down">
    <q-card class="task-detail-card">
      <q-bar class="bg-primary text-white">
        <div class="text-h6 text-weight-bold">{{ currentTask.title }}</div>
        <q-space />
        <q-btn flat round dense icon="close" @click="close" class="close-btn" />
      </q-bar>

      <q-tabs
        v-model="activeTab"
        dense
        class="bg-grey-2 text-primary shadow-1"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="info" icon="info" label="Informations" />
        <q-tab name="commentaires" icon="comment" label="Commentaires" />
        <q-tab name="piecesJointes" icon="attachment" label="Pièces Jointes" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated swipeable>
        <q-tab-panel name="info" class="q-pa-none">
          <div class="row q-col-gutter-md">
            <!-- Section principale -->
            <div class="col-md-7 col-12">
              <q-card flat class="q-pa-md">
                <q-select
                  filled
                  v-model="currentTask.status"
                  label="Statut"
                  :options="['En attente', 'En cours', 'Terminé']"
                  :rules="[val => !!val || 'Sélection requise']"
                  emit-value
                  map-options
                  class="q-mb-md animated fadeIn"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" class="status-option">
                      <q-item-section avatar>
                        <q-icon :name="statusIcon(scope.opt)" :color="statusColor(scope.opt)" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <div class="text-h6 q-mb-sm">Description</div>
                <q-input
                  v-model="currentTask.context"
                  label="Contexte"
                  outlined
                  dense
                  placeholder="Ajouter un contexte..."
                  class="q-mb-md animated fadeIn delay-1"
                />

                <q-input
                  v-model="currentTask.description"
                  label="Description détaillée"
                  type="textarea"
                  autogrow
                  outlined
                  placeholder="Ajouter une description..."
                  class="animated fadeIn delay-2"
                />

                <q-separator class="q-my-md" />

                <div class="text-h6 q-mb-sm">Checklist</div>
                <q-list bordered separator v-if="checklist.length > 0" class="animated fadeIn delay-3">
                  <q-item
                    v-for="(item, index) in checklist"
                    :key="index"
                    class="checklist-item"
                    :class="{ 'completed': item.done }"
                  >
                    <q-item-section avatar>
                      <q-checkbox
                        v-model="item.done"
                        color="primary"
                        @update:model-value="updateChecklist"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-input
                        v-model="item.label"
                        borderless
                        dense
                        @blur="updateChecklist"
                      />
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        color="negative"
                        size="sm"
                        @click="removeChecklistItem(index)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-grey q-mb-sm">Aucun élément de checklist</div>
                <q-btn
                  flat
                  color="primary"
                  label="Ajouter un élément"
                  icon="add"
                  @click="ajouterChecklist"
                  class="animated fadeIn delay-4"
                />
              </q-card>
            </div>

            <!-- Sidebar d'informations -->
            <div class="col-md-5 col-12">
              <q-card flat bordered class="info-sidebar">
                <q-card-section>
                  <div class="text-h6 q-mb-md">Détails de la tâche</div>

                  <div class="q-mb-md">
                    <div class="text-subtitle2 text-grey-7">Statut</div>
                    <div class="text-body1">
                      <q-badge :color="statusColor(currentTask.status)" class="q-pa-sm" rounded>
                        {{ currentTask.status }}
                      </q-badge>
                    </div>
                  </div>

                  <div class="q-mb-md">
                    <div class="text-subtitle2 text-grey-7">Priorité</div>
                    <div class="text-body1">
                      <q-badge color="red" class="q-pa-sm" rounded>
                        {{ currentTask.priority || 'Urgent' }}
                      </q-badge>
                    </div>
                  </div>

                  <div class="q-mb-md">
                    <div class="text-subtitle2 text-grey-7">Dates</div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <div class="text-caption">Création</div>
                        <div class="text-body2">{{ formatDate(currentTask.createdAt) }}</div>
                      </div>
                      <div class="col-6">
                        <div class="text-caption">Échéance</div>
                        <div class="text-body2">{{ formatDate(currentTask.dueDate) || 'Non définie' }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="q-mb-md">
                    <div class="text-subtitle2 text-grey-7">Progression</div>
                    <q-linear-progress
                      :value="progressValue"
                      size="20px"
                      :color="progressColor"
                      rounded
                      class="q-mt-sm"
                    >
                      <div class="absolute-full flex flex-center">
                        <span class="text-white text-caption">{{ progressPercentage }}%</span>
                      </div>
                    </q-linear-progress>
                  </div>

                  <div class="q-mb-md">
                    <div class="text-subtitle2 text-grey-7">Assigné à</div>
                    <div class="text-body1">
                      <q-chip
                        v-if="currentTask.assignedTo"
                        icon="person"
                        color="teal"
                        text-color="white"
                      >
                        {{ currentTask.assignedTo.name }}
                      </q-chip>
                      <span v-else class="text-grey">Non assigné</span>
                    </div>
                  </div>
                </q-card-section>

                <q-card-actions class="q-px-md q-pb-md">
                  <q-btn
                    label="Annuler"
                    flat
                    @click="close"
                    class="q-mr-sm"
                  />
                  <q-btn
                    label="Enregistrer"
                    color="primary"
                    @click="saveTask"
                    :loading="saving"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="commentaires">
          <q-card-section>
            <div class="text-h6 q-mb-md">Commentaires</div>

            <q-input
              v-model="nouveauCommentaire"
              filled
              placeholder="Ajouter un commentaire..."
              type="textarea"
              autogrow
              class="q-mb-md"
            >
              <template v-slot:after>
                <q-btn
                  color="primary"
                  icon="send"
                  round
                  dense
                  @click="ajouterCommentaire"
                  :disable="!nouveauCommentaire.trim()"
                />
              </template>
            </q-input>

            <div v-if="commentaires.length > 0">
              <q-list bordered separator class="comment-list">
                <q-item
                  v-for="(commentaire, index) in commentaires"
                  :key="index"
                  class="comment-item animated fadeIn"
                  :class="`delay-${index % 5 * 0.1}s`"
                >
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">
                      {{ commentaire.author.charAt(0) }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ commentaire.author }}</q-item-label>
                    <q-item-label caption>{{ formatDate(commentaire.date) }}</q-item-label>
                    <q-item-label class="q-mt-sm">{{ commentaire.text }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-else class="text-grey text-center q-py-lg">
              <q-icon name="chat" size="2em" class="q-mb-sm" />
              <div>Aucun commentaire pour le moment</div>
            </div>
          </q-card-section>
        </q-tab-panel>

        <q-tab-panel name="piecesJointes">
          <q-card-section>
            <div class="text-h6 q-mb-md">Pièces jointes</div>

            <q-uploader
              url="/api/upload"
              label="Glissez-déposez des fichiers ou cliquez pour sélectionner"
              multiple
              class="full-width q-mb-md"
              style="max-width: 100%"
            />

            <div v-if="attachments.length > 0" class="attachment-grid">
              <q-card
                v-for="(file, index) in attachments"
                :key="index"
                class="attachment-card animated fadeIn"
                :class="`delay-${index % 5 * 0.1}s`"
              >
                <q-card-section class="row items-center">
                  <q-icon :name="fileIcon(file.type)" size="2em" class="q-mr-sm" />
                  <div class="col">
                    <div class="text-subtitle2 text-ellipsis">{{ file.name }}</div>
                    <div class="text-caption text-grey">{{ file.size }}</div>
                  </div>
                  <q-btn flat round dense icon="download" color="primary" class="q-ml-auto" />
                </q-card-section>
              </q-card>
            </div>
            <div v-else class="text-grey text-center q-py-lg">
              <q-icon name="folder_off" size="2em" class="q-mb-sm" />
              <div>Aucune pièce jointe</div>
            </div>
          </q-card-section>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-dialog>
</template>

<script>
import { date } from 'quasar'
import { useTaskStore } from "src/modules/Tasks/Store/TaskStore.js";

export default {
  name: 'ViewTaskComponent',
  setup() {
    const taskStore = useTaskStore()
    return { taskStore }
  },
  data() {
    return {
      viewTask: false,
      currentTask: {},
      checklist: [],
      nouveauCommentaire: '',
      commentaires: [
        { text: "J'ai commencé à travailler sur cette tâche", author: "Jean Dupont", date: new Date() },
        { text: "N'oubliez pas de vérifier les spécifications", author: "Marie Martin", date: new Date(Date.now() - 86400000) }
      ],
      attachments: [
        { name: "Documentation.pdf", type: "pdf", size: "2.4 MB" },
        { name: "Maquette.fig", type: "figma", size: "1.8 MB" }
      ],
      activeTab: 'info',
      saving: false
    }
  },
  computed: {
    progressValue() {
      if (this.checklist.length === 0) return 0
      const completed = this.checklist.filter(item => item.done).length
      return completed / this.checklist.length
    },
    progressPercentage() {
      return Math.round(this.progressValue * 100)
    },
    progressColor() {
      if (this.progressValue === 1) return 'positive'
      if (this.progressValue > 0.5) return 'primary'
      return 'orange'
    }
  },
  methods: {
    statusColor(status) {
      switch(status) {
        case 'Terminé': return 'positive'
        case 'En cours': return 'primary'
        case 'En attente': return 'grey'
        default: return 'dark'
      }
    },
    statusIcon(status) {
      switch(status) {
        case 'Terminé': return 'check_circle'
        case 'En cours': return 'hourglass_empty'
        case 'En attente': return 'schedule'
        default: return 'help'
      }
    },
    fileIcon(type) {
      switch(type) {
        case 'pdf': return 'picture_as_pdf'
        case 'figma': return 'design_services'
        case 'image': return 'image'
        default: return 'insert_drive_file'
      }
    },
    formatDate(d) {
      return date.formatDate(d, 'DD MMM YYYY HH:mm')
    },
    ajouterChecklist() {
      this.checklist.push({ label: 'Nouvel élément', done: false })
    },
    removeChecklistItem(index) {
      this.checklist.splice(index, 1)
    },
    updateChecklist() {
      // Sauvegarder les modifications de la checklist
    },
    ajouterCommentaire() {
      if (this.nouveauCommentaire.trim()) {
        this.commentaires.unshift({
          text: this.nouveauCommentaire,
          author: "Moi",
          date: new Date()
        })
        this.nouveauCommentaire = ''
      }
    },
    openTask(task) {
      this.currentTask = { ...task }
      this.viewTask = true
      this.activeTab = 'info'

      // Simuler une checklist pour la démo
      if (!this.checklist.length) {
        this.checklist = [
          { label: 'Analyser les besoins', done: true },
          { label: 'Créer les maquettes', done: false },
          { label: 'Développer la fonctionnalité', done: false }
        ]
      }
    },
    close() {
      this.viewTask = false
    },
    saveTask() {
      this.saving = true
      // Simuler une sauvegarde
      setTimeout(() => {
        this.saving = false
        this.$q.notify({
          message: 'Tâche enregistrée avec succès',
          color: 'positive',
          icon: 'check_circle',
          position: 'top-right'
        })
        this.close()
      }, 1000)
    }
  },
  mounted() {
    this.$emitter.on('open:task', this.openTask)
  },
  beforeUnmount() {
    this.$emitter.off('open:task', this.openTask)
  }
}
</script>

<style scoped lang="scss">
.task-detail-card {
  width: 900px;
  max-width: 95vw;
  border-radius: 12px;
  overflow: hidden;

  .close-btn {
    transition: transform 0.3s ease;

    &:hover {
      transform: rotate(90deg);
    }
  }
}

.info-sidebar {
  height: 100%;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.checklist-item {
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  &:hover {
    background-color: #f5f5f5;
    transform: translateX(3px);
  }

  &.completed {
    border-left-color: #4CAF50;
    background-color: #f0fff4;

    .q-item__label {
      text-decoration: line-through;
      color: #9E9E9E;
    }
  }
}

.comment-list {
  .comment-item {
    transition: all 0.3s ease;

    &:hover {
      background-color: #f5f5f5;
    }
  }
}

.attachment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;

  .attachment-card {
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }
  }
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

.delay-1s { animation-delay: 0.1s; }
.delay-2s { animation-delay: 0.2s; }
.delay-3s { animation-delay: 0.3s; }
.delay-4s { animation-delay: 0.4s; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fadeIn {
  animation-name: fadeIn;
}

@media (max-width: 768px) {
  .task-detail-card {
    width: 100%;
    max-width: 100%;
  }

  .attachment-grid {
    grid-template-columns: 1fr;
  }
}
</style>
