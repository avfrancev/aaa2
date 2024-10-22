<script lang="ts" setup>
const viewEl = ref()
const viewStore = useViewStore()
viewStore.init(viewEl)

const pulsesStore = usePulsesStore()
</script>

<template lang="pug">
div(class="flex flex-col h-full")

  PulsesViewPulsesStoreNavbar

  div(
    ref="viewEl"
    class="relative py-2 h-full"
    )
    div(
      v-if="pulsesStore.data.size < 1"
      class="h-full items-center justify-center flex gap-12"
      )
      PulsesViewEditPulsesDialog(
        :model-value="[]"
        title="Create new pulses"
        :clear-on-save="true"
        @update:model-value="pulsesStore.add({ raw_data: $event })"
        )
        button(class="btn")
          | Create new pulses
      div(class="divider divider-horizontal h-[100px] self-center") OR
      button.btn(@click="loadSamplePulses()") Add sample pulses

    div(v-else)
      PulsesViewItem(
        v-for="p in pulsesStore.data"
        :key="p.id"
        v-bind="{ pulses: p }"
        )
      PulsesViewTicks
</template>
