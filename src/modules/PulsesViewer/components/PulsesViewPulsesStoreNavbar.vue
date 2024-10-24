<script lang="ts" setup>
import type { IParsedPulses } from "../parserHelpers"

const pulsesStore = usePulsesStore()
const config = useConfig()

const fullscreen = useFullscreen()

function onPulsesSave(val: IParsedPulses) {
  if (val.data && typeof val.data === "object") {
    if (val.type === FormatType[FormatType.Array] || val.type === FormatType[FormatType.RfRaw])
      pulsesStore.add({ raw_data: val.data as number[] })
    else if (val.type === FormatType[FormatType.Json] && "raw_data" in val.data)
      pulsesStore.add(val.data)
  }
}
</script>

<template lang="pug">
.join.mb-4
  PulsesViewEditPulsesDialog(
    value=""
    title="Create new pulses"
    :clear-on-save="true"
    @save="onPulsesSave"
    )
    button(class="join-item btn btn-sm hover:btn-info" title="Add new pulses")
      i-ph:file-plus-bold
  AlertDialogRoot
    AlertDialogTrigger(class="join-item btn btn-sm hover:btn-error" title="Remove all pulses")
      i-carbon:row-delete
    AlertDialogPortal
      AlertDialogOverlay(class="DialogOverlay")
      AlertDialogContent(class="DialogContent flex flex-col")
        AlertDialogTitle.mb-2: b Remove all pulses
        AlertDialogDescription(class="text-muted text-sm") Do you really want to remove all pulses?
        //- p(v-if="RfRaw.isRfRaw(tmp)") {{ RfRaw.getPulses(tmp) }}
        div(class="flex justify-end items-center gap-6")
          AlertDialogCancel(class="btn btn-xs btn-ghost") Cancel
          AlertDialogAction(
            class="btn btn-sm btn-error font-bold"
            @click="pulsesStore.removeAll()") Remove all
  button(
    class="join-item btn btn-sm hover:btn-error"
    title="Remove all measurements"
    :disabled="pulsesStore.allMeasurements.value.size === 0"
    @click="pulsesStore.removeAllMeasurements()")
      i-mdi:selection-remove
  button(
    class="join-item btn btn-sm"
    title="Reset all offsets"
    :disabled="[...pulsesStore.data].filter(p => p.xOffset.value !== 0).length === 0"
    @click="pulsesStore.data.forEach(p => p.setXOffset(0))")
      i-ph:align-left-fill
  .flex.w-full
    button(
      class="join-item btn btn-sm ml-auto"
      :class="[config.pinMeasurements && 'btn-active bg-opacity-100']"
      title="Pin measurements"
      @click="config.pinMeasurements = !config.pinMeasurements")
      i-clarity:pinned-solid
    button.btn.btn-sm(@click="fullscreen.toggle()")
      i-mingcute:fullscreen-fill(v-if="!fullscreen.isFullscreen.value")
      i-mingcute:fullscreen-exit-fill(v-else)
</template>
