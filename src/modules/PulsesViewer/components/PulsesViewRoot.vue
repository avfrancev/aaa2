<script lang="ts" setup>
import type { PulsesStorage } from '../models/Pulses'
import sample_data from '../store/sample_data.json'

const viewEl = ref()
const viewStore = useViewStore()
viewStore.init(viewEl)
const { view } = viewStore
const { ZT, elBounds: { width, height } } = view

const pulsesStore = usePulsesStore()

const ticksArrayString = computed<string>(() => {
  if (!pulsesStore.xScale)
    return ''
  return view.ZT.rescaleX(pulsesStore.xScale.value).ticks(6).toString()
})

const ticks = computed(() => {
  return JSON.parse(`[${ticksArrayString.value}]`) || []
})

function addRandom(l = 100, max = 1000) {
  return {
    raw_data: Array.from({ length: l }).map(() => Math.random() * max + 100),
    xOffset: Math.random() * max,
    measurements: new Set(),
  } as unknown as PulsesStorage
}
</script>

<template lang="pug">
div
  //- pre {{ ZT }}
  //- pre >>> {{ getPulsesStore()?.data.size }}
  div
    button.btn(@click="pulsesStore?.add(sample_data[Math.floor(Math.random() * sample_data.length)])") Add sample pulses
    button.btn(@click="pulsesStore?.add(addRandom())") Add rand pulses
    button.btn.btn-sm(class="hover:btn-error" @click="pulsesStore.removeAll()") remove all

  div(
    ref="viewEl"
    class="relative py-2"
    )
    //- pre(
      v-for="p in pulsesStore.data"
      :key="p.id"
      ) {{ p.id }}
    PulsesViewItem(
      v-for="p in pulsesStore.data"
      :key="p.id"
      v-bind="{ pulses: p }"
      )
    //- pre {{ state }}
    //- pre {{ height }} {{ width }}
    //- pre {{ticksArrayString}}
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
