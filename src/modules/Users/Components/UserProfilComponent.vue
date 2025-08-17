<template>
  <q-dialog v-model="internalShowProfile" persistent>
    <q-card class="q-pa-lg user-profile-card" bordered>
      <q-card-section class="flex align justify-between">
        <div class="text-h6">Profil utilisateur</div>
        <q-btn dense flat icon="close" @click.stop="closeCard" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-sm">
        <q-input v-model="form.lastName" label="Nom" :readonly="!editMode" />
        <q-input v-model="form.firstName" label="Prénom" :readonly="!editMode" />
        <q-input v-model="form.email" label="Email" type="email" readonly />
        <q-select v-model="form.gender" label="Genre" :options="genderOptions" emit-value map-options :readonly="!editMode"/>
        <q-select v-model="form.user_type" label="Type d'utilisateur" :options="userTypeOptions" emit-value map-options readonly/>

        <div>
          <strong>Rôles :</strong>
          <q-chip v-for="role in form.roles" :key="role" color="primary" text-color="white" class="q-mr-sm">
            {{ role }}
          </q-chip>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="between">
        <div>
          <q-btn v-if="!editMode" label="Modifier" icon="edit" color="primary" @click="editMode = true" />
          <q-btn v-else label="Enregistrer" icon="save" color="positive" @click="updateProfile" />
          <q-btn v-if="editMode" label="Annuler" flat @click="cancelEdit" />
        </div>
        <div>
          <q-btn flat color="warning" label="Changer mot de passe" icon="lock" @click="showPasswordDialog = true" />
        </div>
      </q-card-actions>

      <!-- MODALE : Changer mot de passe -->
      <q-dialog v-model="showPasswordDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Changer le mot de passe</div>
          </q-card-section>

          <q-card-section class="q-gutter-sm">
            <q-input v-model="passwordForm.current" label="Mot de passe actuel" type="password" />
            <q-input v-model="passwordForm.new" label="Nouveau mot de passe" type="password" />
            <q-input v-model="passwordForm.confirm" label="Confirmation" type="password" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Annuler" @click="showPasswordDialog = false" />
            <q-btn color="primary" :loading="loadingButton" label="Valider" @click="changePassword" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script>
import { useSecurityStore } from 'src/modules/security/store/security.js'

export default {
  name: 'UserProfileCard',
  props: {
    showProfile: Boolean,
    data: Array
  },
  data() {
    return {
      loading: false,
      loadingButton: false,
      userInformation: null,
      internalShowProfile: false,
      user: null,
      form: null,
      editMode: false,
      showPasswordDialog: false,
      passwordForm: {
        current: '',
        new: '',
        confirm: '',
      },
      genderOptions: [
        { label: 'Homme', value: 'M' },
        { label: 'Femme', value: 'F' },
        { label: 'Autre', value: 'O' },
      ],
      userTypeOptions: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'Utilisateur', value: 'user' },
      ],
    }
  },

  setup() {
    const securityStore = useSecurityStore()
    return { securityStore }
  },

  mounted() {
    this.$emitter.on('user:info', this.openPopup)
  },
  beforeUnmount() {
    this.$emitter.off('user:info', this.openPopup)
  },
  watch: {
    showProfile: {
      immediate: true,
      handler (val) {
        if (val) {
          this.openPopup()
        }
      }
    },

    internalShowProfile (val) {
      if (!val) {
        this.$emit('close-card')
      }
    }
  },


  methods: {
    openPopup () {
      this.securityStore.getMe().then(data => {
        console.log('la data est', data)
        this.user = data.user
        console.log('le user', this.user)
         if (this.user.id) {
           this.form = { ...data.user }
           this.internalShowProfile = true
         }
      })
    },

    closeCard () {
      this.internalShowProfile = false
      this.$emit('close-card')
    },

    cancelEdit() {
      this.form = { ...this.user }
      this.editMode = false
    },

     updateProfile() {
      const payload = {...this.form }
       this.loading = true
      this.securityStore.updateProfile(payload).then(() => {
        this.$q.notify({ type: 'success', message: 'Vos informations ont été mises à jour' })
      }).catch((error) => {
        this.$q.notify({ type: 'warning', message: error?.message ?? 'Une erreur s\'est produite' })
      }).finally(() => {
        this.loading = true
        this.internalShowProfile = false
      })
    },

     changePassword() {
      if (this.passwordForm.new !== this.passwordForm.confirm) {
        this.$q.notify({ type: 'negative', message: 'Les mots de passe ne correspondent pas' })
        return
      }
       this.loadingButton = true
      this.securityStore.resetPassword(this.passwordForm).then((data) => {
        this.$q.notify({ type: 'success', message: data?.message })
      }).catch((error) => {
        this.$q.notify({ type: 'negative', message: error?.message })
        this.loadingButton = false
      }).finally(() => {
        this.loading = false
        this.loadingButton = false
      })

    },
  },
}
</script>

<style scoped>
.user-profile-card {
  width: 100%;
  max-width: 600px;
}
</style>
