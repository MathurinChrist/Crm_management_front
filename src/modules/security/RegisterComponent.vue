<template>
  <div class="register-container">
    <div class="register-form">
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <div class="text-h4 text-center q-mb-md">Créer un compte</div>

        <div class="row q-gutter-md">
          <q-input
            class="col"
            v-model="form.firstName"
            label="Prénom *"
            outlined
            :rules="[val => !!val || 'Champ obligatoire']"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            class="col"
            v-model="form.lastName"
            label="Nom *"
            outlined
            :rules="[val => !!val || 'Champ obligatoire']"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
        </div>

        <q-select
          v-model="form.gender"
          :options="genderOptions"
          label="Civilité *"
          outlined
          :rules="[val => !!val || 'Champ obligatoire']"
          emit-value
          map-options
        >
          <template v-slot:prepend>
            <q-icon name="wc" />
          </template>
        </q-select>

        <q-input
          v-model="form.email"
          label="Email *"
          type="email"
          outlined
          :rules="emailRules"
          lazy-rules
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-model="form.password"
          label="Mot de passe *"
          :type="showPassword ? 'text' : 'password'"
          outlined
          :rules="passwordRules"
          lazy-rules
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-input
          v-model="form.passwordConfirm"
          label="Confirmation mot de passe *"
          :type="showPassword ? 'text' : 'password'"
          outlined
          :rules="[
            val => !!val || 'Champ obligatoire',
            val => val === form.password || 'Les mots de passe ne correspondent pas'
          ]"
          lazy-rules
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <q-checkbox
          v-model="form.termsAccepted"
          label="J'accepte les conditions d'utilisation"
          :rules="[val => !!val || 'Vous devez accepter les conditions']"
        />

        <q-btn
          label="S'inscrire"
          type="submit"
          color="primary"
          :loading="loading"
          class="full-width"
        >
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            Enregistrement...
          </template>
        </q-btn>

        <div class="text-center q-mt-md">
          <p class="text-caption">
            Déjà un compte ?
            <q-btn
              label="Se connecter"
              flat
              dense
              color="primary"
              size="sm"
              @click="$router.push({ name: 'login' })"
            />
          </p>
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'

const $q = useQuasar()
const router = useRouter()

const form = ref({
  firstName: '',
  lastName: '',
  gender: 'M',
  email: '',
  password: '',
  passwordConfirm: '',
  termsAccepted: false
})

const showPassword = ref(false)
const loading = ref(false)

const genderOptions = [
  { label: 'Masculin', value: 'M' },
  { label: 'Féminin', value: 'F' },
  { label: 'Autre', value: 'O' }
]

const emailRules = [
  val => !!val || 'Champ obligatoire',
  val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email invalide'
]

const passwordRules = [
  val => !!val || 'Champ obligatoire',
  val => val.length >= 6 || 'Minimum 6 caractères',
  val => /[A-Z]/.test(val) || 'Doit contenir une majuscule',
  val => /[0-9]/.test(val) || 'Doit contenir un chiffre'
]

const handleSubmit = async () => {
  try {
    loading.value = true

    // Envoi des données au backend
    const response = await api.post('/api/register', {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      gender: form.value.gender,
      email: form.value.email,
      password: form.value.password
    })

    console.log('response', response)

    $q.notify({
      message: 'Inscription réussie !',
      color: 'positive',
      icon: 'check_circle'
    })

    // Redirection vers la page de connexion
    router.push({ name: 'login' })
  } catch (error) {
    let message = "Erreur lors de l'inscription"
    if (error.response?.data?.message) {
      message = error.response.data.message
    }

    $q.notify({
      message,
      color: 'negative',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('../../assets/background_image.jpg');
  background-size: cover;
  background-position: center;
  padding: 20px;
}

.register-form {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .register-form {
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
