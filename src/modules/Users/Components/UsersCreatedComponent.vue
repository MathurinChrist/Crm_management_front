<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Créer un nouvel utilisateur</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form class="q-gutter-md">
          <q-input
            v-model="user.firstName"
            label="Prénom *"
            outlined
            dense
            :rules="[val => !!val || 'Le champ est requis']"
          />
          <q-input
            v-model="user.lastName"
            label="Nom *"
            outlined
            dense
            :rules="[val => !!val || 'Le champ est requis']"
          />
          <q-input
            v-model="user.email"
            label="Email *"
            type="email"
            outlined
            dense
            :rules="[
              val => !!val || 'Le champ est requis',
              val => /.+@.+\..+/.test(val) || 'Format d’email invalide'
            ]"
          />

          <q-select
            v-model="user.gender"
            :options="genderOptions"
            label="Genre *"
            outlined
            dense
            emit-value
            map-options
            :rules="[val => !!val || 'Le champ est requis']"
          />
          <q-select v-model="user.user_type" :options="userTypeOptions" label="Type d'utilisateur *" outlined dense emit-value map-options :rules="[val => !!val || 'Le champ est requis']"/>

          <div class="row q-mt-lg justify-end q-gutter-sm">
            <q-btn label="Annuler" color="grey" v-close-popup flat />
            <q-btn label="Créer" type="submit" @click="submitForm" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { useQuasar } from 'quasar'
import {useSecurityStore } from "src/modules/security/store/security.js";
import {useUserStore} from "src/modules/Users/Store/UsersStore.js";

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:show', 'created'],
  setup() {
    const $q = useQuasar()
    const userSecurity = useSecurityStore()
    const usersStore = useUserStore()

    return { $q, userSecurity, usersStore }
  },
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
        { label: 'Administrateur', value: 'admin' },
        { label: 'Simple utilisateur', value: 'user' }
      ],
      roleOptions: [
        { label: 'Utilisateur', value: 'ROLE_USER' },
        { label: 'Administrateur', value: 'ROLE_SUPER_ADMIN' }
      ]
    }
  },
  mounted() {
    this.$emitter.on('user:created', this.createUser)
  },
  beforeUnmount() {
    this.$emitter.off('user:created', this.createUser)
    this.dialog = false
  },

  watch: {
    show(newVal) {
      this.showDialog = newVal
    },
    showDialog(val) {
      this.$emit('update:show', val)
    }
  },

  methods: {
    createUser () {
      this.resetForm()
      this.showDialog = true
    },
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

     submitForm() {
      this.loading = true
       this.usersStore.createUser(this.user).then(() => {
         this.$q.notify({color: 'positive', message: 'Utilisateur crée', con: 'check_circle'})
         this.$emit('created', this.user)
         this.closeDialog()
       }).catch((error) => {
         this.$q.notify({color: 'negative', message: error.response?.data?.message || 'Création échouée ', icon: 'error'})
       })
    }
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}
</style>

