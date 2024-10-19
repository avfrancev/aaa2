<script lang="ts" setup>
import type { Pulses } from '../models/Pulses'

const { pulses, top = 15, bottom = 100 - 15 } = defineProps<{ pulses: Pulses, top?: number, bottom?: number }>()
const pulsesStore = usePulsesStore()
const { view } = useViewStore()

const pulseIDUnderCursor = computed(() => {
  return pulses.timeBisector.left(pulses.data.value, pulsesStore.xScale.value.invert(view.mouseX.value) - pulses.xOffset.value) - 1
})

const pulsesUnderCursor = computed(() => {
  return pulses.data.value.slice(pulseIDUnderCursor.value, pulseIDUnderCursor.value + 2)
})

function viewPortConstraints(x: number, text: string, padding = 10) {
  const viewportLeft = (view.viewportLeft.value - pulses.scaledXOffset.value)
  const viewportRight = (view.viewportRight.value - pulses.scaledXOffset.value)
  // const halfWidth = (text1Bounds.width.value / 2) / view.ZT.k
  const halfWidth = (measureText(`${text}`) / 2) / view.ZT.k
  padding /= view.ZT.k
  if (x < viewportLeft + halfWidth + padding)
    x = viewportLeft + halfWidth + padding
  else if (x > viewportRight - halfWidth - padding)
    x = viewportRight - halfWidth - padding
  return x
}

const metaData = computed(() => {
  const p = pulsesUnderCursor.value

  const label1 = p[0]?.width.toFixed(0) || ''
  const l1 = {
    x1: p[0]?.scaledTime || 0,
    x2: (p[0]?.scaledTime + p[0]?.scaledWidth) || 0,
    w: p[0]?.scaledWidth || 0,
    label: label1,
    labelPos: viewPortConstraints(p[0]?.scaledTime + p[0]?.scaledWidth / 2, label1),
  }

  const label2 = (p[0]?.width + p[1]?.width).toFixed(0) || ''
  const l2 = p.length === 1
    ? null
    : {
        x1: p[0]?.scaledTime || 0,
        x2: (p[1]?.scaledTime + p[1]?.scaledWidth) || 0,
        w: (p[0]?.scaledWidth + p[1]?.scaledWidth) || 0,
        label: label2,
        labelPos: viewPortConstraints(p[0]?.scaledTime + (p[0]?.scaledWidth + p[1]?.scaledWidth) / 2, label2),
      }
  return { l1, l2 }
})
</script>

<template lang="pug">
g(v-if="pulses.isHovered.value && (metaData.l1.w > 10 / view.ZT.k) && (metaData.l2 && metaData.l2.w > 10 / view.ZT.k)" class="pointer-events-none select-none")
  path.stroke-1.stroke-base-content(:d="`M${metaData.l1.x1},${top} H${metaData.l1.x2}`")
  path.stroke-1.stroke-base-content(
    v-if="metaData.l2"
    :d="`M${metaData.l2.x1},${bottom} H${metaData.l2.x2}`")
  path.fill-base-content(
    v-if="metaData.l1.label"
    :d="`M${metaData.l1.x1},${top} l${4 / view.ZT.k},-3 l0,6 z`")
  path.fill-base-content(
    v-if="metaData.l1.label"
    :d="`M${metaData.l1.x2},${top} l${-4 / view.ZT.k},-3 l0,6 z`")
  path.fill-base-content(
    v-if="metaData.l2 && metaData.l2.label"
    :d="`M${metaData.l2.x1},${bottom} l${4 / view.ZT.k},-3 l0,6 z`")
  path.fill-base-content(
    v-if="metaData.l2 && metaData.l2.label"
    :d="`M${metaData.l2.x2},${bottom} l${-4 / view.ZT.k},-3 l0,6 z`")
  text(
    :transform="`matrix(${1 / view.ZT.k},0,0,1,0,0)`"
    class="fill-base-content text-xs"
    text-anchor="middle"
    )
    tspan(
      :x="metaData.l1.labelPos * view.ZT.k"
      :y="top - 2"
      ) {{ metaData.l1.label }}
    tspan(
      v-if="metaData.l2"
      :x="metaData.l2.labelPos * view.ZT.k"
      :y="bottom + 2"
      dominant-baseline="hanging"
      ) {{ metaData.l2.label }}
</template>
