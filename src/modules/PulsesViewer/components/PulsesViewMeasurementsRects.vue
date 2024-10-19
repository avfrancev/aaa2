<script setup lang="ts">
import type { GestureState } from '@vueuse/gesture'

import type { Measurement } from '../models/Measurements'
import type { Pulses, PulsesItem } from '../models/Pulses'
import { bisector, sum } from 'd3-array'

const { pulses, top = 1, bottom = 98 } = defineProps<{ pulses: Pulses, top?: number, bottom?: number }>()

const pulsesStore = usePulsesStore()
const { view } = useViewStore()
const ZT = view.ZT

function dragHandler(m: Measurement) {
  return function (s: GestureState<'drag'>) {
    if (m.isSelected.value) {
      s.event?.stopImmediatePropagation()
      const dx = (pulsesStore.pixelRatio.value * s.delta[0]) / ZT.k
      m.x1.value += dx
      m.x2.value += dx
    }
  }
}

const bisectPulses = bisector((d: PulsesItem) => d.scaledTime).center

function resizeHandleHandler(m: Measurement, key: 'x1' | 'x2', s: any) {
  s.event.stopImmediatePropagation()
  let x = (s.event.clientX - view.elBounds.left.value)
  x = ZT.invertX(x)
  x -= pulses.scaledXOffset.value
  const id = bisectPulses(pulses.data.value, x)
  const { time, scaledTime } = pulses.data.value[id]
  const cond = Math.abs(scaledTime - x) * ZT.k < 7
  m[key].value = (cond && s.altKey) ? time : pulsesStore.xScale.value.invert(x)
}
</script>

<template lang="pug">
svg(
  class="measurement-rect focus:outline-none pointer-events-auto overflow-visible"
  :ref="el => { if (el) m.rectRef.value = el }"
  v-for="m in pulses.measurements"
  v-hover="(s: any) => { m.isHovered.value = s.hovering }"
  @focus="() => (m.isSelected.value = true)"
  @blur="() => (m.isSelected.value = false)"
  @click.prevent="(e) => { e.preventDefault(); view.gesturesState.value.drag.distance == 0 && (e.currentTarget)?.focus() }"
  @mousedown.prevent="(e) => { e.preventDefault() }"
  v-drag="dragHandler(m)"
  tabindex="0"
  @keydown.esc="(e) => { (e.currentTarget)?.blur() }"
  @keydown.left="(e) => { let d = (pulsesStore.pixelRatio.value * 10) / ZT.k; m.x1.value -= d; m.x2.value -= d }"
  @keydown.right="(e) => { let d = (pulsesStore.pixelRatio.value * 10) / ZT.k; m.x1.value += d; m.x2.value += d }"
  @keydown.delete.d="(e) => { m.remove() }"
  @keydown.c="(e) => { m.changeColor() }"
  @keydown.space.prevent="(e) => { m.locate() }"
  preserveAspectRatio="none"
  :x="m.scaledMinX.value"
  :width="m.scaledWidth.value * ZT.k"
  )
  g
    path(
      stroke-width="0"
      :fill="m.isHovered.value ? m.color.value + '30' : m.color.value + '20'"
      :d="`M${0},${top} L${m.scaledWidth.value},${top} L${m.scaledWidth.value},${bottom} L${0},${bottom} z`"
      )
    path(
      stroke-width="1"
      :stroke="m.color.value"
      :d="`M0,${top} V${bottom} M${m.scaledWidth.value},${top} V${bottom}`"
      )
    path(
      stroke-width="10"
      stroke="transparent"
      :d="`M0,${top} V${bottom} M${m.scaledWidth.value},${top} V${bottom}`"
      )
    path(
      class="stroke-transparent cursor-ew-resize"
      stroke-width="10"
      vector-effect="non-scaling-stroke"
      :d="`M${m.x1.value >= m.x2.value ? m.scaledWidth.value : 0},${top} V${bottom}`"
      v-drag="resizeHandleHandler.bind(null, m, 'x1')")
    path(
      stroke-width="1"
      stroke-alignment="inner"
      :stroke="m.isSelected.value ? m.color.value + 'ff' : 'transparent'"
      vector-effect="non-scaling-stroke"
      fill="none"
      :d="`M0,${top} H${m.scaledWidth.value} M0,${bottom} H${m.scaledWidth.value}`"
      )
    path(
      class="stroke-transparent cursor-ew-resize"
      stroke-width="10"
      vector-effect="non-scaling-stroke"
      :d="`M${m.x1.value < m.x2.value ? m.scaledWidth.value : 0},${top} V${bottom}`"
      v-drag="resizeHandleHandler.bind(null, m, 'x2')")
</template>
