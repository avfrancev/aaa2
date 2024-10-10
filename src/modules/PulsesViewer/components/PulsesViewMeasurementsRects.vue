<template lang="pug">
svg(
  class="measurement-rect focus:outline-none pointer-events-auto overflow-visible"
  :ref="el => { if (el) m.rectRef.value = el }"
  v-for="m in props.pulses.measurements"
  v-hover="(s: any) => { m.isHovered.value = s.hovering }"
  @focus="() => (m.isSelected.value = true)"
  @blur="() => (m.isSelected.value = false)"
  @click.prevent="(e) => { e.preventDefault(); view.gesturesState.value.drag.distance == 0 && e.currentTarget?.focus() }"
  @mousedown.prevent="(e) => { e.preventDefault() }"
  v-drag="dragHandler(m)"
  tabindex="0"
  @keydown.esc="(e) => { e.currentTarget?.blur() }"
  @keydown.left="(e) => { let d = (pulsesStore.pixelRatio.value * 10) / ZT.k; m.x1.value -= d; m.x2.value -= d }"
  @keydown.right="(e) => { let d = (pulsesStore.pixelRatio.value * 10) / ZT.k; m.x1.value += d; m.x2.value += d }"
  @keydown.delete.d="(e) => { m.remove() }"
  @keydown.space.prevent="(e) => { m.locate() }"
  preserveAspectRatio="none"
  :x="m.scaledMinX.value"
  :width="m.scaledWidth.value*ZT.k"
  )
  //- symbol#arrL.overflow-visible( viewBox="0 0 10 10" preserveAspectRatio="none")
  //-   path(d="M10,0 L0,5 L10,10" fill="blue" :transform="`matrix(${1 / ZT.k},0,0,1,${0},0)`" )
  //- symbol#arrR.overflow-visible( viewBox="0 0 10 10" preserveAspectRatio="none")
  //-   use(href="#arrL" x="0" y="0" transform="scale(-1,1)" )
  //- symbol#lll2.overflow-visible( viewBox="0 0 1 1" preserveAspectRatio="none")
  //-   path.fill-current(
  //-     vector-effect="non-scaling-stroke"
  //-     :d="`M${1/ZT.k},0 L${1-1/ZT.k},0 L${1-1/ZT.k},1 z`"
  //-   )
  //- symbol#lll3.overflow-visible( :viewBox="`0 0 ${100} 100`" preserveAspectRatio="none")
  //-   //- symbol#lll3.overflow-visible()
  //-   path(
  //-     opacity="0.5"
  //-     stroke="red"
  //-     :d="`M${(pulsesStore.pixelRatio.value / 100) / ZT.k},0 L100,0 L100,100 L0,100 z`"
  //-   )
      //- :d="`M${1/ZT.k},0 L${1-1/ZT.k},0 M${1/ZT.k},1 L${1-1/ZT.k},1`"
      //- :d="`M${1/ZT.k},0 L${1-1/ZT.k},0 L1,0.5 L${1-1/ZT.k},1 L${1/ZT.k},1 L0,0.5 L${1/ZT.k},0`"

  //- template(v-for="i in 2")
    use(href="#arrL" :x="(i-1)*10" y="15" height="25" width="8"  stroke="red")
    use(href="#arrR" :x="(i-1)*10+10" y="15" height="25" width="8" stroke="red" )
    use(href="#lll2" :x="(i-1)*10" y="15" height="25" width="10" stroke="red" fill="green")

  //- svg(:viewBox="`0 0 ${100*ZT.k} 100`" preserveAspectRatio="none" )
    symbol#lll3.overflow-visible()
      path(
        opacity="0.5"
        stroke="red"
        :d="`M${(10/ZT.k)},0 L100,0 L100,100 L0,100 z`"
      )
  //- g(:width="100*ZT.k")
  //- use(href="#lll3" :x="0" y="5" height="25" :width="100*ZT.k" stroke="red" fill="green")
  //- use(href="#lll3" :x="0" y="35" height="25" :width="100" stroke="red" fill="green" transform="scale(3,1)" )

    //- use(href="#lll2" :x="i*20" :y="15" height="25" :width="20" viewBox="0 0 11 11" )
  //- line(
    stroke-width="1"
    stoke="green"
    x1="10" x2="100"
    y1="0" y2="100"
    )
  //- g(
    :transform="`matrix(${1 / ZT.k},0,0,1,${0},0)`"
    )
    text.fill-red-700(
      y="20" text-anchor="middle") {{ 8* pulsesStore.pixelRatio.value / ZT.k  }}
      //- v-for="i in 10"
      //- :x="`${i*10}%`"
      //- :x="i * 10 * ZT.k"
  //- path(
    stroke-width="1"
    stroke="red"
    :d="`M10,15 L0,0`"
    )
  //- path.ASDASD(:d="spXXX" fill='yellow' stroke="black")
  //- text(
    :transform="`matrix(${1 / ZT.k},0,0,1,${0},0)`"
    text-anchor="middle"
    )
    tspan(
      v-for="l in filteredLabels"
      :key="l[0]"
      :x="(l[1] + l[2]/2) * ZT.k"
      y="20"
    ) {{ l[1].toFixed(0) }}
  g
    path(
      stroke-width="0"
      :fill="m.isHovered.value ? m.color.value + '20' : m.color.value + '10'"
      :d="`M${0},0 L${m.scaledWidth.value},0 L${m.scaledWidth.value},80 L${0},80 z`"
      )
    path(
      stroke-width="1"
      :stroke-dasharray="`7 5.5`"
      :stroke="m.isSelected.value ? m.color.value + 'ff' : 'transparent'"
      vector-effect="non-scaling-stroke"
      fill="transparent"
      :d="`M0,0 H${m.scaledWidth.value} M0,80 H${m.scaledWidth.value}`"
      )
    path(
      stroke-width="1"
      :stroke="m.color.value"
      :d="`M0,0 V80 M${m.scaledWidth.value},0 V80`"
      )
    path(
      stroke-width="10"
      stroke="transparent"
      :d="`M0,0 V80 M${m.scaledWidth.value},0 V80`"
      )
    path(
      class="stroke-transparent cursor-ew-resize"
      stroke-width="10"
      vector-effect="non-scaling-stroke"
      :d="`M${m.x1.value >= m.x2.value ? m.scaledWidth.value : 0},0 V${80}`"
      v-drag="resizeHandleHandler.bind(null, m, 'x1')")
    path(
      class="stroke-transparent cursor-ew-resize"
      stroke-width="10"
      vector-effect="non-scaling-stroke"
      :d="`M${m.x1.value < m.x2.value ? m.scaledWidth.value : 0},0 V${80}`"
      v-drag="resizeHandleHandler.bind(null, m, 'x2')")

