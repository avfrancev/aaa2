<script lang="ts" setup>
import { RfRaw } from "pulseplot/lib/rfraw"

const { title = "Edit pulses", clearOnSave = false } = defineProps<{ title?: string, clearOnSave?: boolean }>()

const [model] = defineModel<number[]>({ default: [] })

const tmp = ref(model.value.toString())

function cancelSave() {
  tmp.value = model.value.toString()
}

const textareaEl = ref<HTMLTextAreaElement>()
useFocus(textareaEl, { initialValue: true })

enum FormatType {
  unknown,
  RfRaw,
  Array,
}

function getFromRFRaw(s: string) {
  if (!RfRaw.isRfRaw(s))
    return
  return RfRaw.getPulses(s)
}

const parsed = computed(() => {
  let res: { type: FormatType, pulses: number[] } | undefined
  let p = getFromRFRaw(tmp.value)

  if (p && p.filter(Boolean).length) {
    // AA B1 03 00C8 02DA 1D2E 28190909090908181909081818181908190909090819081818 55
    res = {
      type: FormatType.RfRaw,
      pulses: p,
    }
  }

  p = tmp.value.split(",").map(Number).filter(Boolean)
  if (Array.isArray(p) && p.length) {
    res = {
      type: FormatType.Array,
      pulses: p,
    }
  }
  if (res && res.pulses.at(-1) !== 0)
    res.pulses.push(0)
  return res
})


function save() {
  if (parsed.value) {
    // console.log(parsed.value.pulses);
    model.value = parsed.value.pulses
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
      AlertDialogDescription(class="text-muted text-sm") Description Description Description Description
      //- p(v-if="RfRaw.isRfRaw(tmp)") {{ RfRaw.getPulses(tmp) }}
      p {{ parsed?.pulses.length }}
      textarea.textarea.w-full.my-4(
        ref="textareaEl"
        v-model="tmp"
        placeholder="AA B1 03 00C8 02DA 1D2E 28190909090908181909081818181908190909090819081818 55"
        class="h-[400px]"
        :class="parsed ? 'textarea-success' : 'textarea-error'")
      div(class="flex justify-end items-center gap-6")
        AlertDialogCancel(class="btn btn-xs btn-ghost" @click="cancelSave") Cancel
        AlertDialogAction(
          class="btn btn-sm btn-success font-bold"
          :disabled="!parsed"
          @click="save") Save
</template>
