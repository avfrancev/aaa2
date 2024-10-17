<template lang="pug">
div.relative(
  v-hover="(s: any) => { pulses.isHovered.value = s.hovering }"
  )
  //- pre {{ 20/view.ZT.k }}
  //- pre {{ pulses.isHovered }}
  button.btn.btn-sm(class="hover:btn-error" @click="pulsesStore.remove(props.pulses)") X
  button.btn.btn-sm(class="hover:btn-error" @click="pulsesStore.removeAll()") remove all
  //- pre {{ props.pulses.viewBox }}
  svg.w-full(
    class="h-[100px]"
    v-drag="onItemDrag"
    :viewBox="`${props.pulses.viewBox.value.x} 0 ${props.pulses.viewBox.value.w} 100`"
    preserveAspectRatio="none"
    )
    //- :viewBox="`${viewStore.view.viewportLeft.value - pulses.scaledXOffset.value} 0 ${viewStore.view.viewportWidth.value} 100`"
    path.fill-none(
      class="stroke-base-content/60"
      :d="linePath"
      stroke-width="1"
      vector-effect="non-scaling-stroke"
      )
    PulsesViewMeasurementsRects(v-bind="{ pulses }")
    PulsesViewWidthMeasure( v-bind="{ pulses }")
    //- path(d="M0,0 L10,0 L10,10 L0,10 z")
  PulsesViewMeasurementsDecoders(v-bind="{ pulses: props.pulses }")
</template>

<script setup lang="ts">
// import { sessions, addSession, removeSession, currentSession } from "../stores/sessions.store"
import { line, curveStepAfter, curveMonotoneX, curveStepBefore } from "d3-shape"

const props = defineProps<{ pulses: Pulses }>()



// import { getCurrentViewStore} from '../stores/view.store';
// const viewStore = getCurrentViewStore()

const { view } = useViewStore()
const { ZT } = view

import type { Pulses, PulsesItem } from "../models/Pulses";
import type { Measurement } from "../models/Measurements";
const pulsesStore = usePulsesStore()


const genLine = line(
  (d: PulsesItem) => d.scaledTime,
  (d: PulsesItem) => (d.level ? 20 : 80),
)
  .curve(curveStepAfter)
// .curve(curveStepBefore)
const linePath = computed<string>(() => {
  return genLine(props.pulses?.data.value) as string
})


let tmpMeasurement: Measurement | null = null

function onItemDrag(s: any) {
  if (s.altKey) {
    s.event.stopImmediatePropagation()
    props.pulses.xOffset.value += (pulsesStore.pixelRatio.value * s.delta[0]) / ZT.k

  }
  else if (s.shiftKey) {
    s.event.stopImmediatePropagation()
    let dx = (pulsesStore.pixelRatio.value * s.delta[0]) / ZT.k
    let x = (s.event.clientX - view.elBounds.left.value)
    x = ZT.invertX(x)
    x -= props.pulses.scaledXOffset.value
    x = pulsesStore.xScale.value.invert(x)
    if (s.first) {
      // props.pulses.addMeasurement(x, x) ?????
      tmpMeasurement = props.pulses.addMeasurement(x, x)
    } else if (tmpMeasurement) {
      tmpMeasurement.x2.value += dx
    } else if (s.last) {
      tmpMeasurement = null
    }
  }
}

</script>