</template>

<script setup lang="ts">
import { bisector, sum } from 'd3-array'

import type { Measurement } from '../models/Measurements';
import type { PulsesItem, Pulses } from "../models/Pulses"
import type { GestureState } from '@vueuse/gesture';

const props = defineProps<{ pulses: Pulses }>()

const pulsesStore = usePulsesStore()
const { view } = useViewStore()
const ZT = view.ZT


function dragHandler(m: Measurement) {
  return function (s: GestureState<'drag'>) {
    if (m.isSelected.value) {
      s.event?.stopImmediatePropagation()
      let dx = (pulsesStore.pixelRatio.value * s.delta[0]) / ZT.k
      m.x1.value += dx
      m.x2.value += dx
    }
  }
}

const bisectPulses = bisector((d: PulsesItem) => d.scaledTime).center

const resizeHandleHandler = (m: Measurement, key: 'x1' | 'x2', s: any) => {
  s.event.stopImmediatePropagation()
  let x = (s.event.clientX - view.elBounds.left.value)
  x = ZT.invertX(x)
  x -= props.pulses.scaledXOffset.value
  let id = bisectPulses(props.pulses.data.value, x)
  let { time, scaledTime } = props.pulses.data.value[id]
  let cond = Math.abs(scaledTime - x) * ZT.k < 7
  m[key].value = (cond && s.altKey) ? time : pulsesStore.xScale.value.invert(x)
}



</script>
