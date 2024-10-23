<script setup lang="ts">
import type { Measurement } from "../models/Measurements"
import { extent, mean, quantile } from "d3-array"

const config = useConfig()

const descOpened = ref(true)

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
  if (!q.value)
    return "---"
  return Math.floor(((1 / (q.value || 1)) * 1000 * 1000))
})

const guessedValues = computed(() => {
  return {
    short: m.value.decoder.state.guessed?.short,
    long: m.value.decoder.state.guessed?.long,
    sync: m.value.decoder.state.guessed?.sync,
    gap: m.value.decoder.state.guessed?.gap,
    reset: m.value.decoder.state.guessed?.reset,
  }
})

const guessedValuesFiltered = computed(() => {
  return Object.entries(guessedValues.value)
    .filter(([_k, v]) => v !== undefined)
    .map(([k, v]) => [k, v])
})
</script>

<template lang="pug">
//- div Measurements Meta Card {{ m.maxX.value - m.minX.value }}
div(
  :ref="el => { if (el) m.metaRef.value = el }"
  v-hover="(s: any) => m.isHovered.value = s.hovering"
  class="flex gap-2 text-sm box-border p-3 py-3 rounded bg-base-300/80 backdrop-blur transition-[box-shadow,colors] duration-200"
  :class="[m.isHovered.value && 'ring ring-secondary/50', m.isSelected.value && 'ring ring-accent/50', config.pinMeasurements && 'shadow-lg']"
  )
  div
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
      button(class="join-item btn-xs border-none btn flex-1" @click="m.locateRectRef")
        i-lucide:locate-fixed
      button(class="join-item btn-xs border-none btn flex-1 hover:btn-error" @click="m.remove")
        i-tabler:trash
      button(class="join-item btn-xs btn flex-1" @click="descOpened = !descOpened")
        i-mingcute:right-fill(v-if="!descOpened")
        i-mingcute:left-fill(v-if="descOpened")

  div(v-show="descOpened" class="flex flex-col text-xs")
    //- Decoder slicers buttons
    div(class="ml-2 mb-2 join flex justify-stretch items-center gap-x-1")
      //- label.cursor-pointer.label
        span.label-text.mr-1 auto
        input( type="checkbox" :checked="m.decoder.state.pickedSlicer === null" :value="" class="toggle toggle-sm")
      button(
        class="btn btn-xs"
        @click="m.decoder.state.pickedSlicer = null"
        :class="{ ' btn-accent btn-outline': null === m.decoder.state.pickedSlicer}"
        ) Auto
      button(
        v-for="s in Decoder.slicers"
        :key="s"
        class=" mr-[1px]xs btn btn-xs"
        :class="{ ' btn-secondary btn-outline': s === m.decoder.state.pickedSlicer || s === m.decoder.state.guessed?.modulation }"
        @click="() => (m.decoder.state.pickedSlicer = s)") {{ s }}

    div(class="flex-1 ml-2 flex flex-col overflow-hidden max-w-sm overflow-x-auto text-xs")
      div(class="flex join")
      p(v-if="m.decoder.state.guessed" class="font-mono text-nowrap")
      pre #[b Guessing modulation]: {{ m.decoder.state.guessed?.name }}
      div(v-if="m.decoder.state.analyzer?.pulse_gap_skew && m.decoder.state.analyzer?.pulse_gap_skew !== Infinity")
        pre #[b DC bias (Pulse/Gap skew)]: {{ ((m.decoder.state.analyzer?.pulse_gap_skew || 0) * 100).toFixed(1) }}%
        p
          |#[b Timings]: &nbsp;
          template(
            v-for="[k, v] in guessedValuesFiltered"
            :key="k"
            ) {{ k }}: #[b {{ v.toFixed(0) }} ] &nbsp;
        pre #[b RfRaw (rx)]: {{ m.decoder.state.analyzer?.rfrawB1 }}
        pre #[b RfRaw (tx)]: {{ m.decoder.state.analyzer?.rfrawB0 }}
        pre(class="text-balances") #[b Bits]: {{ m.decoder.state.sliceGuess?.hex }}
</template>
