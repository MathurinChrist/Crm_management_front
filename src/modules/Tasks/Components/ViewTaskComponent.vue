<template>
  <q-dialog v-model="showDialog" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="task-editor bg-grey-1">
      <div class="editor-header bg-primary text-white">
        <div class="header-actions row justify-between items-center q-px-md q-pt-md">
          <q-btn flat round icon="arrow_back" @click="closeDialog" class="back-btn" />
          <q-btn flat label="Enregistrer" @click="saveTask" :loading="isSaving" class="save-btn" />
        </div>

        <div class="header-content column items-center q-pb-lg">
          <div class="text-h5 text-weight-bold">{{ task.title || 'Nouvelle tâche' }}</div>
          <div class="text-caption q-mt-xs opacity-80">
            Créé le {{ formatDate(task.createdAt) }} par {{ task.createdBy?.firstName }} - {{ task.createdBy?.lastName }}
          </div>
        </div>
      </div>

      <q-scroll-area class="content-area">
        <div class="q-px-lg q-pt-lg q-pb-xl">
          <div class="main-section bg-white q-pa-lg shadow-2 rounded-borders">
            <q-input v-model="task.title" label="Titre de la tâche" borderless class="task-title q-mb-lg" input-class="text-h5 text-weight-bold" :input-style="{ 'min-height': '56px' }" placeholder="Donnez un titre clair à votre tâche..." @focus="animateInput('title')"/>
            <q-input v-model="task.context" label="Contexte" borderless class="task-context q-mb-lg" placeholder="Décrivez le contexte de cette tâche...">
              <template v-slot:prepend>
                <q-icon name="info" class="q-mr-sm" />
              </template>
            </q-input>

            <div class="row q-col-gutter-lg q-mb-lg">
              <div class="col-xs-12 col-sm-6">
                <q-select v-model="task.status" :options="statusOptions" label="Statut" outlined dense emit-value map-options class="status-select">
                  <template v-slot:selected>
                    <q-chip dense :color="statusColors[task.status]" text-color="white" class="full-width justify-between">
                      <div class="row items-center">
                        <q-icon :name="statusIcons[task.status]" class="q-mr-xs" />
                        {{ statusOptions.find(o => o.value === task.status)?.label }}
                      </div>
                      <q-icon name="expand_more" />
                    </q-chip>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" class="q-pa-sm">
                      <q-item-section avatar>
                        <q-icon :name="statusIcons[scope.opt.value]" :color="statusColors[scope.opt.value]" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <div class="col-xs-12 col-sm-6">
                <q-select filled v-model="task.assignedUsers" :options="users" label="Assign Users" multiple emit-value map-options use-chips>
                  <template v-slot:selected-item="scope">
                    <q-chip>
                      {{ scope.opt.firstName }} {{ scope.opt.lastName }}
                    </q-chip>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        {{ scope.opt.firstName }} - {{ scope.opt.lastName }}
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

              </div>
            </div>

            <div class="row q-col-gutter-lg q-mb-lg">
              <div class="col-xs-12 col-sm-6">
                <q-input v-model="task.dueDate" label="Date d'échéance" outlined dense mask="##/##/####" :rules="['date']">
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="task.dueDate" minimal :options="futureDatesOnly">
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
                <q-select v-model="task.priority" :options="priorityOptions" label="Priorité" outlined dense emit-value map-options>
                  <template v-slot:selected>
                    <q-chip dense :color="priorityColors[task.priority]" text-color="white" class="full-width justify-between">
                      <div class="row items-center">
                        <q-icon :name="priorityIcons[task.priority]" class="q-mr-xs" />
                        {{ priorityOptions.find(o => o.value === task.priority)?.label }}
                      </div>
                      <q-icon name="expand_more" />
                    </q-chip>
                  </template>
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
                </q-select>
              </div>
            </div>
            <q-input v-model="task.description" label="Description détaillée" outlined type="textarea" autogrow class="q-mb-lg description-input" placeholder="Décrivez en détail la tâche à accomplir..." :input-style="{ 'min-height': '120px' }" counter maxlength="1000" @focus="animateInput('description')"/>
            <div class="checklist-section q-mb-lg">
              <div class="text-subtitle1 text-weight-medium q-mb-sm row items-center">
                <q-icon name="checklist" class="q-mr-sm" />
                Checklist
                <q-chip v-if="task.checklist.length > 0" dense color="primary" text-color="white" class="q-ml-sm">
                  {{ completedChecklistItems }}/{{ task.checklist.length }}
                </q-chip>
              </div>

              <div class="checklist-items q-mb-sm">
                <div v-for="(item, index) in task.checklist" :key="index" class="checklist-item row items-center q-pa-sm q-mb-xs rounded-borders" :class="{ 'bg-green-1': item.completed }">
                  <q-checkbox v-model="item.completed" class="q-mr-sm" :color="item.completed ? 'positive' : 'grey'" @update:model-value="updateChecklistProgress"/>
                  <q-input v-model="item.text" borderless dense placeholder="Élément de la checklist" class="col-grow" :class="{ 'text-strike text-grey': item.completed }" @blur="updateChecklistProgress"/>
                  <q-btn flat round icon="delete" size="sm" color="negative" @click="removeChecklistItem(index)" class="opacity-60 hover-opacity-100"/>
                </div>
              </div>

              <q-linear-progress v-if="task.checklist.length > 0" :value="checklistProgress" color="positive" class="q-mb-sm" style="height: 6px" rounded/>

              <q-btn
                outline
                icon="add"
                label="Ajouter un élément"
                color="primary"
                size="sm"
                @click="addChecklistItem"
                class="full-width"
              />
            </div>

            <q-tabs
              v-model="tab"
              dense
              class="text-grey-7 q-mb-md"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
              active-bg-color="primary-1"
            >
              <q-tab name="comments" icon="chat" label="Commentaires" />
              <q-tab name="attachments" icon="attachment" label="Pièces jointes" />
              <q-tab name="activity" icon="history" label="Historique" />
            </q-tabs>

            <q-separator class="q-mb-lg" />

            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="comments">
                <div v-if="taskComments.length > 0 && !loadingComments" class="comment-list q-gutter-y-md">
                  <div v-for="comment in taskComments" :key="comment.id" class="comment-item">
                    <div class="row items-start">
                      <q-avatar size="md" class="q-mt-xs text-white bg-primary">
                        {{ comment.createdBy.lastName.charAt(0).toUpperCase() }} {{ comment.createdBy.firstName.charAt(0).toUpperCase() }}
                      </q-avatar>
                        <div class="q-ml-sm comment-bubble bg-grey-2 rounded-borders q-pa-sm">
                        <div class="comment-header row items-center">
                          <span class="text-weight-bold">{{ comment.createdBy.lastName }} {{ comment.createdBy.firstName }}</span>
                          <span class="text-caption text-grey q-ml-sm">
                            {{ formatRelativeDate(comment.createdAt) }}
                          </span>
                        </div>
                        <div class="comment-content q-pt-xs q-pb-xs">{{ comment.content }}</div>
                        <div class="comment-actions row q-gutter-xs">
                          <q-btn flat dense label="Supprimer" size="xs" color="negative" v-if="deleteComment(comment)" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="loadingComments" class="flex justify-center q-py-lg">
                  <q-spinner-ios size="40px" color="primary" class="animated pulse infinite"/>
                </div>

                <div v-else class="empty-state column items-center q-py-lg text-grey-6">
                  <q-icon name="forum" size="40px" class="q-mb-sm" />
                  <div>Aucun commentaire pour le moment</div>
                </div>

                <div class="new-comment q-pt-md">
                  <q-input v-model="newComment" outlined placeholder="Ajouter un commentaire..." type="textarea" rows="2" autogrow class="comment-input bg-white">
                    <template v-slot:after>
                      <q-btn round flat icon="send" color="primary" @click="addComment" :disable="!newComment.trim()" class="send-btn" :class="{ 'pulse-animation': newComment.trim() }"/>
                    </template>
                  </q-input>
                </div>
              </q-tab-panel>

              <!-- Onglet Pièces jointes -->
              <q-tab-panel name="attachments">
                <div class="attachment-list">
                  <q-list bordered separator class="rounded-borders" v-if="task.attachments.length > 0">
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

                  <div v-else class="empty-state column items-center q-py-lg text-grey-6">
                    <q-icon name="attachment" size="40px" class="q-mb-sm" />
                    <div>Aucune pièce jointe pour le moment</div>
                  </div>

                  <q-uploader class="q-mt-md" label="Glisser-déposer des fichiers ici" multiple bordered flat style="max-width: 100%" @added="onFilesAdded" color="primary" accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip">
                    <template v-slot:header="scope">
                      <div class="row no-wrap items-center q-pa-sm bg-grey-2">
                        <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" round dense flat>
                          <q-uploader-add-trigger />
                        </q-btn>
                        <div class="col">
                          <div class="q-uploader__title">Ajouter des fichiers</div>
                          <div class="q-uploader__subtitle">
                            {{ scope.uploadSizeLabel }} / {{ scope.uploadFilesLabel }}
                          </div>
                        </div>
                        <q-btn v-if="scope.canUpload" icon="cloud_upload" @click="scope.upload" round dense flat/>
                        <q-btn v-if="scope.isUploading" icon="clear" @click="scope.abort" round dense flat/>
                      </div>
                    </template>
                  </q-uploader>
                </div>
              </q-tab-panel>

              <!-- Onglet Historique -->
              <q-tab-panel name="activity">
                <div class="activity-timeline q-gutter-y-md">
                  <div
                    v-for="(activity, index) in activities"
                    :key="index"
                    class="activity-item"
                  >
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
                        <div v-if="activity.details" class="text-caption text-grey q-mt-xs">
                          {{ activity.details }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="activities.length === 0" class="empty-state column items-center q-py-lg text-grey-6">
                  <q-icon name="history" size="40px" class="q-mb-sm" />
                  <div>Aucune activité récente</div>
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
import { useCommentStore} from 'src/modules/comment/store/commentStore.js'
import { useUserStore } from 'src/modules/Users/Store/UsersStore.js'

export default {
  name: 'TaskEditor',
  setup () {
    const taskStore = useTaskStore()
    const commentStore = useCommentStore()
    const userStore = useUserStore()
    return {
      commentStore,
      taskStore,
      userStore
    }
  },
  data() {
    return {
      // selectedUsers: [],
      taskComments: [],
      loadingComments: true,
      showDialog: false,
      tab: 'comments',
      newComment: '',
      isSaving: false,
      checklistProgress: 0,
      completedChecklistItems: 0,
      task: {
        title: '',
        context: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: date.formatDate(Date.now() + 86400000 * 3, 'DD/MM/YYYY'),
        createdAt: new Date(),
        createdBy: { id: 1, name: 'Utilisateur' },
        checklist: [],
        attachments: [],
        comments: [],
        assignedUsers: []
      },
      filteredUserOptions: [],
      users: [],
      activities: [
        {
          id: 1,
          text: "a modifié le statut",
          details: "De 'À faire' à 'En cours'",
          user: { id: 2, name: "Sophie Martin" },
          date: new Date(Date.now() - 7200000)
        },
        {
          id: 2,
          text: "a ajouté une pièce jointe",
          details: "maquette-figma.fig",
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
        done: 'check_circle'
      },
      statusColors: {
        todo: 'orange',
        current: 'blue',
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
    openTaskDetail(task) {
      console.log(' la tâche est donc',  task)
      this.loadingComments = true
      this.commentStore.getTaskComment(task?.id).then((data) => {
        this.taskComments = data.data
        this.loadingComments = false
      })

      this.userStore.getUsers().then(data => {
        this.users = data.users
      })

      this.task = {
        ...task,
        priority: task.priority || "medium",
        dueDate: task.dueDate || date.formatDate(Date.now() + 86400000 * 3, 'DD/MM/YYYY'),
        attachments: task.attachments || [
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
    },

    futureDatesOnly(dateStr) {
      return date.getDateDiff(dateStr, date.formatDate(Date.now(), 'YYYY/MM/DD')) >= 0
    },

    getUserFullName(user) {
      return `${user.firstName} ${user.lastName}`
    },

    deleteComment (comment) {
      console.log('le commentaire à supprimer est', comment)
    },

    animateInput(field) {
      const el = document.querySelector(`.${field}-input`)
      if (el) {
        el.classList.add('animated', 'pulse')
        setTimeout(() => {
          el.classList.remove('animated', 'pulse')
        }, 500)
      }
    },

    updateChecklistProgress() {
      if (!this.task.checklist) return
      const completed = this.task.checklist.filter(item => item.completed).length
      this.completedChecklistItems = completed
      this.checklistProgress = this.task.checklist.length > 0
        ? completed / this.task.checklist.length
        : 0
    },

    refreshData () {

    },

    addChecklistItem() {
      this.task.checklist.push({ text: '', completed: false })
      this.$nextTick(() => {
        const inputs = document.querySelectorAll('.checklist-item input')
        if (inputs.length > 0) {
          inputs[inputs.length - 1].focus()
        }
      })
    },

    removeChecklistItem(index) {
      this.$q.dialog({
        title: 'Supprimer cet élément ?',
        message: 'Cette action est irréversible.',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.task.checklist.splice(index, 1)
        this.updateChecklistProgress()
      })
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
          if (fileType.includes('zip') || fileType.includes('compressed')) return 'folder_zip'
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
          if (fileType.includes('zip') || fileType.includes('compressed')) return 'orange'
          if (fileType.includes('fig')) return 'pink'
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

    addComment() {
      this.loadingComments = true
      this.commentStore.addCommentOnTAsk({taskId : this.task?.id, content: this.newComment.trim()}).then(() => {
        this.newComment = ''
        this.commentStore.getTaskComment(this.task?.id).then((data) => {
          this.taskComments = data.data
          this.loadingComments = false
          this.$q.notify({message: 'Commentaire ajouté', color: 'positive', icon: 'check', position: 'top-right', timeout: 1000})
        })
      }).catch(() => {
        this.$q.notify({message: 'Erreur survenue lors de l\'ajout du commentaire', color: 'negative', icon: 'check', position: 'top-right', timeout: 1000})
      })
    },

    saveTask() {
      this.isSaving = true
      this.activities.unshift({
        id: Date.now(),
        text: "a modifié la tâche",
        user: { id: this.assignedUser?.id || 0, name: this.assignedUser?.name || 'Anonyme' },
        date: new Date()
      })
      this.taskStore.updateTask(this.task).then(() => {
        this.$q.notify({type: 'positive', message: 'Tâche sauvegardée !', position: 'top', icon: 'check_circle', timeout: 200})
      }).catch((data) => {
        this.$q.notify({type: 'negative', message: data?.message ?? 'Erreur lors de la modification', position: 'top', icon: 'error'})
      }).finally(() => {
        this.isSaving = false
        this.showDialog = false
        this.$emit('refresh-task')
      })
    },

    closeDialog() {
      this.showDialog = false
      this.isSaving = false
      this.task = {
        title: '',
        context: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: date.formatDate(Date.now() + 86400000 * 3, 'DD/MM/YYYY'),
        createdAt: new Date(),
        createdBy: { id: 1, name: 'Utilisateur' },
        checklist: [],
        attachments: [],
        comments: []
      }
    },

    previewFile(file) {
      this.$q.dialog({
        title: file.name,
        message: `Prévisualisation du fichier ${file.name} (${this.formatFileSize(file.size)})`,
        ok: {
          label: 'Télécharger',
          color: 'primary'
        },
        cancel: true
      }).onOk(() => {
        this.downloadFile(file)
      })
    },

    downloadFile(file) {
      // Ici vous implémenteriez le vrai téléchargement
      this.$q.notify({
        message: `Téléchargement de ${file.name} démarré`,
        color: 'info',
        icon: 'download',
        position: 'top-right'
      })
    },

    confirmDeleteFile(file) {
      this.$q.dialog({
        title: 'Supprimer le fichier ?',
        message: `Êtes-vous sûr de vouloir supprimer "${file.name}" ? Cette action est irréversible.`,
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
            icon: 'delete',
            timeout: 1000
          })

          // Ajout d'une activité
          this.activities.unshift({
            id: Date.now(),
            text: "a supprimé une pièce jointe",
            details: file.name,
            user: { id: this.assignedUser?.id || 0, name: this.assignedUser?.name || 'Anonyme' },
            date: new Date()
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
          uploadedBy: {
            id: this.assignedUser?.id || 0,
            name: this.assignedUser?.name || 'Utilisateur'
          }
        })
      })

      this.$q.notify({
        type: 'positive',
        message: `${files.length} fichier(s) ajouté(s)`,
        icon: 'attachment',
        timeout: 1000
      })

      // Ajout d'une activité
      this.activities.unshift({
        id: Date.now(),
        text: `a ajouté ${files.length} pièce(s) jointe(s)`,
        details: files.map(f => f.name).join(', '),
        user: { id: this.assignedUser?.id || 0, name: this.assignedUser?.name || 'Anonyme' },
        date: new Date()
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
  border-radius: 12px;
  overflow: hidden;
}

.editor-header {
  height: 140px;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 10;

  .header-actions {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }

  .header-content {
    text-align: center;
    padding-top: 40px;

    .text-h5 {
      letter-spacing: -0.5px;
    }
  }

  .back-btn, .save-btn {
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.content-area {
  flex-grow: 1;
  overflow: auto;
  margin-top: -30px;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  background: white;
  position: relative;
  z-index: 1;
  padding-bottom: 20px;
}

.main-section {
  margin-top: 20px;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.05);
}

.task-title, .task-context {
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:focus-within {
    transform: translateY(-2px);

    .q-field__control {
      background-color: rgba(25, 118, 210, 0.05);
      border-radius: 8px;
    }
  }

  .q-field__control {
    transition: all 0.3s ease;
  }
}

.description-input {
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
    border-radius: 8px;
  }
}

.checklist-section {
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 12px;
  padding: 16px;
  background-color: #fafafa;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(25, 118, 210, 0.2);
  }

  .checklist-items {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 8px;
  }

  .checklist-item {
    transition: all 0.2s ease;
    border-radius: 8px;
    border: 1px dashed transparent;

    &:hover {
      background-color: #f5f5f5;
      border-color: rgba(0,0,0,0.1);
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
  width: 85%;
  transition: all 0.3s ease;

  &:hover {
    background-color: #eeeeee;
  }

  //.comment-content {
  //  display: block;
  //  max-width: 75%;
  //  white-space: nowrap;
  //  overflow: hidden;
  //  text-overflow: ellipsis;
  //}

  .comment-content {
    display: block;         /* Assure un comportement de bloc */
    max-width: 85%;         /* Limite la largeur à 85% du parent */
    word-wrap: break-word;  /* Permet de couper les mots longs si nécessaire */
    white-space: normal;    /* Permet le retour à la ligne automatique */
  }

  .comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .comment-actions {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover .comment-actions {
    opacity: 1;
  }
}

.comment-input {
  border-radius: 20px;
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
  }
}

.send-btn {
  transition: transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
}

.pulse-animation {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
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
  box-shadow: 0 0 0 2px white;
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

.empty-state {
  text-align: center;
  opacity: 0.7;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.status-select, .user-select {
  .q-chip {
    transition: all 0.2s ease;
    width: 100%;

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

// Animation pour les nouveaux commentaires
.comment-item {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

// Effet de hover sur les boutons
.hover-opacity-100 {
  opacity: 0.6;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}
</style>
