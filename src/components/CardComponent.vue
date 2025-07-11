<template>
  <q-card class="col-xs-12 col-sm-4 bg-white text-dark">
    <q-card-section>
      <div class="text-subtitle1"> {{ title }} </div>
      <div :class="['text-h5', counterColorClass]"> {{ counters }} </div>
    </q-card-section>
  </q-card>
</template>
<script setup>
  import { computed } from 'vue'
  const props = defineProps({
    title: {
      type: Object,
      required: true
    },
    counters: {
      type: Number,
      required: true
    },
    colorCounters: {
      type: String,
      default: 'grey'
    }
  })

  const counterColorClass = computed(() => {
    return 'text-'.props.colorCounters
  })
</script>
