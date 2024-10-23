<script lang="ts" setup>
import type { IParsedPulses } from "../parserHelpers"

const pulsesStore = usePulsesStore()
const config = useConfig()

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
.join.mb-4(class="*:btn-sm ")
  PulsesViewEditPulsesDialog(
    value=""
    title="Create new pulses"
    :clear-on-save="true"
    @save="onPulsesSave"
    )
    button(class="join-item btn hover:btn-info")
      i-ph:file-plus-bold
      | Add
  AlertDialogRoot
    AlertDialogTrigger(class="join-item btn hover:btn-error")
      i-ph:trash
      | Clear
    AlertDialogPortal
      AlertDialogOverlay(class="DialogOverlay")
      AlertDialogContent(class="DialogContent flex flex-col")
        AlertDialogTitle.mb-2: b Clear all
        AlertDialogDescription(class="text-muted text-sm") Do you really want to clear all pulses?
        //- p(v-if="RfRaw.isRfRaw(tmp)") {{ RfRaw.getPulses(tmp) }}
        div(class="flex justify-end items-center gap-6")
          AlertDialogCancel(class="btn btn-xs btn-ghost") Cancel
          AlertDialogAction(
            class="btn btn-sm btn-error font-bold"
            @click="pulsesStore.removeAll()") Remove all
  button(
    class="join-item btn"
    :class="[config.pinMeasurements && 'btn-active bg-opacity-100']"
    @click="config.pinMeasurements = !config.pinMeasurements")
    i-clarity:pinned-solid
    | Pin measurements
</template>
