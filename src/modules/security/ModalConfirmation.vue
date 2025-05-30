<template>
  <q-dialog v-model="showModal" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center">
        <q-icon name="email" color="primary" size="md" class="q-mr-sm" />
        <span class="text-h6">Email envoyé !</span>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <p>
          Un email contenant vos identifiants vient de vous être envoyé à l'adresse
          <strong>{{ email ?? 'kimbembebobann2001@gmail.com' }}</strong>.
        </p>
        <p class="text-caption text-grey">
          Vérifiez votre boîte de réception (et vos spams si vous ne le trouvez pas).
        </p>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="VALIDER" @click="onOk" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ModalConfirmation',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    email: {
      type: String,
      required: true
    }
  },
  computed: {
    showModal: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    onOk() {
      this.$emit('back-home')
    }
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}
</style>
