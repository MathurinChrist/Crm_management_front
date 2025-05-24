<template>
  <q-dialog v-model="showDialog" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="task-editor bg-grey-1">
      <div class="editor-header bg-primary text-white">
        <q-btn flat round icon="arrow_back" class="absolute-top-left q-ma-md" @click="closeDialog"/>
        <div class="header-content column items-center q-pt-xl q-pb-lg">
          <div class="text-h6 text-weight-medium">{{ task.title || 'Nouvelle tâche' }}</div>
          <div class="text-caption q-mt-xs">
            Créé le {{ formatDate(task.createdAt) }} par {{ task.createdBy.name }}
          </div>
        </div>
        <q-btn flat label="Enregistrer" class="absolute-top-right q-ma-md" @click="saveTask" :loading="isSaving"/>
      </div>

      <q-scroll-area class="content-area">
        <div class="q-pa-lg">
          <div class="main-section bg-white q-pa-lg shadow-1 rounded-borders">
            <q-input v-model="task.title" :disable="disable" @click = !disable label="Titre de la tâche" borderless class="task-title q-mb-lg" input-class="text-h5 text-weight-medium" :input-style="{ 'min-height': '48px' }" placeholder="Donnez un titre clair à votre tâche..."/>
            <q-input v-model="task.context" label="Contexte de la tâche" borderless class="task-title q-mb-lg" input-class="text-h5 text-weight-medium" :input-style="{ 'min-height': '48px' }" placeholder="contexte de la tâche"/>

            <div class="row q-col-gutter-lg q-mb-lg">
              <div class="col-xs-12 col-sm-6">
                <q-select v-model="task.status" :options="statusOptions" label="Statut" outlined dense emit-value map-options options-dense class="status-select">
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" class="q-pa-sm">
                      <q-item-section avatar>
                        <q-icon
                          :name="statusIcons[scope.opt.value]"
                          :color="statusColors[scope.opt.value]"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="scope">
                    <q-chip v-if="scope.opt" dense :color="statusColors[scope.opt.value]" text-color="white">
                      <q-icon :name="statusIcons[scope.opt.value]" class="q-mr-xs" />
                      {{ scope.opt.label }}
                    </q-chip>
                  </template>
                </q-select>
              </div>
              <div class="col-xs-12 col-sm-6">
                <q-select v-model="assignedUser" :options="userOptions" label="Assigner à" outlined dense use-input options-dense @filter="filterUsers" class="user-select">
                  <template v-slot:selected-item="scope">
                    <q-chip v-if="scope.opt" dense color="primary" text-color="white" class="q-ma-none">
                      <q-avatar>
                        <img :src="`https://i.pravatar.cc/40?u=${scope.opt.id}`" />
                      </q-avatar>
                      {{ scope.opt.name }}
                    </q-chip>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" class="q-pa-sm">
                      <q-item-section avatar>
                        <q-avatar>
                          <img :src="`https://i.pravatar.cc/40?u=${scope.opt.id}`" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.role }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>

            <div class="row q-col-gutter-lg q-mb-lg">
              <div class="col-xs-12 col-sm-6">
                <q-input v-model="task.dueDate" label="Date d'échéance" outlined dense mask="##/##/####" :rules="['date']">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="task.dueDate" minimal>
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Fermer" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-xs-12 col-sm-6">
                <q-select v-model="task.priority" :options="priorityOptions" label="Priorité" outlined dense emit-value map-options options-dense>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" class="q-pa-sm">
                      <q-item-section avatar>
                        <q-icon :name="priorityIcons[scope.opt.value]" :color="priorityColors[scope.opt.value]" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="scope">
                    <q-chip v-if="scope.opt" dense :color="priorityColors[scope.opt.value]" text-color="white">
                      <q-icon :name="priorityIcons[scope.opt.value]" class="q-mr-xs" />
                      {{ scope.opt.label }}
                    </q-chip>
                  </template>
                </q-select>
              </div>
            </div>

            <q-input v-model="task.description" label="Description" outlined type="textarea" autogrow class="q-mb-lg description-input" placeholder="Décrivez en détail la tâche à accomplir..." :input-style="{ 'min-height': '100px' }"/>

            <div class="checklist-section q-mb-lg">
              <div class="text-subtitle1 text-weight-medium q-mb-sm">Checklist</div>
              <div class="checklist-items">
                <div v-for="(item, index) in task?.checklist" :key="index" class="checklist-item row items-center q-pa-sm">
                  <q-checkbox v-model="item.completed" class="q-mr-sm" @update:model-value="updateChecklistProgress"/>
                  <q-input v-model="item.text" borderless dense placeholder="Élément de la checklist" class="col-grow" :class="{ 'text-strike': item.completed }" @blur="updateChecklistProgress"/>
                  <q-btn flat round icon="delete" size="sm" color="negative" @click="removeChecklistItem(index)"/>
                </div>
              </div>
              <div class="row items-center q-mt-sm">
                <q-btn flat icon="add" label="Ajouter un élément" color="primary" size="sm" @click="addChecklistItem"/>
                <q-linear-progress v-if="task?.checklist.length > 0" :value="checklistProgress" color="positive" class="col-grow q-ml-md" style="height: 8px" rounded/>
                <div v-if="task?.checklist.length > 0" class="text-caption text-grey q-ml-sm">
                  {{ completedChecklistItems }} sur {{ task.checklist.length }} complétés
                </div>
              </div>
            </div>

            <q-tabs v-model="tab" dense class="text-grey-7 q-mb-md" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
              <q-tab name="comments" icon="chat" label="Commentaires" />
              <q-tab name="attachments" icon="attachment" label="Pièces jointes" />
              <q-tab name="activity" icon="history" label="Activité" />
            </q-tabs>

            <q-separator class="q-mb-lg" />

            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="comments">
                <div class="comment-list q-gutter-y-lg">
                  <div v-for="comment in task.comments" :key="comment.id" class="comment-item">
                    <div class="row items-start">
                      <q-avatar size="md">
                        <img :src="`https://i.pravatar.cc/40?u=${comment.author.id}`" />
                      </q-avatar>
                      <div class="q-ml-sm comment-bubble">
                        <div class="comment-header">
                          <span class="text-weight-bold">{{ comment.author.name }}</span>
                          <span class="text-caption text-grey q-ml-sm">
                            {{ formatRelativeDate(comment.createdAt) }}
                          </span>
                        </div>
                        <div class="comment-content q-pt-xs">{{ comment.content }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="new-comment q-pt-md">
                    <q-input v-model="newComment" outlined placeholder="Ajouter un commentaire..." type="textarea" rows="2" autogrow class="comment-input">
                      <template v-slot:after>
                        <q-btn round flat icon="send"
                          color="primary" @click="addComment" :disable="!newComment.trim()" class="send-btn"/>
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="attachments">
                <div class="attachment-list">
                  <q-list bordered separator class="rounded-borders">
                    <q-item v-for="file in task.attachments" :key="file.id" class="attachment-item q-py-sm">
                      <q-item-section avatar>
                        <q-icon :name="getFileIcon(file.type)" size="md" :color="getFileColor(file.type)"/>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="text-weight-medium">{{ file.name }}</q-item-label>
                        <q-item-label caption class="q-mt-xs">
                          {{ formatFileSize(file.size) }} ·
                          Ajouté le {{ formatDate(file.uploadedAt) }} par {{ file.uploadedBy.name }}
                        </q-item-label>
                      </q-item-section>

                      <q-item-section side>
                        <div class="row q-gutter-xs">
                          <q-btn icon="visibility" flat round dense color="grey-7" @click="previewFile(file)"/>
                          <q-btn icon="download" flat round dense color="grey-7" @click="downloadFile(file)"/>
                          <q-btn icon="delete" flat round dense color="negative" @click="confirmDeleteFile(file)"/>
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <q-uploader class="q-mt-md" label="Glisser-déposer des fichiers ici" multiple bordered flat style="max-width: 100%" @added="onFilesAdded" color="primary"/>
                </div>
              </q-tab-panel>

              <q-tab-panel name="activity">
                <div class="activity-timeline q-gutter-y-md">
                  <div v-for="(activity, index) in activities" :key="index" class="activity-item">
                    <div class="row items-start">
                      <div class="timeline-marker">
                        <q-avatar size="sm" color="primary" text-color="white" class="timeline-avatar">
                          {{ activity.user.name.charAt(0) }}
                        </q-avatar>
                        <div v-if="index !== activities.length - 1" class="timeline-line"></div>
                      </div>
                      <div class="q-ml-sm timeline-content">
                        <div class="text-caption">
                          <span class="text-weight-medium">{{ activity.user.name }}</span>
                          <span class="text-grey q-ml-sm">
                            {{ formatRelativeDate(activity.date) }}
                          </span>
                        </div>
                        <div class="text-body2 q-mt-xs">{{ activity.text }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </q-scroll-area>
    </q-card>
  </q-dialog>
</template>

<script>
import { date } from 'quasar'
import { useQuasar } from 'quasar'
import { useTaskStore } from 'src/modules/Tasks/Store/TaskStore.js'

export default {
  name: 'TaskDetails',
  setup () {
    const taskStore = useTaskStore()
    return {
      taskStore
    }
  },
  data() {
    return {
      disable: false,
      showDialog: false,
      tab: 'comments',
      newComment: '',
      isSaving: false,
      checklistProgress: 0,
      completedChecklistItems: 0,
      task: null,
      assignedUser: null,
      filteredUserOptions: [],
      users: [
        { id: 1, firstName: "Alex", lastName: "Dupont", role: "Product Owner" },
        { id: 2, firstName: "Sophie", lastName: "Martin", role: "UX Designer" },
        { id: 3, firstName: "Marc", lastName: "Leroy", role: "Frontend Dev" },
        { id: 4, firstName: "Julie", lastName: "Bernard", role: "Backend Dev" },
        { id: 5, firstName: "Thomas", lastName: "Petit", role: "QA Engineer" }
      ],
      activities: [
        {
          id: 1,
          text: "a modifié le statut de 'À faire' à 'En cours'",
          user: { id: 2, name: "Sophie Martin" },
          date: new Date(Date.now() - 7200000)
        },
        {
          id: 2,
          text: "a ajouté la pièce jointe 'maquette-figma.fig'",
          user: { id: 2, name: "Sophie Martin" },
          date: new Date(Date.now() - 86400000)
        },
        {
          id: 3,
          text: "a créé la tâche",
          user: { id: 1, name: "Alex Dupont" },
          date: new Date(Date.now() - 172800000)
        }
      ],
      statusOptions: [
        { label: 'À faire', value: 'todo' },
        { label: 'En cours', value: 'current' },
        { label: 'En revue', value: 'review' },
        { label: 'Terminé', value: 'done' }
      ],
      priorityOptions: [
        { label: 'Basse', value: 'low' },
        { label: 'Moyenne', value: 'medium' },
        { label: 'Haute', value: 'high' },
        { label: 'Urgente', value: 'critical' }
      ],
      statusIcons: {
        todo: 'radio_button_unchecked',
        current: 'play_circle',
        review: 'remove_red_eye',
        done: 'check_circle'
      },
      statusColors: {
        todo: 'orange',
        current: 'blue',
        review: 'purple',
        done: 'green'
      },
      priorityIcons: {
        low: 'arrow_downward',
        medium: 'horizontal_rule',
        high: 'arrow_upward',
        critical: 'warning'
      },
      priorityColors: {
        low: 'green',
        medium: 'blue',
        high: 'orange',
        critical: 'red'
      }
    }
  },
  computed: {
    userOptions() {
      return this.filteredUserOptions.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
      }))
    }
  },
  created() {
    this.$q = useQuasar()
    this.filteredUserOptions = [...this.users]
  },
  mounted() {
    this.$emitter.on('open:task', this.openTaskDetail)
    this.updateChecklistProgress()
  },
  beforeUnmount() {
    this.$emitter.off('open:task', this.openTaskDetail)
    this.closeDialog()
  },
  methods: {
    openTaskDetail (task) {
      this.task = {
        ...task,
        priority: "medium",
        dueDate: date.formatDate(Date.now() + 86400000 * 3),
        assignedTo: {
          id: 2,
          name: "Sophie Martin",
          role: "UX Designer"
        },
        checklist: [
          { text: "Créer les maquettes Figma", completed: true },
          { text: "Valider avec le client", completed: false },
          { text: "Implémenter les composants", completed: false }
        ],
        comments: [
          {
            id: 1,
            content: "Il faudrait ajouter des animations pour les transitions entre les pages.",
            author: {
              id: 3,
              name: "Marc Leroy",
              role: "Frontend Dev"
            },
            createdAt: new Date(Date.now() - 3600000 * 2)
          },
          {
            id: 2,
            content: "Je suis d'accord, j'ai quelques idées pour les animations.",
            author: {
              id: 2,
              name: "Sophie Martin",
              role: "UX Designer"
            },
            createdAt: new Date(Date.now() - 3600000)
          }
        ],
        attachments: [
          {
            id: 1,
            name: "maquette-figma.fig",
            type: "application/fig",
            size: 2457600,
            url: "#",
            uploadedAt: new Date(Date.now() - 86400000),
            uploadedBy: {
              id: 2,
              name: "Sophie Martin"
            }
          },
          {
            id: 2,
            name: "inspiration-ui.jpg",
            type: "image/jpeg",
            size: 512000,
            url: "#",
            uploadedAt: new Date(Date.now() - 43200000),
            uploadedBy: {
              id: 3,
              name: "Marc Leroy"
            }
          }
        ]
      }
      this.showDialog = true
      this.assignedUser = this.task?.assignedTo?.id || null
    },

    updateChecklistProgress() {
      if (!this.task?.checklist) return
      const completed = this.task.checklist.filter(item => item.completed).length
      this.completedChecklistItems = completed
      this.checklistProgress = this.task.checklist.length > 0
        ? completed / this.task.checklist.length
        : 0
    },
    addChecklistItem() {
      this.task.checklist.push({ text: '', completed: false })
    },
    removeChecklistItem(index) {
      this.task.checklist.splice(index, 1)
      this.updateChecklistProgress()
    },
    formatDate(dateObj) {
      return date.formatDate(dateObj, 'DD/MM/YYYY à HH:mm')
    },
    formatRelativeDate(dateObj) {
      const now = new Date()
      const diff = now - dateObj
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (minutes < 1) return 'à l\'instant'
      if (minutes < 60) return `il y a ${minutes} min`
      if (hours < 24) return `il y a ${hours} h`
      if (days === 1) return 'hier'
      if (days < 7) return `il y a ${days} j`
      return date.formatDate(dateObj, 'DD/MM/YYYY')
    },
    getFileIcon(fileType) {
      if (!fileType) return 'insert_drive_file'
      const type = fileType.split('/')[0]
      switch (type) {
        case 'image': return 'image'
        case 'video': return 'videocam'
        case 'audio': return 'audiotrack'
        case 'application':
          if (fileType.includes('pdf')) return 'picture_as_pdf'
          if (fileType.includes('word')) return 'description'
          if (fileType.includes('excel') || fileType.includes('sheet')) return 'grid_on'
          if (fileType.includes('fig')) return 'brush'
          return 'insert_drive_file'
        default: return 'insert_drive_file'
      }
    },
    getFileColor(fileType) {
      if (!fileType) return 'grey'
      const type = fileType.split('/')[0]
      switch (type) {
        case 'image': return 'red'
        case 'video': return 'purple'
        case 'audio': return 'blue'
        case 'application':
          if (fileType.includes('pdf')) return 'red'
          if (fileType.includes('word')) return 'blue'
          if (fileType.includes('excel') || fileType.includes('sheet')) return 'green'
          if (fileType.includes('fig')) return 'orange'
          return 'grey'
        default: return 'grey'
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    filterUsers(val, update) {
      if (val === '') {
        update(() => {
          this.filteredUserOptions = [...this.users]
        })
        return
      }
      update(() => {
        this.filteredUserOptions = this.users.filter(user =>
          (`${user.firstName} ${user.lastName}`).toLowerCase().includes(val.toLowerCase())
        )
      })
    },
    addComment() {
      if (!this.newComment.trim()) return
      const comment = {
        id: Date.now(),
        content: this.newComment.trim(),
        author: this.users.find(u => u.id === this.assignedUser) || { id: 0, name: 'Anonyme' },
        createdAt: new Date()
      }
      this.task.comments.push(comment)
      this.newComment = ''
    },
    saveTask() {
      this.isSaving = true
      this.taskStore.updateTask(this.task).then(() => {
        this.$q.notify({
          type: 'positive',
          message: 'Tâche sauvegardée !',
          position: 'top',
          icon: 'check_circle'
        })
      }).catch((data) => {
        this.$q.notify({
          type: 'negatif',
          message: data?.message ?? 'Erreur sur la modifiaction',
          position: 'top',
          icon: 'check_circle'
        })
      }).finally(() => {
        this.closeDialog()
        this.$emit('refresh-task')
      })

    },
    closeDialog() {
      this.showDialog = false
      this.isSaving = false
      this.task =  null
    },
    previewFile(file) {
      this.$q.notify({
        message: `Prévisualisation du fichier: ${file.name}`,
        color: 'info',
        icon: 'visibility'
      })
    },
    downloadFile(file) {
      this.$q.notify({
        message: `Téléchargement du fichier: ${file.name}`,
        color: 'info',
        icon: 'download'
      })
    },
    confirmDeleteFile(file) {
      this.$q.dialog({
        title: 'Supprimer le fichier ?',
        message: `Êtes-vous sûr de vouloir supprimer "${file.name}" ?`,
        persistent: true,
        ok: {
          label: 'Supprimer',
          color: 'negative',
          flat: true
        },
        cancel: {
          label: 'Annuler',
          color: 'primary',
          flat: true
        }
      }).onOk(() => {
        const index = this.task.attachments.findIndex(f => f.id === file.id)
        if (index !== -1) {
          this.task.attachments.splice(index, 1)
          this.$q.notify({
            type: 'positive',
            message: 'Fichier supprimé',
            icon: 'delete'
          })
        }
      })
    },
    onFilesAdded(files) {
      files.forEach(file => {
        this.task.attachments.push({
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: '',
          uploadedAt: new Date(),
          uploadedBy: { id: this.assignedUser || 0, name: 'Utilisateur' }
        })
      })
      this.$q.notify({
        type: 'positive',
        message: `${files.length} fichier(s) ajouté(s)`,
        icon: 'attachment'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.task-editor {
  min-width: 500px;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.editor-header {
  height: 120px;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);

  .header-content {
    text-align: center;
    padding-top: 20px;
  }
}

.content-area {
  flex-grow: 1;
  overflow: auto;
  margin-top: -20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  background: white;
  position: relative;
  z-index: 1;
}

.main-section {
  margin-top: 20px;
  border-radius: 12px;
}

.task-title {
  font-weight: 700;
  transition: all 0.3s ease;

  &:focus-within {
    transform: translateY(-2px);
  }
}

.description-input {
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }
}

.checklist-section {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;

  .checklist-items {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 8px;
  }

  .checklist-item {
    transition: all 0.2s ease;
    border-radius: 4px;

    &:hover {
      background-color: #f5f5f5;
    }

    .text-strike {
      text-decoration: line-through;
      color: #9e9e9e;
    }
  }
}

.comment-bubble {
  background-color: #f5f5f5;
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 80%;
  transition: all 0.3s ease;

  &:hover {
    background-color: #eeeeee;
  }
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.comment-input {
  border-radius: 20px;
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }
}

.send-btn {
  transition: transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
}

.attachment-item {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
    transform: translateX(2px);
  }
}

.activity-timeline {
  max-height: 300px;
  overflow-y: auto;
  padding-left: 8px;
}

.timeline-marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
}

.timeline-avatar {
  z-index: 1;
}

.timeline-line {
  position: absolute;
  top: 28px;
  bottom: -28px;
  width: 2px;
  background-color: #e0e0e0;
}

.timeline-content {
  padding-bottom: 24px;
}

.status-select {
  .q-chip {
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  }
}

.user-select {
  .q-chip {
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  }
}

.q-tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

// Animation pour les éléments de checklist
.checklist-item {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
