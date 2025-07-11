<template>
  <q-dialog v-model="dialog" persistent>
    <q-card class="delete-confirmation-card">
      <q-card-section class="row items-center">
        <span class="text-h6">Confirmation de suppression</span>
      </q-card-section>

      <q-card-section>
        <p>Êtes-vous sûr de vouloir supprimer cet élément</p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Annuler" color="grey" v-close-popup @click="onCancel" class="q-mr-sm"/>
        <q-btn flat label="Supprimer" color="negative" @click="onConfirm" icon="delete"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'deletePopup',
  data () {
    return {
      dialog: null
    }
  },
  methods: {
    onConfirm() {
      this.$emit('confirm-deleting')
      this.dialog = false
    },
    onCancel() {
      this.$emit('cancel-deleting')
      this.dialog = false
    }
  }
}
</script>

<style scoped>
.delete-confirmation-card {
  min-width: 350px;
  max-width: 500px;
  border-left: 4px solid #f44336;
}

.delete-confirmation-card .q-card__section {
  padding: 20px;
}

.delete-confirmation-card .text-h6 {
  font-weight: 600;
  color: #f44336;
}
</style>
