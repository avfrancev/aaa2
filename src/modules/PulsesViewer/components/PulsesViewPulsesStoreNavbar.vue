<script lang="ts" setup>
const pulsesStore = usePulsesStore()
</script>

<template lang="pug">
.join.mb-4(class="*:btn *:btn-sm ")
  PulsesViewEditPulsesDialog(
    :model-value="[]"
    title="Create new pulses"
    :clear-on-save="true"
    @update:model-value="pulsesStore.add({ raw_data: $event })"
    )
    button(class="join-item hover:btn-info")
      i-ph:file-plus-bold
      | Add
  AlertDialogRoot
    AlertDialogTrigger(class="join-item hover:btn-error")
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
</template>
