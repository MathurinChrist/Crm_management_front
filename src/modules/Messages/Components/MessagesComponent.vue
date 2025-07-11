<template>
  <q-page class="row no-wrap">
    <!-- Conversations list -->
    <div class="col-4 bg-grey-1" style="border-right: 1px solid #eee; height: calc(100vh - 50px);">
      <div class="q-pa-md">
        <div class="row items-center q-mb-md">
          <q-input
            v-model="searchText"
            outlined
            dense
            placeholder="Search messages..."
            class="col"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn flat round icon="filter_list" class="q-ml-sm" />
        </div>

        <q-list bordered separator>
          <q-item
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            clickable
            v-ripple
            :active="activeConversation?.id === conversation.id"
            active-class="bg-blue-1 text-primary"
            @click="selectConversation(conversation)"
          >
            <q-item-section avatar>
              <q-avatar>
                <img :src="conversation.avatar || `https://i.pravatar.cc/150?u=${conversation.id}`">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ conversation.name }}</q-item-label>
              <q-item-label caption lines="1">
                {{ conversation.lastMessage?.text || 'No messages yet' }}
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-item-label caption>
                {{ formatTimeAgo(conversation.lastMessage?.timestamp) }}
              </q-item-label>
              <q-badge
                v-if="conversation.unreadCount"
                color="primary"
                rounded
                :label="conversation.unreadCount"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- Chat area -->
    <div class="col bg-white column" style="height: calc(100vh - 50px);">
      <!-- Top bar -->
      <div v-if="activeConversation" class="row items-center q-pa-md bg-grey-1" style="border-bottom: 1px solid #eee;">
        <q-btn flat round icon="arrow_back" class="q-mr-sm" @click="activeConversation = null" />
        <q-avatar size="md">
          <img :src="activeConversation.avatar || `https://i.pravatar.cc/150?u=${activeConversation.id}`">
        </q-avatar>
        <div class="q-ml-md">
          <div class="text-weight-medium">{{ activeConversation.name }}</div>
          <div class="text-caption">
            <q-icon name="circle" size="8px" :color="activeConversation.online ? 'positive' : 'grey'" />
            {{ activeConversation.online ? 'Online' : 'Offline' }}
          </div>
        </div>
        <q-space />
        <q-btn flat round icon="more_vert">
          <q-menu>
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup>
                <q-item-section>View profile</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>Mute notifications</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup class="text-negative">
                <q-item-section>Delete conversation</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <!-- Messages -->
      <div v-if="activeConversation" class="col scroll" style="overflow-y: auto;" ref="messagesContainer">
        <div class="column q-pa-lg" style="gap: 16px;">
          <div v-for="(group, index) in messageGroups" :key="index">
            <div class="row justify-center q-my-md">
              <q-badge rounded color="grey-4" text-color="grey-8">
                {{ formatDate(group.date) }}
              </q-badge>
            </div>

            <div v-for="message in group.messages" :key="message.id" class="row" :class="{'justify-end': message.sentByMe}">
              <div
                class="message-bubble"
                :class="{
                  'sent': message.sentByMe,
                  'received': !message.sentByMe,
                  'first-in-group': message.firstInGroup,
                  'last-in-group': message.lastInGroup
                }"
              >
                <div v-if="!message.sentByMe && message.firstInGroup" class="message-sender">
                  {{ message.senderName }}
                </div>
                <div class="message-content">
                  {{ message.text }}
                  <div class="message-time">
                    {{ formatTime(message.timestamp) }}
                    <q-icon
                      v-if="message.sentByMe"
                      :name="message.read ? 'done_all' : 'done'"
                      :color="message.read ? 'primary' : 'grey'"
                      size="14px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="column items-center justify-center full-height text-grey-6">
        <q-icon name="forum" size="64px" class="q-mb-sm" />
        <div class="text-h6">Select a conversation</div>
        <div class="text-subtitle2">or start a new one</div>
      </div>

      <!-- Message input -->
      <div v-if="activeConversation" class="q-pa-md bg-grey-1" style="border-top: 1px solid #eee;">
        <div class="row items-center q-col-gutter-sm">
          <q-btn flat round icon="attach_file" />
          <q-input
            v-model="newMessage"
            outlined
            rounded
            dense
            placeholder="Type a message..."
            class="col-grow"
            @keyup.enter="sendMessage"
          />
          <q-btn
            round
            color="primary"
            icon="send"
            :disable="!newMessage.trim()"
            @click="sendMessage"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import { date } from 'quasar'

