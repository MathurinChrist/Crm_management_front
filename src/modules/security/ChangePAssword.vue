<template>
  <q-card class="q-pa-md q-mx-auto" style="max-width: 400px">
    <q-card-section>
      <div class="text-h6">Changer le mot de passe</div>
    </q-card-section>

    <q-form ref="formRef">
      <q-card-section class="q-gutter-md">
        <q-input v-model="form.newPassword" :type="showPassword.new ? 'text' : 'password'" label="Nouveau mot de passe"
          :rules="[val => !!val || 'Champ requis',val => val.length >= 8 || 'Au moins 8 caractères',val => /[A-Z]/.test(val) || 'Une majuscule requise',val => /[0-9]/.test(val) || 'Un chiffre requis']"
          :append="showPasswordIcon('new')"
          @click:append="togglePassword('new')"
        />

        <q-input
          v-model="form.confirmPassword"
          :type="showPassword.confirm ? 'text' : 'password'"
          label="Confirmer le mot de passe"
          :rules="[val => val === form.newPassword || 'Les mots de passe ne correspondent pas']"
          :append="showPasswordIcon('confirm')"
          @click:append="togglePassword('confirm')"
        />

        <q-btn
          type="submit"
          label="Changer le mot de passe"
          color="primary"
          class="full-width"
          :loading="loading"
          @click= handleSubmit()
        />
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script>
import { useSecurityStore } from "src/modules/security/store/security.js"

export default {
  name: 'PasswordChangeForm',
  setup () {
    const securityStore = useSecurityStore()
    return {
      securityStore
    }
  },
  data() {
    return {
      form: {
        newPassword: '',
        confirmPassword: ''
      },
      showPassword: {
        new: false,
        confirm: false
      },
      loading: false
    }
  },

  mounted() {
    const token = this.$route.query.token
    if (!token) {
      return this.$router.push('login')
    }
  },

  methods: {
    togglePassword(field) {
      this.showPassword[field] = !this.showPassword[field]
    },

    showPasswordIcon(field) {
      return this.showPassword[field] ? 'visibility_off' : 'visibility'
    },

    handleSubmit() {
      const valid = this.$refs.formRef.validate()
      if (!valid) return
      this.loading = true
      const payload = {confirm: this.form.confirmPassword, current: null}
      this.securityStore.resetPassword(payload).then(() => {
        this.$q.notify({type: 'positive', message: 'Mot de passe modifié avec succès !'})
      }).catch(() => {
        this.$q.notify({type: 'negative', message: 'Une erreur est survenue'})
      }).finally(() => {
        return this.$router.push('login')
      })
    }
  }
}
</script>
