<template lang="pug">
div
  //- p {{ measurementsFiltered.map(d => d.length) }}
  svg(
    class="h-[20px] w-full text-[10px] font-mono"
    :viewBox="`${props.pulses.viewBox.value.x} 0 ${props.pulses.viewBox.value.w} 20`"
    preserveAspectRatio="none"
    )
    path.stroke-1.stroke-warning-content.fill-accent(:d="rombPathes")
    text(
      v-for="m,i in measurementsFiltered"
      y="15"
      :transform="`matrix(${1 / ZT.k},0,0,1,0,0)`"
      :key="i"
      text-anchor="middle"
      )
      tspan.fill-warning-content(
        v-for="d in m"
        :key="d[0]"
        :x="(d[1] + d[2] / 2) * ZT.k"
        ) {{ d[3].toFixed(0) }}
  //- pre {{ measurementsFiltered[0][0] }}
  canvas(
    ref="canvasEl"
    :width="view.elBounds.width.value"
    :height="50"
    )
    //- class=" h-[50px] pointer-events-none"
</template>

<script setup lang="ts">
import { Decoder } from "../models/MeasurementDecoders";
import type { PulsesItem, Pulses } from "../models/Pulses"
import type { BitsHints, IBitsHintsGroup } from "../workers/analyzer.worker";

const props = defineProps<{ pulses: Pulses }>()

const pulsesStore = usePulsesStore()
const { view } = useViewStore()
const ZT = view.ZT
const canvasEl = ref<HTMLCanvasElement | null>(null)
const canvasIsVisible = useElementVisibility(canvasEl)

let ctx: CanvasRenderingContext2D

onMounted(() => {
  ctx = canvasEl.value?.getContext('2d') as CanvasRenderingContext2D
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 1

  console.log(getTextWidth("Hi there and greetings!"));
})

const canvas = document.createElement("canvas")
const context = canvas.getContext("2d") as CanvasRenderingContext2D
context.font = "10px monospace"

function getTextWidth(s = "") {
  return context.measureText(s).width;
}

const decodersHints = computed(() => {
  let arr = [] as IBitsHintsGroup[][]
  props.pulses.measurements.forEach(m => {
    // console.log(m.decoder.state.sliceGuess)
    if (m.decoder.state.sliceGuess) arr.push(m.decoder.state.sliceGuess.bytesHints)
  })
  return arr
})
const decodersHintsFiltered = computed(() => {
  return decodersHints.value.map(g => {
    
    return g.map(h => {
      console.log(h);
      const xarr = []
      for (let x of h) {
        if (!view.isRangeInView(x[3] + props.pulses.scaledXOffset.value, x[3] + props.pulses.scaledXOffset.value + x[4])) continue
        xarr.push(x)
      }
      return xarr
    })
      console.log({h,g});
      // if ((Math.abs(+getTextWidth(d[3].toFixed(0))) + 5) / ZT.k > d[2]) break
    // }
    // return xarr
  })
})
watchEffect(() => {
  console.log("decodersHints", decodersHintsFiltered.value);
})


function drawRombs(arr: [number, number, number, number][], arrSorted: [number, number, number, number][]) {
  // console.log(arr, arrSorted);

  ctx.save();
  let p = new Path2D()

  let s = ""
  const xarr = []
  for (let d of arrSorted) {
    // if (!view.isPiontInView(d[1])) continue
    if (!view.isRangeInView(d[1], d[1] + d[2])) continue
    if ((ctx.measureText(d[3].toFixed(0)).width + 5) / ZT.k > d[2]) break
    xarr.push(d)
    s += rombPath(d[1], d[2], 20, 5 / ZT.k)
  }

  p.addPath(new Path2D(s), { e: ZT.x, a: ZT.k, f: 1 })
  ctx.fillStyle = "yellow"
  ctx.fill(p)
  ctx.stroke(p)

  ctx.fillStyle = 'red'
  ctx.textAlign = 'center'

  for (let d of xarr) {
    ctx.fillText(d[3].toFixed(0), (d[1] + d[2] / 2) * ZT.k + ZT.x, 14)
  }

  // ctx.lineWidth = 1/ZT.k
  // ctx.setTransform(ZT.k, 0, 0, 1, ZT.x, 0)

  ctx.restore();
  ctx.stroke()

}

