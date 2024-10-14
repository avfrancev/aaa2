<template lang="pug">
div
  //- p {{ hintsBitsFiltered.map(d => d.flatMap(g => g.bits).length) }}
  svg(
    class="h-[20px] w-full text-sm font-mono"
    :viewBox="`${props.pulses.viewBox.value.x} 0 ${props.pulses.viewBox.value.w} 20`"
    preserveAspectRatio="none"
    )
    path.stroke-1.stroke-warning-content.fill-primary.opacity-50(:d="bytesRombPathes")
    path.stroke-1.stroke-warning-content.fill-accent(:d="bitsRombPathes")
    path.stroke-1.stroke-error(:d="ASDPATH")
    
    text(
      v-for="m,i in hintsBytesFiltered"
      y="15"
      :transform="`matrix(${1 / ZT.k},0,0,1,0,0)`"
      :key="i"
      text-anchor="middle"
      )
      tspan.fill-warning-content(
        v-for="d in m.flatMap(g => g.bytes)"
        @click="console.log(m.flatMap(d => d.bytes))"
        :x="(d.scaledX1 + d.scaledWidth / 2) * ZT.k"
        ) {{ d.label }}
    text(
      v-for="m,i in hintsBitsFiltered"
      y="15"
      :transform="`matrix(${1 / ZT.k},0,0,1,0,0)`"
      :key="i"
      text-anchor="middle"
      )
      tspan.fill-warning-content(
        v-for="d in m.flatMap(g => g.bits)"
        @click="console.log(m.flatMap(d => d.bits))"
        :x="(d.scaledX1 + d.scaledWidth / 2) * ZT.k"
        ) {{ d.label }}
  canvas(
    ref="canvasEl"
    :width="view.elBounds.width.value"
    :height="50"
    )
</template>

<script setup lang="ts">
import { Decoder } from "../models/MeasurementDecoders";
import type { PulsesItem, Pulses } from "../models/Pulses"
import type { BitsHints, HintsGroups, IBitsHintsGroup } from "../workers/analyzer.worker";

const props = defineProps<{ pulses: Pulses }>()

const pulsesStore = usePulsesStore()
const { view } = useViewStore()
const ZT = view.ZT
const canvasEl = ref<HTMLCanvasElement | null>(null)
const canvasIsVisible = useElementVisibility(canvasEl)

const canvas = document.createElement("canvas")
const context = canvas.getContext("2d") as CanvasRenderingContext2D
context.font = "0.875rem monospace"

function getTextWidth(s = "") {
  return context.measureText(s).width;
}

const hintsGroups = computed(() => {
  let arr = [] as HintsGroups[]
  props.pulses.measurements.forEach(m => {
    if (m.decoder.state.sliceGuess) arr.push(m.decoder.state.sliceGuess.hintsGroups)
  })
  return arr
})

//
// TODO: make array of filtered bytes with nested array of filtered bits
// 

const hintsBitsFiltered = computed(() => {
  return hintsGroups.value.map(m => {
    return m.map(g => {
      const bits = []
      for (let h of g.bits) {
        if (!view.isRangeInView(h.scaledX1 + props.pulses.scaledXOffset.value, h.scaledX2 + props.pulses.scaledXOffset.value + h.scaledWidth)) continue
        if ((Math.abs(+getTextWidth(h.label)) + 5) / ZT.k > h.scaledWidth) break
        bits.push(h)
      }
      return { bits }
    })
  })
})

const hintsBytesFiltered = computed(() => {
  return hintsGroups.value.map(m => {
    return m.map(g => {
      const bytes = []
      for (let h of g.bytes) {
        if (!view.isRangeInView(h.scaledX1 + props.pulses.scaledXOffset.value, h.scaledX2 + props.pulses.scaledXOffset.value + h.scaledWidth)) continue
        if ((Math.abs(+getTextWidth(h.label)) + 5) / ZT.k > h.scaledWidth) break
        bytes.push(h)
      }
      return { bytes }
    })
  })
})

const ASDPATH = computed(() => {
  const groups =hintsGroups.value.flatMap(m => m.map(g => g))
  let s = ""
  for (let g of groups) {
    s += `M${g.scaledX1},${0} V${100} M${g.scaledX2 || 0},${0} V${100}`
  }
  return s
})


const bitsRombPathes = computed(() => {
  let s = ""
  hintsBitsFiltered.value.forEach((m, i) => {
    m.flatMap(d => d.bits).forEach((d) => {
      s += rombPath(d.scaledX1, d.scaledWidth, 20, 5 / ZT.k)
    })
  })
  return s
})

const bytesRombPathes = computed(() => {
  let s = ""
  hintsBytesFiltered.value.forEach((m, i) => {
    m.flatMap(d => d.bytes).forEach((d) => {
      s += rombPath(d.scaledX1, d.scaledWidth, 20, 5 / ZT.k)
    })
  })
  return s
})


function rombPath(s: number = 0, w: number, h = 20, p = 5) {
  return `M${s},${h/2}L${s+p},${h}H${s+w-p}L${s+w},${h/2}L${s+w-p},${0}H${s+p}L${s},${h/2}Z`
}

</script>
