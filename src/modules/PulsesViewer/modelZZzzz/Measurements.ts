import { getRandomNotUsedColor } from "~/stores/colors"
import { Pulses, PulsesItem } from "./Pulses"
import { EffectScope, ShallowReactive } from "vue"
import { IAnalyzerWorkerArgs, IAnalyzerWorkerResult } from "../workers/analyzerWorker"
import { v4 } from "uuid"
import { Decoder } from "./MeasurementDecoders"



export interface MeasurementStorage {
  id?: string
  x1: number
  x2: number
  color: string
}
export interface MeasurementGetters {
  minX: ComputedRef<number>
  maxX: ComputedRef<number>
  scaledX1: ComputedRef<number>
  scaledX2: ComputedRef<number>
  scaledMaxX: ComputedRef<number>
  scaledMinX: ComputedRef<number>
  rangeIds: ComputedRef<[number, number]>
  scaledWidth: ComputedRef<number>
  firstPulse: ComputedRef<PulsesItem>
  lastPulse: ComputedRef<PulsesItem>
  p2pWidth: ComputedRef<number>
}
export interface MeasurementActions {
  remove: () => void
}

export interface Measurement extends MeasurementStorage, MeasurementGetters, MeasurementActions {
  isHovered: boolean
  isSelected: boolean
  rectRef: any
  decoder: Decoder
}

export function createMeasurement(x1: number, x2: number, pulses: Pulses, color: string = getRandomNotUsedColor()): ShallowReactive<Measurement> {

  // const pulsesStore = useState().pulsesStore.value
  const pulsesStore = getPulsesStore()

  const state = shallowReactive<Measurement>({
    id: v4(),
    x1, x2, color,
  } as Measurement)
  

  const getters: MeasurementGetters = {
    minX: computed(() => Math.min(state.x1, state.x2)),
    maxX: computed(() => Math.max(state.x1, state.x2)),
    scaledX1: computed(() => pulsesStore?.xScale.value(state.x1) || 0),
    scaledX2: computed(() => pulsesStore?.xScale.value(state.x2) || 0),
    scaledMaxX: computed(() => pulsesStore?.xScale.value(getters.maxX.value) || 0),
    scaledMinX: computed(() => pulsesStore?.xScale.value(getters.minX.value) || 0),
    scaledWidth: computed(() => getters.scaledMaxX.value - getters.scaledMinX.value),
    rangeIds: computed(() => [
      pulses.timeBisector?.right(pulses.data.value, getters.minX.value),
      pulses.timeBisector?.right(pulses.data.value, getters.maxX.value)]
    ),
    firstPulse: computed(() => pulses.data.value[getters.rangeIds.value[0]]),
    lastPulse: computed(() => pulses.data.value[getters.rangeIds.value[1]]),
    p2pWidth: computed(() => getters.lastPulse.value.scaledTime - getters.firstPulse.value.scaledTime),
    // rangeIdsViewport: ComputedRef<[number, number]>

  }
  const actions: MeasurementActions = {
    remove() {
      // console.log("remove ME i measurement", state.decoder?.stop);
      state.decoder?.scope?.stop()
      pulses.measurements.delete(state)
    }
  }

  Object.assign(state, getters, actions)
  state.decoder = createDecoder(state, pulses)

  // pulsesStore.$onAction((a) => {
  //   console.log("pulsesStore", a);
  //   // console.log(mutation?.events?.target);
  //   // console.log(mutation?.events?.target, state);
  // })



  // const out = Object.assign(state, getters, actions) as ShallowReactive<Measurement

  return state
  // return Object.assign(state, { ...getters, ...actions }) as Measurement

}


