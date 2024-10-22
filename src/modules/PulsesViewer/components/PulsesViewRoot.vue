<script lang="ts" setup>
const viewEl = ref()
const viewStore = useViewStore()
viewStore.init(viewEl)
const config = useConfig()
const pulsesStore = usePulsesStore()
</script>

<template lang="pug">
div(class="flex flex-col h-full")

  PulsesViewPulsesStoreNavbar(class="sticky top-2 z-20")
  div(
    class="pt-2 top-12 z-20 inline-flex self-start max-w-full"
    :class="config.pinMeasurements && ['sticky top-2 z-10']")
    PulsesViewMeasurementsMeta

  div(
    ref="viewEl"
    class="relative py-2 h-full flex-1"
    )
    div(
      v-if="pulsesStore.data.size < 1"
      class=" justify-center self-center my-auto flex-1 flex flex-col items-center sm:flex-row sm:gap-12"
      )
      PulsesViewEditPulsesDialog(
        :model-value="[]"
        title="Create new pulses"
        :clear-on-save="true"
        @update:model-value="pulsesStore.add({ raw_data: $event })"
        )
        button(class="btn md:btn-wide")
          | Create new pulses
      div(class="divider sm:divider-horizontal sm:h-[100px] self-center") OR
      button(
        class="btn md:btn-wide"
        @click="loadSamplePulses()") Add sample pulses

    div(v-else)
      PulsesViewItem(
        v-for="p in pulsesStore.data"
        :key="p.id"
        v-bind="{ pulses: p }"
        )
      PulsesViewTicks
</template>
