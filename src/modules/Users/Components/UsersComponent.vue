<template>
  <q-page class="q-pa-md">
    <!-- Header with title and actions -->
    <div class="row items-center q-mb-md">
      <h1 class="text-h4 q-ma-none">User Management</h1>
      <q-space />
      <q-btn
        color="primary"
        icon="person_add"
        label="Add User"
        @click="openUserForm(null)"
      />
      <q-btn
        flat
        round
        icon="filter_list"
        class="q-ml-sm"
      >
        <q-tooltip>Filter users</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        icon="refresh"
        class="q-ml-sm"
        @click="refreshUsers"
      >
        <q-tooltip>Refresh</q-tooltip>
      </q-btn>
    </div>

    <!-- Search and filter bar -->
    <div class="row q-gutter-md q-mb-md">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Search users..."
        class="col"
        clearable
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        v-model="roleFilter"
        outlined
        dense
        options-dense
        multiple
        :display-value="roleFilter.length ? `${roleFilter.length} roles selected` : 'Filter by role'"
        options-selected-class="text-primary"
        class="col-3"
        clearable
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-checkbox :model-value="scope.selected" />
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:selected-item="scope">
          <q-chip
            v-if="scope.index < 2"
            dense
            removable
            @remove="scope.removeAtIndex(scope.index)"
            class="q-ma-none"
          >
            {{ scope.opt }}
          </q-chip>
          <q-chip
            v-else-if="scope.index === 2"
            dense
            class="q-ma-none"
          >
            +{{ roleFilter.length - 2 }} more
          </q-chip>
        </template>
      </q-select>

      <q-select
        v-model="statusFilter"
        outlined
        dense
        :options="statusOptions"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        label="Status"
        class="col-2"
        clearable
      />
    </div>

    <!-- Users table -->
    <q-table
      :rows="filteredUsers"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :loading="loading"
      :filter="searchQuery"
      class="sticky-header-table"
      flat
      bordered
    >
      <template v-slot:body-cell-avatar="props">
        <q-td :props="props">
          <q-avatar size="sm">
            <img :src="props.row.avatar || defaultAvatar(props.row)">
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.firstName }} {{ props.row.lastName }}</div>
          <div class="text-caption text-grey-7">{{ props.row.email }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.active ? 'positive' : 'grey'"
            :label="props.row.active ? 'Active' : 'Inactive'"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-roles="props">
        <q-td :props="props">
          <div class="q-gutter-xs">
            <q-chip
              v-for="(role, index) in props.row.roles"
              :key="index"
              dense
              :color="roleColors[role] || 'primary'"
              text-color="white"
            >
              {{ formatRole(role) }}
            </q-chip>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row no-wrap q-gutter-xs">
            <q-btn
              dense
              round
              flat
              color="grey"
              icon="edit"
              @click="openUserForm(props.row)"
            >
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
            <q-btn
              dense
              round
              flat
              :color="props.row.active ? 'negative' : 'positive'"
              :icon="props.row.active ? 'person_remove' : 'person_add'"
              @click="toggleUserStatus(props.row)"
            >
              <q-tooltip>{{ props.row.active ? 'Deactivate' : 'Activate' }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              round
              flat
              color="grey"
              icon="more_vert"
            >
              <q-menu auto-close>
                <q-list style="min-width: 150px">
                  <q-item clickable @click="impersonateUser(props.row)">
                    <q-item-section avatar>
                      <q-icon name="manage_accounts" />
                    </q-item-section>
                    <q-item-section>Impersonate</q-item-section>
                  </q-item>
                  <q-item clickable @click="sendResetPassword(props.row)">
                    <q-item-section avatar>
                      <q-icon name="vpn_key" />
                    </q-item-section>
                    <q-item-section>Reset Password</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable class="text-negative" @click="confirmDeleteUser(props.row)">
                    <q-item-section avatar>
                      <q-icon name="delete" />
                    </q-item-section>
                    <q-item-section>Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- User form dialog -->
    <q-dialog v-model="showUserForm" persistent>
      <q-card style="min-width: 600px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ formUser.id ? 'Edit User' : 'Create User' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveUser" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 text-center">
                <q-avatar size="100px" class="cursor-pointer" @click="triggerFileInput">
                  <img :src="formUser.avatar || defaultAvatar(formUser)" v-if="!avatarPreview">
                  <img :src="avatarPreview" v-else>
                  <q-badge floating color="primary" icon="edit" />
                </q-avatar>
                <q-file
                  v-model="avatarFile"
                  ref="avatarInput"
                  accept="image/*"
                  class="hidden"
                  @update:model-value="handleAvatarUpload"
                />
              </div>

              <div class="col-md-6 col-12">
                <q-input
                  v-model="formUser.firstName"
                  label="First Name"
                  outlined
                  dense
                  lazy-rules
                  :rules="[val => !!val || 'First name is required']"
                />
              </div>

              <div class="col-md-6 col-12">
                <q-input
                  v-model="formUser.lastName"
                  label="Last Name"
                  outlined
                  dense
                  lazy-rules
                  :rules="[val => !!val || 'Last name is required']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="formUser.email"
                  label="Email"
                  type="email"
                  outlined
                  dense
                  lazy-rules
                  :rules="[
                    val => !!val || 'Email is required',
                    val => /.+@.+\..+/.test(val) || 'Email must be valid'
                  ]"
                />
              </div>

              <div class="col-md-6 col-12">
                <q-input
                  v-model="formUser.phone"
                  label="Phone"
                  outlined
                  dense
                  mask="(###) ### - ####"
                  unmasked-value
                />
              </div>

              <div class="col-md-6 col-12">
                <q-select
                  v-model="formUser.department"
                  :options="departments"
                  label="Department"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <div class="col-12">
                <q-toggle
                  v-model="formUser.active"
                  label="Active User"
                />
              </div>

              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Roles & Permissions</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-md-4 col-12" v-for="role in availableRoles" :key="role.value">
                    <q-card flat bordered>
                      <q-card-section>
                        <div class="row items-center">
                          <q-checkbox
                            v-model="formUser.roles"
                            :val="role.value"
                            :label="role.label"
                            dense
                          />
                          <q-space />
                          <q-icon
                            :name="role.icon"
                            :color="roleColors[role.value] || 'primary'"
                            size="sm"
                          />
                        </div>
                      </q-card-section>
                      <q-card-section class="q-pt-none text-caption text-grey-7">
                        {{ role.description }}
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <div class="col-12" v-if="!formUser.id">
                <q-toggle
                  v-model="sendWelcomeEmail"
                  label="Send welcome email with setup instructions"
                />
              </div>
            </div>

            <q-card-actions align="right" class="q-pt-md">
              <q-btn flat label="Cancel" color="grey" v-close-popup />
              <q-btn type="submit" label="Save" color="primary" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete confirmation dialog -->
    <q-dialog v-model="showDeleteConfirm">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Delete</div>
        </q-card-section>

        <q-card-section>
          Are you sure you want to delete user <strong>{{ userToDelete.firstName }} {{ userToDelete.lastName }}</strong>?
          This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteUser" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

export default {
  setup() {
    const $q = useQuasar()

    // Data
    const users = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const roleFilter = ref([])
    const statusFilter = ref(null)
    const showUserForm = ref(false)
    const formUser = ref(createEmptyUser())
    const avatarFile = ref(null)
    const avatarPreview = ref(null)
    const showDeleteConfirm = ref(false)
    const userToDelete = ref({})
    const sendWelcomeEmail = ref(true)

    // Sample data - in a real app, this would come from an API
    const departments = ref([
      { value: 'warehouse', label: 'Warehouse' },
      { value: 'logistics', label: 'Logistics' },
      { value: 'purchasing', label: 'Purchasing' },
      { value: 'sales', label: 'Sales' },
      { value: 'management', label: 'Management' },
      { value: 'it', label: 'IT' }
    ])

    const availableRoles = ref([
      {
        value: 'ROLE_ADMIN',
        label: 'Administrator',
        description: 'Full access to all features and settings',
        icon: 'admin_panel_settings'
      },
      {
        value: 'ROLE_MANAGER',
        label: 'Manager',
        description: 'Can manage inventory, orders, and reports',
        icon: 'manage_accounts'
      },
      {
        value: 'ROLE_INVENTORY',
        label: 'Inventory',
        description: 'Can manage stock levels and inventory',
        icon: 'inventory'
      },
      {
        value: 'ROLE_PURCHASING',
        label: 'Purchasing',
        description: 'Can create purchase orders and manage suppliers',
        icon: 'shopping_cart'
      },
      {
        value: 'ROLE_SALES',
        label: 'Sales',
        description: 'Can manage customers and sales orders',
        icon: 'point_of_sale'
      },
      {
        value: 'ROLE_REPORTS',
        label: 'Reports',
        description: 'Can view and generate reports',
        icon: 'analytics'
      }
    ])

    const statusOptions = ref([
      { label: 'Active', value: true },
      { label: 'Inactive', value: false }
    ])

    const roleColors = ref({
      'ROLE_ADMIN': 'red',
      'ROLE_MANAGER': 'blue',
      'ROLE_INVENTORY': 'green',
      'ROLE_PURCHASING': 'orange',
      'ROLE_SALES': 'purple',
      'ROLE_REPORTS': 'teal'
    })

    const columns = ref([
      { name: 'avatar', label: '', field: 'avatar', align: 'center', sortable: false },
      { name: 'name', label: 'Name', field: 'firstName', align: 'left', sortable: true },
      { name: 'department', label: 'Department', field: 'department', align: 'left', sortable: true, format: val => departments.value.find(d => d.value === val)?.label || val },
      { name: 'status', label: 'Status', field: 'active', align: 'center', sortable: true },
      { name: 'roles', label: 'Roles', field: 'roles', align: 'left', sortable: false },
      { name: 'lastLogin', label: 'Last Login', field: 'lastLogin', align: 'left', sortable: true, format: val => val ? formatDate(val) : 'Never' },
      { name: 'actions', label: 'Actions', field: '', align: 'center', sortable: false }
    ])

    const pagination = ref({
      sortBy: 'name',
      descending: false,
      page: 1,
      rowsPerPage: 10
    })

    // Computed
    const filteredUsers = computed(() => {
      let result = users.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(user =>
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query)
        )
      }

      if (roleFilter.value.length > 0) {
        result = result.filter(user =>
          roleFilter.value.some(role => user.roles.includes(role)))
      }

      if (statusFilter.value !== null) {
        result = result.filter(user => user.active === statusFilter.value)
      }

      return result
    })

    // Methods
    function createEmptyUser() {
      return {
        id: null,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        active: true,
        roles: ['ROLE_USER'],
        avatar: null
      }
    }

    function formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString()
    }

    function formatRole(role) {
      const found = availableRoles.value.find(r => r.value === role)
      return found ? found.label : role.replace('ROLE_', '').replace('_', ' ')
    }

    function defaultAvatar(user) {
      const initials = (user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '')
      return `https://ui-avatars.com/api/?name=${initials}&background=random`
    }

    function triggerFileInput() {
      avatarFile.value = null
      avatarPreview.value = null
      document.querySelector('.hidden input[type="file"]').click()
    }

    function handleAvatarUpload(file) {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          avatarPreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    function openUserForm(user) {
      if (user) {
        formUser.value = JSON.parse(JSON.stringify(user))
      } else {
        formUser.value = createEmptyUser()
      }
      showUserForm.value = true
    }

    function saveUser() {
      // In a real app, this would call an API
      if (formUser.value.id) {
        // Update existing user
        const index = users.value.findIndex(u => u.id === formUser.value.id)
        if (index >= 0) {
          users.value[index] = formUser.value
          $q.notify({
            color: 'positive',
            message: 'User updated successfully'
          })
        }
      } else {
        // Create new user
        formUser.value.id = Date.now()
        users.value.unshift(formUser.value)
        $q.notify({
          color: 'positive',
          message: 'User created successfully'
        })
      }
      showUserForm.value = false
    }

    function toggleUserStatus(user) {
      user.active = !user.active
      // In a real app, this would call an API
      $q.notify({
        color: 'positive',
        message: `User ${user.active ? 'activated' : 'deactivated'}`
      })
    }

    function confirmDeleteUser(user) {
      userToDelete.value = user
      showDeleteConfirm.value = true
    }

    function deleteUser() {
      // In a real app, this would call an API
      users.value = users.value.filter(u => u.id !== userToDelete.value.id)
      $q.notify({
        color: 'positive',
        message: 'User deleted successfully'
      })
    }

    function impersonateUser(user) {
      $q.notify({
        color: 'info',
        message: `Impersonating ${user.firstName} ${user.lastName}`
      })
      // In a real app, this would redirect with impersonation token
    }

    function sendResetPassword(user) {
      $q.notify({
        color: 'info',
        message: `Password reset email sent to ${user.email}`
      })
      // In a real app, this would call an API
    }

    function refreshUsers() {
      loading.value = true
      // In a real app, this would fetch from API
      setTimeout(() => {
        loading.value = false
        $q.notify({
          color: 'positive',
          message: 'User list refreshed'
        })
      }, 1000)
    }

    // Initialize with sample data
    onMounted(() => {
      users.value = [
        {
          id: 1,
          firstName: 'Mathurin',
          lastName: 'Kimbembe',
          email: 'mathurin@example.com',
          phone: '1234567890',
          department: 'management',
          active: true,
          roles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
          lastLogin: '2025-05-14T09:30:00Z',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        {
          id: 2,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '2345678901',
          department: 'warehouse',
          active: true,
          roles: ['ROLE_INVENTORY'],
          lastLogin: '2025-05-13T14:15:00Z'
        },
        {
          id: 3,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '3456789012',
          department: 'sales',
          active: true,
          roles: ['ROLE_SALES', 'ROLE_REPORTS'],
          lastLogin: '2025-05-14T10:45:00Z'
        },
        {
          id: 4,
          firstName: 'Robert',
          lastName: 'Johnson',
          email: 'robert@example.com',
          phone: '4567890123',
          department: 'purchasing',
          active: false,
          roles: ['ROLE_PURCHASING'],
          lastLogin: '2025-04-30T16:20:00Z'
        }
      ]
    })

    return {
      users,
      loading,
      searchQuery,
      roleFilter,
      statusFilter,
      showUserForm,
      formUser,
      avatarFile,
      avatarPreview,
      showDeleteConfirm,
      userToDelete,
      sendWelcomeEmail,
      departments,
      availableRoles,
      statusOptions,
      roleColors,
      columns,
      pagination,
      filteredUsers,
      createEmptyUser,
      formatDate,
      formatRole,
      defaultAvatar,
      triggerFileInput,
      handleAvatarUpload,
      openUserForm,
      saveUser,
      toggleUserStatus,
      confirmDeleteUser,
      deleteUser,
      impersonateUser,
      sendResetPassword,
      refreshUsers
    }
  }
}
</script>

<style scoped>
.sticky-header-table {
  height: calc(100vh - 200px);
}

.hidden {
  display: none;
}

.q-avatar {
  transition: transform 0.3s ease;
}

.q-avatar:hover {
  transform: scale(1.1);
}
</style>
