<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Create New User</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="submitForm" class="q-gutter-md">
          <q-input v-model="user.firstName" label="First Name *" outlined dense :rules="[val => !!val || 'Field is required']"/>
          <q-input v-model="user.lastName" label="Last Name *" outlined dense :rules="[val => !!val || 'Field is required']"/>
          <q-input
            v-model="user.email"
            label="Email *"
            type="email"
            outlined
            dense
            :rules="[
              val => !!val || 'Field is required',
              val => /.+@.+\..+/.test(val) || 'Email must be valid'
            ]"
          />

          <q-select
            v-model="user.gender"
            :options="genderOptions"
            label="Gender *"
            outlined
            dense
            emit-value
            map-options
            :rules="[val => !!val || 'Field is required']"
          />

          <q-select
            v-model="user.user_type"
            :options="userTypeOptions"
            label="User Type *"
            outlined
            dense
            emit-value
            map-options
            :rules="[val => !!val || 'Field is required']"
          />

          <q-select
            v-model="user.roles"
            multiple
            :options="roleOptions"
            label="Roles"
            outlined
            dense
            use-chips
            emit-value
            map-options
          />

          <q-input
            v-model="user.password"
            label="Password *"
            :type="isPwdVisible ? 'text' : 'password'"
            outlined
            dense
            :rules="[
              val => !!val || 'Field is required',
              val => val.length >= 8 || 'Minimum 8 characters'
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwdVisible ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwdVisible = !isPwdVisible"
              />
            </template>
          </q-input>

          <div class="row q-mt-lg justify-end q-gutter-sm">
            <q-btn label="Cancel" color="grey" v-close-popup flat />
            <q-btn label="Create" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { useQuasar } from 'quasar'

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:show', 'created'],

  data() {
    return {
      showDialog: this.show,
      isPwdVisible: false,
      loading: false,
      user: {
        firstName: '',
        lastName: '',
        email: '',
        gender: 'M',
        user_type: 'admin',
        roles: [],
        password: ''
      },
      genderOptions: [
        { label: 'Male', value: 'M' },
        { label: 'Female', value: 'F' },
        { label: 'Other', value: 'O' }
      ],
      userTypeOptions: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' }
      ],
      roleOptions: [
        { label: 'User', value: 'ROLE_USER' },
        { label: 'Admin', value: 'ROLE_ADMIN' },
        { label: 'Super Admin', value: 'ROLE_SUPER_ADMIN' }
      ]
    }
  },

  watch: {
    show(newVal) {
      this.showDialog = newVal
    },
    showDialog(val) {
      this.$emit('update:show', val)
    }
  },

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  methods: {
    resetForm() {
      this.user = {
        firstName: '',
        lastName: '',
        email: '',
        gender: 'M',
        user_type: 'admin',
        roles: [],
        password: ''
      }
    },

    closeDialog() {
      this.showDialog = false
      this.$emit('update:show', false)
      this.resetForm()
    },

    async submitForm() {
      this.loading = true
      try {
        this.$q.notify({
          color: 'positive',
          message: 'User created successfully',
          icon: 'check_circle'
        })

        this.$emit('created', this.user)
        this.closeDialog()
      } catch (error) {
        this.$q.notify({
          color: 'negative',
          message: error.response?.data?.message || 'Failed to create user',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}
</style>

