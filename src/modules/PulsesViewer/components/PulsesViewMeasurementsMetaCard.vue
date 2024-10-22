<script setup lang="ts">
import type { Measurement } from "../models/Measurements"
import { extent, mean, quantile } from "d3-array"

const config = useConfig()

const m = defineModel<Measurement>({ required: true })

const width = computed(() => (m.value.maxX.value - m.value.minX.value).toFixed(0))
const pulsesInRange = computed(() => m.value.pulses.data.value.slice(...m.value.rangeIds.value))
const Nfalling = computed(() => pulsesInRange.value.filter(p => p.level).length)
const Nrising = computed(() => pulsesInRange.value.filter(p => !p.level).length)
const minmaxFreq = computed(() => extent(pulsesInRange.value, d => d.width))
// const averageTime = computed(() => pulsesInRange.value.reduce((acc, curr) => acc + curr.width, 0) / m.pulsesInRange.length)
// const averageTime = computed(() => mean(pulsesInRange.value, d => d.width))
const q = computed(() => quantile(pulsesInRange.value, 0.05, d => d.width))
const baud = computed(() => {
  if (!q.value) return "---"
  return Math.floor(((1 / (q.value || 1)) * 1000 * 1000))
})
</script>

<template lang="pug">
//- div Measurements Meta Card {{ m.maxX.value - m.minX.value }}
div(
  :ref="el => { if (el) m.metaRef.value = el }"
  v-hover="(s: any) => m.isHovered.value = s.hovering"
  class="flex flex-col gap-2 text-sm box-border p-3 py-3 rounded bg-base-300/80 backdrop-blur transition-[box-shadow,colors] duration-200"
  :class="[m.isHovered.value && 'ring ring-secondary/50', m.isSelected.value && 'ring ring-accent/50', config.pinMeasurements && 'shadow-lg']"
  )
  div(class="flex items-baseline space-x-3")
    button(
      class="size-4 rounded-full"
      :style="{ 'background-color': m.color.value }"
      @click="m.changeColor")
    pre #[small Δ]T
    pre: b {{ width }} µs

  div(class="[&>*:nth-child(even)]:text-right flex-1 grid grid-cols-2 items-center")
    pre N#[sub pulses]
    pre: b {{ pulsesInRange.length }}
    pre N#[sub falling]
    pre: b {{ Nfalling }}
    pre N#[sub rising]
    pre: b {{ Nrising }}
    pre #[i &#402;]#[sub min]
    pre: b {{ minmaxFreq[0] }} µs
    pre #[i &#402;]#[sub max]
    pre: b {{ minmaxFreq[1] }} µs
    //- pre {{ averageTime }}
    pre #[i &#402;]#[sub baud]
    pre: b {{ baud }}

  div(class="join flex mt-2")
    button(class="join-item btn-xs btn flex-1" @click="m.locateRectRef")
      i-lucide:locate-fixed
    button(class="join-item btn-xs btn flex-1 hover:btn-error" @click="m.remove")
      i-tabler:trash
    //- button(class="join-item btn-xs btn flex-1" @click="m.descOpened = !m.descOpened")
      i-mingcute:right-fill(v-if="!m.descOpened")
      i-mingcute:left-fill(v-if="m.descOpened")
</template>

<style lang="sass" scoped>
.meta
  @apply flex justify-between
</style>
