<script lang="ts" setup>
const viewEl = ref()
const viewStore = useViewStore()
viewStore.init(viewEl)
const { view } = viewStore
const { ZT, elBounds: { width, height } } = view

const pulsesStore = usePulsesStore()

const ticksArrayString = computed<string>(() => {
  if (!pulsesStore.xScale)
    return ""
  return view.ZT.rescaleX(pulsesStore.xScale.value).ticks(6).toString()
})

const ticks = computed(() => {
  return JSON.parse(`[${ticksArrayString.value}]`) || []
})
</script>

<template lang="pug">
div(class="flex flex-col h-full")
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
      svg(
        class="w-full absolute inset-0 pointer-events-none select-none touch-none -z-10 overflow-hidden fill-slate-700/30"
        :viewBox="`${view.viewportLeft.value} 0 ${view.viewportWidth.value} ${height}`"
        preserveAspectRatio="none"
        :height="height")
        path(
          class="stroke-base-content/50"
          stroke-width="1"
          stroke-dasharray="8 10"
          :transform="`matrix(${1},0,0,1,${view.mouseX.value},0)`"
          :d="`M ${0},0 V${height}`")
        path(
          class="stroke-base-content/20"
          stroke-dasharray="8 10"
          stroke-width="1"
          :d="ticks.reduce((acc: string, t: number) => `${acc}M ${pulsesStore?.xScale.value(t)},0 V${height} `, '')"
          )
        foreignObject.pointer-events-nones(
          :transform="`matrix(${1 / ZT.k},0,0,1,${0},0)`"
          :width="width * ZT.k"
          height="100"
          )
          div(
            v-for="t in ticks"
            :key="t"
            class="absolute top-0 -translate-x-1/2 text-xs"
            :style="`left: ${(pulsesStore?.xScale.value(t) || 0) / width * 100}%;`"
            ) {{ t / 1000 }}
          div(
            :style="`transform: translate3d(${view.mouseX.value * ZT.k}px, 0, 0)`"
            class="absolute top-0 text-xs")
            div(
              class="-translate-x-1/2 bg-base-300 text-base-content rounded py-1 px-1.5"
            ) {{ pulsesStore?.xScale.value.invert(view.mouseX.value).toFixed(0) }}
</template>
