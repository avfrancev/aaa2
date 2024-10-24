<script setup lang="ts">
const pulsesStore = usePulsesStore()
// const config = useConfig()

const measurements = computed(() => {
  return [...pulsesStore.data].flatMap((p) => {
    return [...p.measurements]
  })
})

const measurementsSorted = computed(() => {
  return measurements.value.toSorted((a, b) => (a.minX.value + a.pulses.xOffset.value) - (b.minX.value + b.pulses.xOffset.value))
})
</script>

<template lang="pug">
//- div Measurements Meta Card [ {{ measurementsSorted.length }} ]
  //- div(
  //-   class="pt-2 top-2 z-20 inline-flex self-start max-w-full"
  //-   )
//- div(class="scroll-ml-6 flex w-auto space-x-3 p-2 overflow-y-auto -ml-2")
div(class="scroll-ml-6 flex w-auto space-x-3 p-2 overflow-y-auto -ml-2")
  template(
    v-for="(_m, i) in measurementsSorted"
    :key="_m.id"
    )
    PulsesViewMeasurementsMetaCard(
      v-model="measurementsSorted[i]"
      )
  //- div(class="scroll-ml-6 flex w-auto space-x-3 p-2 overflow-y-auto -ml-2")
    PulsesViewMeasurementsMetaCard(
      v-for="m in measurements"
      :key="m.id"
      v-model="m"
      )
</template>
