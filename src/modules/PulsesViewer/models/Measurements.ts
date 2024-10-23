import type { Pulses } from "./Pulses"
import { getRandomNotUsedColor } from "~/stores/colors"
// import { EffectScope, ShallowReactive } from "vue"
// import { IAnalyzerWorkerArgs, IAnalyzerWorkerResult } from "../workers/analyzerWorker"
import { v4 } from "uuid"
import { Decoder } from "./MeasurementDecoders"
// import { Decoder } from "./MeasurementDecoders"
// import { PulsesStore } from "../store"

export type MeasurementStorage = ReturnType<Measurement["toJSON"]>

export class Measurement {
  id = v4()
  x1 = ref(0)
  x2 = ref(0)
  color = ref("#000000")
  isHovered = ref(false)
  isSelected = ref(false)
  rectRef = ref<Element | ComponentPublicInstance | null>()
  metaRef = ref<Element | ComponentPublicInstance | null>()
  decoder = <Decoder>{}
  constructor(
    public pulses: Pulses,
    x1: number,
    x2: number,
    color = getRandomNotUsedColor(),
  ) {
    this.x1.value = x1
    this.x2.value = x2
    this.color.value = color
    this.decoder = new Decoder(this)
    // this.decoder = {}
  }

  get xScale() { return this.pulses.pulsesStore.xScale.value }

  minX = computed(() => Math.min(toValue(this.x1), toValue(this.x2)))
  maxX = computed(() => Math.max(toValue(this.x1), toValue(this.x2)))
  scaledX1 = computed(() => this.xScale(toValue(this.x1)) || 0)
  scaledX2 = computed(() => this.xScale(toValue(this.x2)) || 0)
  scaledMaxX = computed(() => this.xScale(this.maxX.value) || 0)
  scaledMinX = computed(() => this.xScale(this.minX.value) || 0)
  scaledWidth = computed(() => this.scaledMaxX.value - this.scaledMinX.value)
  rangeIds = computed<[number, number]>(() => [
    this.pulses.timeBisector?.left(this.pulses.data.value, this.minX.value),
    this.pulses.timeBisector?.center(this.pulses.data.value, this.maxX.value),
  ])

  firstPulse = computed(() => this.pulses.data.value[this.rangeIds.value[0]])
  lastPulse = computed(() => this.pulses.data.value[this.rangeIds.value[1]])
  p2pWidth = computed(() => this.lastPulse.value?.scaledTime - this.firstPulse.value?.scaledTime)

  remove() {
    this.decoder.remove()
    this.pulses.measurements.delete(this)
  }

  changeColor() {
    this.color.value = getRandomNotUsedColor()
  }

  locateMetaRef() {
    if (this.metaRef.value !== null && this.metaRef.value !== undefined) {
      if (this.metaRef.value instanceof Element) {
        setTimeout(() => (this.metaRef.value as Element)?.scrollIntoView({ block: "center" }), 300)
      }
    }
  }

  locateRectRef() {
    const w = this.scaledMaxX.value - this.scaledMinX.value
    const zoomIdentity = new ZoomTransform(1, 0, 0)
    const view = this.pulses.view
    const fullWidth = view.elBounds.width.value
    const z = zoomIdentity.scale((fullWidth / w) * 0.9)
    let newX = -((this.scaledMinX.value - (w * 0.1) / 2) * z.k)
    newX -= this.pulses.pulsesStore.xScale.value(this.pulses.xOffset.value + this.pulses.pulsesStore.minX.value) * z.k
    view.animateTo({ k: z.k, x: newX })
    
    if (this.rectRef.value !== null && this.rectRef.value !== undefined) {
      if (this.rectRef.value instanceof Element) {
        const el = this.rectRef.value as Element
        window.requestAnimationFrame(() => el.scrollIntoView({ block: "center" }))
        // el?.scrollIntoView({ block: "center" })
        // setTimeout(() => el?.scrollIntoView({ block: "center" }), 300)
      }
    }
  }

  toJSON() {
    return {
      x1: toValue(this.x1),
      x2: toValue(this.x2),
      color: toValue(this.color),
    }
  }
}
