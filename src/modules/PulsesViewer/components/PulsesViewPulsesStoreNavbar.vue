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

const pulsesStoreDataString = computed(() => {
  return JSON.stringify([...pulsesStore.data])
})
const pulsesStoreDataClipboard = useClipboard({ source: pulsesStoreDataString })
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
  button(
    v-if="pulsesStoreDataClipboard.isSupported.value"
    class="join-item btn btn-sm"
    title="Copy all pulses as json"
    :class="[pulsesStoreDataClipboard.copied.value && 'btn-active btn-success']"
    @click="pulsesStoreDataClipboard.copy()")
      i-ph:check(v-if="pulsesStoreDataClipboard.copied.value")
      i-ph:clipboard-text(v-else)
      //- | {{ pulsesStoreDataClipboard.copied.value ? "Copied!" : "copy as json" }}
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
