<script lang="ts" setup>
const pulsesStore = usePulsesStore()
const { view } = useViewStore()
const { ZT, elBounds: { width, height } } = view

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
