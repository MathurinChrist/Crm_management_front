<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-ma-none">User Management</h1>
      <q-btn color="primary" icon="add" label="Create User" @click="createUsers()"/>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <q-input v-model="searchQuery" dense outlined placeholder="Search users..." class="col-grow" clearable>
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-select v-model="roleFilter" outlined dense options-dense multiple :options="roleOptions" label="Filter by role" style="min-width: 200px" clearable/>
          <q-select v-model="genderFilter" outlined dense options-dense :options="genderOptions" label="Filter by gender" clearable/>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered v-if="filteredUsers.length > 0 && !loading">
      <q-table :rows="filteredUsers" :columns="columns" row-key="id" :loading="loading" :pagination="pagination" binary-state-sort>
        <template v-slot:header-cell-actions="props">
          <q-th :props="props">
            <div class="text-right">Actions</div>
          </q-th>
        </template>

        <template v-slot:body-cell-gender="props">
          <q-td :props="props">
            <q-badge :color="genderColor(props.row.gender)" class="q-px-sm q-py-xs">
              {{ props.row.gender }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-roles="props">
          <q-td :props="props">
            <div class="q-gutter-xs">
              <q-badge v-for="role in props.row.roles" :key="role" color="secondary" class="q-px-sm q-py-xs">
                {{ role.replace('ROLE_', '') }}
              </q-badge>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="text-right q-gutter-xs">
              <q-btn size="sm" color="info" icon="visibility" dense @click="viewUser(props.row)">
                <q-tooltip>View details</q-tooltip>
              </q-btn>
              <q-btn size="sm" color="primary" icon="edit" dense @click="editUser(props.row)">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn size="sm" color="negative" icon="delete" dense @click="confirmDelete(props.row)">
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>
    <div v-else class="full-height flex flex-center">
      <q-spinner-ios size="40px" color="primary" class="animated pulse infinite"/>
    </div>

    <q-dialog v-model="showUserDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editMode ? 'Edit User' : 'Create New User' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form>
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input v-model="currentUser.firstName" label="First Name" outlined dense :rules="[val => !!val || 'Field is required']"/>
              </div>
              <div class="col-6">
                <q-input v-model="currentUser.lastName" label="Last Name" outlined dense :rules="[val => !!val || 'Field is required']"/>
              </div>
              <div class="col-12">
                <q-select v-model="currentUser.gender" :options="genderOptions" label="Gender" outlined dense emit-value map-options/>
              </div>
              <div class="col-12">
                <q-input :readonly="isReadonly" v-model="currentUser.email" label="Email" type="email" outlined dense :rules="[
                   val => !!val || 'Field is required',
                   val => /.+@.+\..+/.test(val) || 'Invalid email format'
                 ]"/>
              </div>
              <div class="col-12">
                <q-select v-model="currentUser.roles" :options="roleOptions" :readonly="isReadonly" label="Roles" multiple outlined dense use-chips emit-value map-options/>
              </div>
              <div v-if="!editMode" class="col-12">
                <q-input v-model="currentUser.password" label="Password" type="password" outlined dense
                  rules="[val => !!val || 'Field is required']"/>
              </div>
            </div>

            <q-card-actions align="right" class="q-mt-md">
              <q-btn flat label="Cancel" color="negative" v-close-popup />
              <q-btn type="button" label="Save" color="primary" :loading="loadingButton"  @click.stop = "save(currentUser)"/>
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDetailsDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">User Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedUser">
          <div class="row q-col-gutter-y-md">
            <div class="col-12">
              <div class="text-caption text-grey">Full Name</div>
              <div class="text-body1">
                {{ selectedUser.firstName }} {{ selectedUser.lastName }}
              </div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey">Gender</div>
              <div class="text-body1">
                <q-badge :color="genderColor(selectedUser.gender)">
                  {{ selectedUser.gender }}
                </q-badge>
              </div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey">Email</div>
              <div class="text-body1">{{ selectedUser.email }}</div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey">Roles</div>
              <div class="q-gutter-xs">
                <q-badge
                  v-for="role in selectedUser.roles"
                  :key="role"
                  color="secondary"
                  class="q-px-sm q-py-xs"
                >
                  {{ role.replace('ROLE_', '') }}
                </q-badge>
              </div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey">Type</div>
              <div class="text-body1">{{ selectedUser.type || 'N/A' }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm"
          >Are you sure you want to delete this user?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Delete"
            color="negative"
            @click="deleteUser"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <UsersCreatedComponent />
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar';
import UsersCreatedComponent from "src/modules/Users/Components/UsersCreatedComponent.vue";
import {useUserStore} from "src/modules/Users/Store/UsersStore.js";
import {useSecurityStore} from "src/modules/security/store/security.js";

export default {
  name: 'UserManagement',
  components: {UsersCreatedComponent},
  setup () {
    const userStore = useUserStore()
    const security = useSecurityStore()
    return {
      security,
      userStore
    }
  },

  data() {
    return {
      $q: useQuasar(),

      loadingButton: false,
      users: [],
      loading: false,
      searchQuery: '',
      roleFilter: [],
      genderFilter: null,

      showUserDialog: false,
      showDetailsDialog: false,
      showDeleteDialog: false,

      editMode: false,
      selectedUser: null,
      currentUser: {
        firstName: '',
        lastName: '',
        gender: 'M',
        email: '',
        roles: [],
        password: '',
      },

      pagination: {
        sortBy: 'lastName',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0,
      },

      genderOptions: [
        { label: 'Male', value: 'M' },
        { label: 'Female', value: 'F' },
        { label: 'Other', value: 'O' },
      ],

      roleOptions: [
        { label: 'Admin', value: 'ROLE_ADMIN' },
        { label: 'User', value: 'ROLE_USER' },
        { label: 'Manager', value: 'ROLE_MANAGER' },
        { label: 'Editor', value: 'ROLE_EDITOR' },
      ],

      columns: [
        { name: 'firstName', label: 'First Name', field: 'firstName', align: 'left', sortable: true },
        { name: 'lastName', label: 'Last Name', field: 'lastName', align: 'left', sortable: true },
        { name: 'gender', label: 'Gender', field: 'gender', align: 'center', sortable: true },
        { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
        { name: 'roles', label: 'Roles', field: 'roles', align: 'left', sortable: true },
        { name: 'actions', label: '', field: 'actions', align: 'right' },
      ],
    };
  },

  computed: {
    isReadonly () {
      const usersRoles = this.security.getCurrentUser()?.roles ?? ['ROLE_USER']
      return !(!usersRoles.includes('SUPER_ADMIN') || !usersRoles.includes('CHEF_PROJECT'));

    },
    filteredUsers() {
      return this.users.filter(user => {
        const matchesSearch =
          this.searchQuery === '' ||
          user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesRoles =
          this.roleFilter.length === 0 ||
          this.roleFilter.some(role => user.roles.includes(role));

        const matchesGender =
          !this.genderFilter || user.gender === this.genderFilter;

        return matchesSearch && matchesRoles && matchesGender;
      });
    },
  },
  methods: {
    save (currentUser) {
      this.loadingButton = true
      this.userStore.update(currentUser).then(() => {
        this.showUserDialog = false
        this.loadingUsers()
      }).catch((error) => {
        console.log('error est', error)
      })
    },

    createUsers () {
      this.loadingUsers()
    },
    loadingUsers () {
      this.loading = true;
      this.userStore.getUsers().then(data => {
        this.users = data.users
        this.editMode = false;
        this.showUserDialog = false;
      }).catch((error) => {
        console.log('les erreurs sont', error)
      }).finally(() => {
        this.loading = false;
        this.loadingButton = false
      })
    },

    genderColor(gender) {
      switch (gender) {
        case 'M': return 'blue';
        case 'F': return 'pink';
        case 'O': return 'purple';
        default: return 'grey';
      }
    },

    viewUser(user) {
      this.selectedUser = user;
      this.showDetailsDialog = true;
    },

    editUser(user) {
      this.currentUser = { ...user };
      this.editMode = true;
      this.showUserDialog = true;
    },

    createUser() {
      this.currentUser = {
        firstName: '',
        lastName: '',
        gender: 'M',
        email: '',
        roles: [],
        password: '',
      };
      this.editMode = false;
      this.showUserDialog = true;
    },

     submitUser(user) {
      this.editMode = true
      this.loading = true
       console.log('----', user)
      this.userStore.update(user).then(data => {
        console.log('les data sont',  data)
      }).catch(error => {
        console.log('les errors sont', error)
      })

    },

    confirmDelete(user) {
      this.selectedUser = user;
      this.showDeleteDialog = true;
    },

     deleteUser() {
        this.userStore.deleteUser(this.selectedUser.id).then(() => {
          this.loadingUsers()
        }).catch((error) => {
          this.showSuccess(error?.message ?? 'error does not work');
          this.showSuccess('User deleted successfully');
        })
    },

    showSuccess(message) {
      this.$q.notify({
        type: 'positive',
        message,
        position: 'top-right',
      });
    },

    showError(message) {
      this.$q.notify({
        type: 'negative',
        message,
        position: 'top-right',
      });
    },
  },

  mounted() {
    this.createUsers();
  },
}
</script>


<style scoped>
.q-table__top {
  padding: 0;
}
.q-table__container {
  border-radius: 8px;
}
</style>