export default {
  setup() {
    // Sample data - in a real app, this would come from an API
    const conversations = ref([
      {
        id: 1,
        name: 'Development Team',
        avatar: 'https://i.pravatar.cc/150?img=3',
        online: true,
        unreadCount: 2,
        lastMessage: {
          text: 'Has anyone reviewed the latest PR?',
          timestamp: '2025-05-14T10:30:00Z',
          sender: 'John Doe'
        },
        participants: [
          { id: 1, name: 'John Doe', role: 'Developer' },
          { id: 2, name: 'Jane Smith', role: 'Designer' },
          { id: 3, name: 'Mathurin Kimbembe', role: 'Project Manager' }
        ],
        messages: [
          {
            id: 1,
            text: 'Hey team, how is the sprint going?',
            senderId: 3,
            senderName: 'Mathurin Kimbembe',
            timestamp: '2025-05-13T09:15:00Z',
            read: true,
            sentByMe: false
          },
          {
            id: 2,
            text: 'Going well! Almost finished with the new feature',
            senderId: 1,
            senderName: 'John Doe',
            timestamp: '2025-05-13T09:20:00Z',
            read: true,
            sentByMe: false
          },
          {
            id: 3,
            text: 'I have some design assets ready for review',
            senderId: 2,
            senderName: 'Jane Smith',
            timestamp: '2025-05-13T10:45:00Z',
            read: true,
            sentByMe: false
          },
          {
            id: 4,
            text: 'Great, I will review them this afternoon',
            senderId: 3,
            senderName: 'Mathurin Kimbembe',
            timestamp: '2025-05-13T11:00:00Z',
            read: true,
            sentByMe: true
          },
          {
            id: 5,
            text: 'Has anyone reviewed the latest PR?',
            senderId: 1,
            senderName: 'John Doe',
            timestamp: '2025-05-14T10:30:00Z',
            read: false,
            sentByMe: false
          }
        ]
      },
      {
        id: 2,
        name: 'Marketing Team',
        avatar: 'https://i.pravatar.cc/150?img=5',
        online: false,
        unreadCount: 0,
        lastMessage: {
          text: 'The campaign launch is scheduled for next Monday',
          timestamp: '2025-05-12T16:45:00Z',
          sender: 'Sarah Johnson'
        },
        participants: [
          { id: 4, name: 'Sarah Johnson', role: 'Marketing Lead' },
          { id: 3, name: 'Mathurin Kimbembe', role: 'Project Manager' }
        ],
        messages: [
          {
            id: 1,
            text: 'When are we launching the new campaign?',
            senderId: 3,
            senderName: 'Mathurin Kimbembe',
            timestamp: '2025-05-12T10:00:00Z',
            read: true,
            sentByMe: true
          },
          {
            id: 2,
            text: 'The campaign launch is scheduled for next Monday',
            senderId: 4,
            senderName: 'Sarah Johnson',
            timestamp: '2025-05-12T16:45:00Z',
            read: true,
            sentByMe: false
          }
        ]
      },
      {
        id: 3,
        name: 'Client: Acme Corp',
        avatar: 'https://i.pravatar.cc/150?img=8',
        online: true,
        unreadCount: 1,
        lastMessage: {
          text: 'We need some changes to the requirements',
          timestamp: '2025-05-14T08:15:00Z',
          sender: 'Michael Brown'
        },
        participants: [
          { id: 5, name: 'Michael Brown', role: 'Client' },
          { id: 3, name: 'Mathurin Kimbembe', role: 'Project Manager' }
        ],
        messages: [
          {
            id: 1,
            text: 'Hi Michael, here is the project update',
            senderId: 3,
            senderName: 'Mathurin Kimbembe',
            timestamp: '2025-05-10T14:30:00Z',
            read: true,
            sentByMe: true
          },
          {
            id: 2,
            text: 'Thanks for the update, looks good so far',
            senderId: 5,
            senderName: 'Michael Brown',
            timestamp: '2025-05-11T11:20:00Z',
            read: true,
            sentByMe: false
          },
          {
            id: 3,
            text: 'We need some changes to the requirements',
            senderId: 5,
            senderName: 'Michael Brown',
            timestamp: '2025-05-14T08:15:00Z',
            read: false,
            sentByMe: false
          }
        ]
      }
    ])

    const teamMembers = ref([
      { id: 1, name: 'John Doe', role: 'Developer', online: true },
      { id: 2, name: 'Jane Smith', role: 'Designer', online: false },
      { id: 4, name: 'Sarah Johnson', role: 'Marketing Lead', online: true },
      { id: 6, name: 'Robert Wilson', role: 'QA Engineer', online: false },
      { id: 7, name: 'Emily Davis', role: 'Product Owner', online: true }
    ])

    const activeConversation = ref(null)
    const searchText = ref('')
    const newMessage = ref('')
    const messagesContainer = ref(null)
    const showNewConversationDialog = ref(false)
    const newConversationSearch = ref('')

    // Computed properties
    const filteredConversations = computed(() => {
      if (!searchText.value) return conversations.value
      return conversations.value.filter(conv =>
        conv.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
        conv.lastMessage?.text.toLowerCase().includes(searchText.value.toLowerCase())
      )
    })

    const filteredTeamMembers = computed(() => {
      if (!newConversationSearch.value) return teamMembers.value
      return teamMembers.value.filter(user =>
        user.name.toLowerCase().includes(newConversationSearch.value.toLowerCase()) ||
        user.role.toLowerCase().includes(newConversationSearch.value.toLowerCase()))
    })

    const messageGroups = computed(() => {
      if (!activeConversation.value) return []

      // Group messages by date
      const groups = []
      let currentDate = null
      let currentGroup = null

      // First, mark first/last in group for styling
      const messagesWithGroupInfo = activeConversation.value.messages.map((msg, index, arr) => {
        const prev = arr[index - 1]
        const next = arr[index + 1]

        return {
          ...msg,
          firstInGroup: !prev || prev.senderId !== msg.senderId,
          lastInGroup: !next || next.senderId !== msg.senderId
        }
      })

      messagesWithGroupInfo.forEach(msg => {
        const messageDate = date.formatDate(msg.timestamp, 'YYYY-MM-DD')

        if (messageDate !== currentDate) {
          currentDate = messageDate
          currentGroup = {
            date: messageDate,
            messages: []
          }
          groups.push(currentGroup)
        }

        currentGroup.messages.push(msg)
      })

      return groups
    })

    // Methods
    const formatTimeAgo = (timestamp) => {
      if (!timestamp) return ''

      const now = new Date()
      const ts = new Date(timestamp)

      const today = date.formatDate(now, 'YYYY-MM-DD')
      const dateStr = date.formatDate(ts, 'YYYY-MM-DD')

      if (today === dateStr) {
        return date.formatDate(ts, 'HH:mm') // same day → show time
      }

      const yesterday = new Date()
      yesterday.setDate(now.getDate() - 1)
      const ystr = date.formatDate(yesterday, 'YYYY-MM-DD')

      if (dateStr === ystr) {
        return 'Yesterday'
      }

      return date.formatDate(ts, 'MMM D, YYYY')
    }


    const formatDate = (dateStr) => {
      return date.formatDate(dateStr, 'MMMM D, YYYY')
    }

    const formatTime = (timestamp) => {
      return date.formatDate(timestamp, 'h:mm A')
    }

    const selectConversation = (conversation) => {
      activeConversation.value = conversation
      // Mark messages as read
      conversation.unreadCount = 0
      conversation.messages.forEach(msg => msg.read = true)
      scrollToBottom()
    }

    const sendMessage = () => {
      if (!newMessage.value.trim() || !activeConversation.value) return

      const newMsg = {
        id: Date.now(),
        text: newMessage.value,
        senderId: 3, // Current user ID
        senderName: 'Mathurin Kimbembe',
        timestamp: new Date().toISOString(),
        read: false,
        sentByMe: true,
        firstInGroup: true,
        lastInGroup: true
      }

      activeConversation.value.messages.push(newMsg)
      activeConversation.value.lastMessage = {
        text: newMessage.value,
        timestamp: newMsg.timestamp,
        sender: 'You'
      }

      newMessage.value = ''
      scrollToBottom()

      // In a real app, you would send the message to the server here
    }

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    const createNewConversation = (user) => {
      const newConv = {
        id: Date.now(),
        name: user.name,
        avatar: user.avatar,
        online: user.online,
        unreadCount: 0,
        lastMessage: null,
        participants: [
          user,
          { id: 3, name: 'Mathurin Kimbembe', role: 'Project Manager' }
        ],
        messages: []
      }

      conversations.value.unshift(newConv)
      activeConversation.value = newConv
      showNewConversationDialog.value = false
      newConversationSearch.value = ''
    }

    // Watch for active conversation changes to scroll to bottom
    watch(activeConversation, () => {
      scrollToBottom()
    }, { immediate: true })

    return {
      conversations,
      activeConversation,
      searchText,
      newMessage,
      messagesContainer,
      showNewConversationDialog,
      newConversationSearch,
      teamMembers,
      filteredConversations,
      filteredTeamMembers,
      messageGroups,
      formatTimeAgo,
      formatDate,
      formatTime,
      selectConversation,
      sendMessage,
      createNewConversation
    }
  }
}
</script>

<style scoped>
.message-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 18px;
  margin-bottom: 2px;
  position: relative;
}

.message-bubble.sent {
  background-color: #e3f2fd;
  color: #000;
  border-bottom-right-radius: 4px;
}

.message-bubble.received {
  background-color: #f1f1f1;
  color: #000;
  border-bottom-left-radius: 4px;
}

.message-bubble.sent.first-in-group {
  border-top-right-radius: 18px;
}

.message-bubble.sent.last-in-group {
  border-bottom-right-radius: 18px;
}

.message-bubble.received.first-in-group {
  border-top-left-radius: 18px;
}

.message-bubble.received.last-in-group {
  border-bottom-left-radius: 18px;
}

.message-content {
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  color: #666;
  text-align: right;
  margin-top: 4px;
}

.message-sender {
  font-weight: 500;
  font-size: 0.8rem;
  margin-bottom: 4px;
  color: #333;
}
</style>
