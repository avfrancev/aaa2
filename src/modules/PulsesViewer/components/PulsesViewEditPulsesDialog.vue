<script lang="ts" setup>
import type { PulsesStorage } from "../models/Pulses"
import type { IParsedPulses } from "../parserHelpers"

const { value, title = "Edit pulses", clearOnSave = false } = defineProps<{ value: string, title?: string, clearOnSave?: boolean }>()

const emit = defineEmits<{
  save: [data: IParsedPulses]
}>()

const tmp = ref(value)

function cancelSave() {
  tmp.value = value
}

const textareaEl = ref<HTMLTextAreaElement>()
useFocus(textareaEl, { initialValue: true })

const parsed = ref<IParsedPulses>()

watchEffect(() => {
  const p = getParsedInputString(tmp.value)
  if (p) {
    if (p.type === FormatType[FormatType.Array] || p.type === FormatType[FormatType.RfRaw]) {
      if ((p.data as number[])?.at(-1) !== 0)
        (p?.data as number[])?.push(0)
    }
    else if (p.type === FormatType[FormatType.Json]) {
      if ((p.data as Partial<PulsesStorage>)?.raw_data?.at(-1) !== 0)
        (p?.data as Partial<PulsesStorage>)?.raw_data?.push(0)
    }
  }
  parsed.value = p as IParsedPulses
})

const totalPulses = computed(() => {
  if (parsed.value === undefined)
    return undefined
  if (parsed.value.type === FormatType[FormatType.Array] || parsed.value.type === FormatType[FormatType.RfRaw])
    return (parsed.value?.data as number[])?.length
  if (parsed.value.type === FormatType[FormatType.Json])
    return (parsed.value?.data as Partial<PulsesStorage>)?.raw_data?.length
  return undefined
})

function save() {
  if (parsed.value) {
    emit("save", parsed.value)
    clearOnSave && (tmp.value = "")
  }
}
</script>

<template lang="pug">
AlertDialogRoot
  AlertDialogTrigger(:as-child="true")
    slot
      button(class="btn btn-sm btn-ghost")
        i-ph:ambulance-light
  AlertDialogPortal
    AlertDialogOverlay(class="DialogOverlay")
    AlertDialogContent(class="DialogContent flex flex-col" @escape-key-down="cancelSave")
      AlertDialogTitle.mb-2: b {{ title }}
      AlertDialogDescription(class="text-muted text-sm")
      textarea.textarea.w-full.my-4(
        ref="textareaEl"
        v-model="tmp"
        placeholder="AA B1 03 00C8 02DA 1D2E 28190909090908181909081818181908190909090819081818 55"
        class="h-[400px]"
        :class="parsed ? 'textarea-success' : 'textarea-error'")
      div(class="flex justify-end items-center gap-6")
        div.text-muted.mr-auto Type: {{ parsed?.type }} | Total pulses: {{ totalPulses }}
        AlertDialogCancel(class="btn btn-xs btn-ghost" @click="cancelSave") Cancel
        AlertDialogAction(
          class="btn btn-sm btn-success font-bold"
          :disabled="!parsed"
          @click="save") Save
</template>
