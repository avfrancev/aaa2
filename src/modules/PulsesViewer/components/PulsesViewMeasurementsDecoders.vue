<script setup lang="ts">
import type { Pulses } from '../models/Pulses'
import type { Hint, HintsGroups } from '../workers/analyzer.worker'

const props = defineProps<{ pulses: Pulses }>()

// const pulsesStore = usePulsesStore()
const { view } = useViewStore()
const ZT = view.ZT
// const  = ref<HTMLCanvasElement | null>(null)
const isRootVisible = useElementVisibility(useCurrentElement())
// console.log();

const hintsGroups = computed(() => {
  const arr = [] as HintsGroups[]
  props.pulses.measurements.forEach((m) => {
    if (m.decoder.state.sliceGuess)
      arr.push(m.decoder.state.sliceGuess.hintsGroups)
  })
  return arr
})

const hintsBytesFiltered = computed(() => {
  return hintsGroups.value.flatMap((m) => {
    return m.flatMap((g) => {
      const bytes = []
      for (const h of g.bytes) {
        // const eh: (typeof h) & { bitsFiltered: Hint[] } = h
        const eh = {
          ...h,
          bitsFiltered: [] as Hint[],
        }
        if (!view.isRangeInView(h.scaledX1 + props.pulses.scaledXOffset.value, h.scaledX2 + props.pulses.scaledXOffset.value + h.scaledWidth))
          continue
        if ((Math.abs(+measureText(h.label)) + 8) / ZT.k > h.scaledWidth)
          break
        // console.log(h);
        // eh.bitsFiltered = []
        for (const bh of eh.bits) {
          if ((Math.abs(+measureText(bh.label)) + 8) / ZT.k > bh.scaledWidth)
            break
          eh.bitsFiltered.push(bh)
        }
        bytes.push(eh)
      }
      return bytes
    })
  })
})

const hintsBytesFilteredVisible = computed(() => hintsBytesFiltered.value.filter(b => b.bitsFiltered.length !== b.bits.length))
watchEffect(() => {
  // console.log("hintsBytesFilteredVisible", hintsBytesFilteredVisible.value);

})

const hintsBitsFiltered = computed(() => {
  return hintsBytesFiltered.value.flatMap((m) => {
    // return m.flatMap(g => g.flatMap(b => b.bitsFiltered )
    return m.bitsFiltered
      .filter((b) => {
        return view.isRangeInView(b.scaledX1 + props.pulses.scaledXOffset.value, b.scaledX2 + props.pulses.scaledXOffset.value + b.scaledWidth)
      // return false
      })
  })
})

// const hintsBitsFiltered2 = computed(() => {
//   return hintsBytesFiltered.value.flatMap(m => {
//     return m.flatMap(g => g.flatMap(b => b.bitsFiltered )
//     .filter((b) => {
//       return view.isRangeInView(b.scaledX1 + props.pulses.scaledXOffset.value, b.scaledX2 + props.pulses.scaledXOffset.value + b.scaledWidth)
//       // return false
//     })
//     )
//   })
// })

// watchEffect(() => {
//   console.log("hintsBitsFiltered", hintsBitsFiltered.value);
// })

const groupsRangePathes = computed(() => {
  const groups = hintsGroups.value.flatMap(m => m?.map(g => g))
  let s = ''
  for (const g of groups) {
    if (!g)
      continue
    s += `M${g.scaledX1},${0} V${100} M${g.scaledX2 || 0},${0} V${100}`
  }
  return s
})

const bitsRombPathes = computed(() => {
  let s = ''
  // return s
  hintsBitsFiltered.value.forEach((d) => {
    s += rombPath(d.scaledX1, d.scaledWidth, 20, 5 / ZT.k)
    // m.flatMap(d => d.bits).forEach((d) => {
    //   s += rombPath(d.scaledX1, d.scaledWidth, 20, 5 / ZT.k)
    // })
  })
  return s
})

const bytesRombPathes = computed(() => {
  let s = ''
  hintsBytesFiltered.value.forEach((d) => {
    // m.flatMap(d => d).forEach((d) => {
    s += rombPath(d.scaledX1, d.scaledWidth, 20, 5 / ZT.k)
    // })
  })
  return s
})

function rombPath(s: number = 0, w: number, h = 20, p = 5) {
  return `M${s},${h / 2}L${s + p},${h}H${s + w - p}L${s + w},${h / 2}L${s + w - p},${0}H${s + p}L${s},${h / 2}Z`
}
</script>

<template lang="pug">
div(class="h-[20px] w-full pointer-events-none select-none")
  svg(
    v-if="isRootVisible"
    class="h-[20px] w-full font-mono text-xs"
    :viewBox="`${props.pulses.viewBox.value.x} 0 ${props.pulses.viewBox.value.w} 20`"
    preserveAspectRatio="none"
    @click="() => console.log(hintsBitsFiltered)"
    )
    path.stroke-2.stroke-accent(:d="groupsRangePathes")
    path(:d="bytesRombPathes" class="stroke-1 stroke-secondary-content/70 fill-secondary/70")
    path(:d="bitsRombPathes" class="stroke-1 stroke-secondary-content/70 fill-secondary/70")

    text(
      y="15"
      :transform="`matrix(${1 / ZT.k},0,0,1,0,0)`"
      text-anchor="middle"
      )
      tspan.fill-secondary-content(
        v-for="d, i in hintsBytesFilteredVisible"
        :key="d.id + i"
        :x="(d.scaledX1 + d.scaledWidth / 2) * ZT.k"
        ) {{ d.label }}
    text(
      y="15"
      :transform="`matrix(${1 / ZT.k},0,0,1,0,0)`"
      text-anchor="middle"
      )
      tspan.fill-secondary-content(
        v-for="d, i in hintsBitsFiltered"
        :key="d.id + i"
        :x="(d.scaledX1 + d.scaledWidth / 2) * ZT.k"
        :text-length="20"
        ) {{ d.label }}
</template>
