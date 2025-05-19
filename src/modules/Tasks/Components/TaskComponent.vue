<template>
  <q-page class="q-pa-md">
    <!-- Header with title and actions -->
    <div class="row items-center q-mb-md">
      <h1 class="text-h4 q-ma-none">Tasks</h1>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        label="New Task"
        @click="openTaskForm"
      />
      <q-btn
        flat
        round
        icon="filter_list"
        class="q-ml-sm"
      >
        <q-tooltip>Filter tasks</q-tooltip>
      </q-btn>
    </div>

    <!-- Status tabs -->
    <q-tabs
      v-model="activeTab"
      align="left"
      active-color="primary"
      indicator-color="primary"
      class="text-grey"
    >
      <q-tab
        name="all"
        label="All Tasks"
        icon="list"
      />
      <q-tab
        name="todo"
        label="To Do"
        icon="radio_button_unchecked"
      />
      <q-tab
        name="in_progress"
        label="In Progress"
        icon="pending_actions"
      />
      <q-tab
        name="done"
        label="Done"
        icon="check_circle"
      />
    </q-tabs>

    <q-separator />

    <!-- Task list -->
    <q-list
      bordered
      separator
      class="rounded-borders"
    >
      <q-item
        v-for="task in filteredTasks"
        :key="task.id"
        class="q-my-sm"
        clickable
        v-ripple
        @click="openTaskDetail(task)"
      >
        <q-item-section avatar>
          <q-icon
            :name="statusIcon(task.status)"
            :color="statusColor(task.status)"
            size="md"
          />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-medium">{{ task.title }}</q-item-label>
          <q-item-label caption>
            <span v-if="task.context" class="q-mr-sm">
              <q-icon name="label" size="xs" /> {{ task.context }}
            </span>
            <span>
              <q-icon name="folder" size="xs" /> {{ task.project.createdBy.firstName }}'s Project
            </span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center">
            <q-avatar
              size="sm"
              color="grey-3"
              text-color="primary"
              class="q-mr-sm"
            >
              {{ task.createdBy.firstName.charAt(0) }}{{ task.createdBy.lastName.charAt(0) }}
            </q-avatar>
            <q-icon
              name="chevron_right"
              color="grey"
            />
          </div>
        </q-item-section>
      </q-item>

      <q-item
        v-if="filteredTasks.length === 0"
        class="text-grey-6"
      >
        <q-item-section class="text-center">
          No tasks found
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Task detail dialog -->
    <q-dialog v-model="showTaskDetail">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ selectedTask.title }}</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-8">
              <div class="text-subtitle2 q-mb-xs">Description</div>
              <q-input
                v-model="selectedTask.description"
                type="textarea"
                outlined
                autogrow
                readonly
                class="q-mb-md"
              />

              <div class="text-subtitle2 q-mb-xs">Comments</div>
              <div class="bg-grey-2 q-pa-sm rounded-borders">
                <q-input
                  v-model="newComment"
                  type="textarea"
                  outlined
                  autogrow
                  placeholder="Add a comment..."
                  class="q-mb-sm"
                />
                <q-btn
                  color="primary"
                  label="Add Comment"
                  unelevated
                  @click="addComment"
                />
              </div>
            </div>

            <div class="col-4">
              <div class="text-subtitle2 q-mb-xs">Details</div>
              <q-list bordered separator class="rounded-borders">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Status</q-item-label>
                    <q-item-label>
                      <q-chip
                        :color="statusColor(selectedTask.status)"
                        text-color="white"
                        dense
                      >
                        {{ formatStatus(selectedTask.status) }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Context</q-item-label>
                    <q-item-label>{{ selectedTask.context || 'None' }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Project</q-item-label>
                    <q-item-label>{{ selectedTask.project.createdBy.firstName }}'s Project</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Created</q-item-label>
                    <q-item-label>{{ formatDate(selectedTask.createdAt) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Created By</q-item-label>
                    <q-item-label class="row items-center">
                      <q-avatar
                        size="sm"
                        color="grey-3"
                        text-color="primary"
                        class="q-mr-sm"
                      >
                        {{ selectedTask.createdBy.firstName.charAt(0) }}{{ selectedTask.createdBy.lastName.charAt(0) }}
                      </q-avatar>
                      {{ selectedTask.createdBy.firstName }} {{ selectedTask.createdBy.lastName }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Edit"
            color="primary"
            @click="editTask(selectedTask)"
          />
          <q-btn
            flat
            label="Close"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Task form dialog -->
    <q-dialog v-model="showTaskForm">
      <task-form
        :task="editingTask"
        @close="showTaskForm = false"
        @saved="handleTaskSaved"
      />
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed } from 'vue'
import { date } from 'quasar'

export default {
  components: {

  },
  setup() {
    const activeTab = ref('all')
    const showTaskDetail = ref(false)
    const showTaskForm = ref(false)
    const selectedTask = ref({})
    const editingTask = ref(null)
    const newComment = ref('')

    // Sample tasks data - in a real app, this would come from an API
    const tasks = ref([
      {
        id: 1,
        title: "Complete project proposal",
        context: "Work",
        description: "Finish the proposal document and send to client for review",
        status: "in_progress",
        project: {
          id: 2,
          createdAt: "2025-04-28T20:05:49+00:00",
          updatedAt: "2025-04-28T20:05:49+00:00",
          createdBy: {
            lastName: "Kimbembe",
            firstName: "Mathurin Christ Bobann",
            gender: "M",
            email: "testA1@test.com",
            roles: ["ROLE_USER"]
          },
          updatedBy: {
            lastName: "Kimbembe",
            firstName: "Mathurin Christ Bobann",
            gender: "M",
            email: "testA1@test.com",
            roles: ["ROLE_USER"]
          }
        },
        createdAt: "2025-05-13T20:59:32+00:00",
        updatedAt: "2025-05-13T20:59:32+00:00",
        createdBy: {
          lastName: "Kimbembe",
          firstName: "Mathurin Christ Bobann",
          gender: "M",
          email: "testA1@test.com",
          roles: ["ROLE_USER"]
        },
        updatedBy: {
          lastName: "Kimbembe",
          firstName: "Mathurin Christ Bobann",
          gender: "M",
          email: "testA1@test.com",
          roles: ["ROLE_USER"]
        }
      },
      {
        id: 2,
        title: "Review code changes",
        context: "Development",
        description: "Go through the latest pull requests and provide feedback",
        status: "todo",
        project: {
          id: 3,
          createdAt: "2025-04-29T10:15:22+00:00",
          updatedAt: "2025-04-29T10:15:22+00:00",
          createdBy: {
            lastName: "Doe",
            firstName: "John",
            gender: "M",
            email: "john@example.com",
            roles: ["ROLE_USER"]
          },
          updatedBy: {
            lastName: "Doe",
            firstName: "John",
            gender: "M",
            email: "john@example.com",
            roles: ["ROLE_USER"]
          }
        },
        createdAt: "2025-05-12T14:30:15+00:00",
        updatedAt: "2025-05-12T14:30:15+00:00",
        createdBy: {
          lastName: "Smith",
          firstName: "Jane",
          gender: "F",
          email: "jane@example.com",
          roles: ["ROLE_USER"]
        },
        updatedBy: {
          lastName: "Smith",
          firstName: "Jane",
          gender: "F",
          email: "jane@example.com",
          roles: ["ROLE_USER"]
        }
      }
    ])

    const filteredTasks = computed(() => {
      if (activeTab.value === 'all') return tasks.value
      return tasks.value.filter(task => task.status === activeTab.value)
    })

    const statusIcon = (status) => {
      const icons = {
        todo: 'radio_button_unchecked',
        in_progress: 'pending_actions',
        done: 'check_circle'
      }
      return icons[status] || 'help_outline'
    }

    const statusColor = (status) => {
      const colors = {
        todo: 'orange',
        in_progress: 'blue',
        done: 'green'
      }
      return colors[status] || 'grey'
    }

    const formatStatus = (status) => {
      const statusMap = {
        todo: 'To Do',
        in_progress: 'In Progress',
        done: 'Done'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'MMM D, YYYY h:mm A')
    }

    const openTaskDetail = (task) => {
      selectedTask.value = { ...task }
      showTaskDetail.value = true
    }

    const openTaskForm = () => {
      editingTask.value = null
      showTaskForm.value = true
    }

    const editTask = (task) => {
      editingTask.value = { ...task }
      showTaskDetail.value = false
      showTaskForm.value = true
    }

    const addComment = () => {
      if (!newComment.value.trim()) return
      // In a real app, you would add the comment to the task via API
      console.log('Adding comment:', newComment.value)
      newComment.value = ''
    }

    const handleTaskSaved = (savedTask) => {
      showTaskForm.value = false
      // In a real app, you would update the tasks list from the API response
      const index = tasks.value.findIndex(t => t.id === savedTask.id)
      if (index >= 0) {
        tasks.value[index] = savedTask
      } else {
        tasks.value.unshift(savedTask)
      }
    }

    return {
      activeTab,
      tasks,
      filteredTasks,
      showTaskDetail,
      showTaskForm,
      selectedTask,
      editingTask,
      newComment,
      statusIcon,
      statusColor,
      formatStatus,
      formatDate,
      openTaskDetail,
      openTaskForm,
      editTask,
      addComment,
      handleTaskSaved
    }
  }
}
</script>

<style scoped>
.q-item {
  transition: all 0.3s ease;
}

.q-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.rounded-borders {
  border-radius: 8px;
}
</style>