const measurementsHHH = computed(() =>
  [...props.pulses.measurements].map((m) => {
    // get pulses from measurement range
    let p = props.pulses.data.value.slice(m.rangeIds.value[0], m.rangeIds.value[1])
    let out = p.map<[number, number, number, number]>((p, i) => [i, p.scaledTime, p.scaledWidth, p.width])
    return out
  })
)

const measurementsHHHSorted = computed(() => {
  return measurementsHHH.value.map(d =>
    d.toSorted((a, b) => b[3] - a[3])
  )
})

const measurementsFiltered = computed(() => {
  return measurementsHHHSorted.value.map(m => {
    const xarr = []
    for (let d of m) {
      if (!view.isRangeInView(d[1] + props.pulses.scaledXOffset.value, d[1] + props.pulses.scaledXOffset.value + d[2])) continue
      if ((Math.abs(+getTextWidth(d[3].toFixed(0))) + 5) / ZT.k > d[2]) break
      xarr.push(d)
    }
    return xarr
  })
})

const rombPathes = computed(() => {
  let s = ""
  measurementsFiltered.value.forEach((m, i) => {
    m.forEach((d) => {
      s += rombPath(d[1], d[2], 20, 5 / ZT.k)
    })
  })
  return s
})


function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, view.elBounds.width.value, 30)
  if (!canvasIsVisible.value) return
  measurementsHHH.value.forEach((d, i) => {
    drawRombs(d, measurementsHHHSorted.value[i])
  })
}

watch(() => [ZT.x, ZT.k, canvasIsVisible.value], () => {
  // const o = props.pulses.measurements.map(m => {
  //   return 
  // })
  // window.requestAnimationFrame(draw)
})



function rombPath(s: number = 0, w: number, h = 20, p = 5) {
  return `M${s},${h / 2} L${s + p},${h} H${s + w - p} L${s + w},${h / 2} L${s + w - p},${0} H${s + p} L${s},${h / 2} Z`
}
// make function that takes array of numbers which represents width of each rombic element and returns svg path
function genRombsPathes(arr: number[][],
  valueof: Function | undefined = undefined,
  filter: Function | undefined = undefined,
  { h = 20, paddingWidth = 5 } = {}) {

  // let kp = paddingWidth / ZT.k
  let str = `M0,${h / 2} `
  for (let i = 0; i < arr.length; i++) {
    const p = valueof ? valueof(arr[i])[0] : arr[i][0]
    const w = valueof ? valueof(arr[i])[1] : arr[i][1]
    // const p1 = valueof ? valueof(arr[i + 1]) : arr[i + 1]
    if (filter && !filter(arr[i])) continue
    // if (p1 - p0 < kp * 2) continue
    str += rombPath(p, w, h, paddingWidth)
  }
  return str
}
// function genRombsPathes2(arr: [], valueof: Function | undefined = undefined) {
//   let kp = 5 / ZT.k
//   let str = `M0,${h / 2} `
//   for (let i = 0; i < arr.length - 1; i++) {
//     const p0 = valueof ? valueof(arr[i]) : arr[i]
//     const p1 = valueof ? valueof(arr[i + 1]) : arr[i + 1]
//     if (p1 - p0 < kp * 2) continue
//     str += rombPath(p0, p1 - p0, 20, kp)
//   }

//   return str
// }


const arr = Array.from({ length: Math.floor(Math.random() * 200) }, () => Math.random() * 10)
const arr2 = computed(() => arr.reduce((acc, cur, i) => [...acc, acc[i] + cur], [0]))

const labels = computed(() => {
  // const arr2 = arr.reduce((acc, cur, i) => [acc[i] + cur,i], [[0,0]])
  return arr2.value.map((x, i) => [i, x, arr[i]])
})

const filteredLabels = computed(() => {
  let kp = 5 / ZT.k

  // return labels.value.filter(x => view.isPiontInView(x[1]))
  // return labels.value
  return labels.value.filter(x => view.isPiontInView(x[1]) && x[2] > kp * 2)
})

// const spXXX = computed(() => {
//   return genRombsPathes(arr2.value)
// })



// watch(() => [ZT.x, ZT.k],() => {
//   window.requestAnimationFrame(draw)
// })

</script>
