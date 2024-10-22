<script lang="ts" setup>
const viewEl = ref()
const viewStore = useViewStore()
const { view } = viewStore
viewStore.init(viewEl)
const config = useConfig()
const pulsesStore = usePulsesStore()
</script>

<template lang="pug">

PulsesViewPulsesStoreNavbar.PulsesViewPulsesStoreNavbar(
  v-if="pulsesStore.data.size > 0"
  class="sticky top-2 z-20 bg-base-300/80 backdrop-blur")

.MeasurementsMetaWrapper(
  v-if="pulsesStore.data.size > 0"
  class=" inline-flex self-start max-w-full"
  :class="config.pinMeasurements && ['sticky top-10 z-30']")
  PulsesViewMeasurementsMeta

div(
  v-if="pulsesStore.data.size > 0"
  class="container fixed bottom-0 px-2 -ml-2 z-10")
  div(class="flex w-full bg-base-300 my-4 ring-4 ring-base-300 rounded-box")
    div(
      class="h-2 text-xs text-secondary-content text-center rounded-box bg-base-content/20 active:ring-1 ring-base-content/50 cursor-grab active:cursor-grabbing"
      v-drag="(e: any) => { view.translateBy(-e.delta[0] * view.ZT.k, 0) }"
      :style="{ width: `${Math.max(view.elBounds.width.value / view.ZT.k, 10)}px`, transform: `translateX(${-view.ZT.x / view.ZT.k}px)`}")

div(class="flex-1 flex flex-col h-full relative")

  div(
    v-if="pulsesStore.data.size < 1"
    class="justify-center self-center my-auto flex-1 flex flex-col items-center sm:flex-row sm:gap-12"
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


  
  div(
    ref="viewEl"
    class="viewEl"
    )


    div(
      v-if="pulsesStore.data.size > 0"
      class=""
      )
      PulsesViewItem(
        v-for="p in pulsesStore.data"
        :key="p.id"
        v-bind="{ pulses: p }"
        )
      PulsesViewTicks
</template>
