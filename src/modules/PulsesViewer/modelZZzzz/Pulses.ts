import { ShallowReactive } from "vue"
import { createMeasurement, Measurement, MeasurementStorage } from "./Measurements"
import { v4 as uuidv4 } from "uuid"
import { Bisector, bisector, sum } from "d3-array"
import { pick } from "~/utils"
// import { currentPulsesStore } from "../stores/pulses.store"

export type PulsesItem = {
  level: number
  time: number
  width: number
  scaledTime: number
  scaledWidth: number
}

export interface PulsesStorage {
  id: string;
  raw_data: number[];
  xOffset: number;
  rssi?: number;
  measurements: Set<Measurement>
}

interface PulsesGetters {
  sum: ComputedRef<number>
  data: ComputedRef<PulsesItem[]>
  scaledXOffset: ComputedRef<number>
  minPulseWidth: ComputedRef<number>
  maxPulseWidth: ComputedRef<number>
  timeBisector: Bisector<PulsesItem, number>
  viewBox: ComputedRef<{ x: number, w: number }>
  // pulsesInViewportRangeIDs: ComputedRef<[number, number]>
}
interface PulsesActions {
  remove: () => void
  addMeasurement: (x1: number, x2: number, color?: string) => Measurement
  saveToStorage: () => void
}

export interface Pulses extends PulsesStorage, PulsesGetters, PulsesActions {
  isHovered: boolean
}

// import viewStore from "../stores/view.store"


export function createPulses(pulses: PulsesStorage, pulsesStore: ReturnType<typeof createPulsesStore>): ShallowReactive<Pulses> {
  const tmpMeasurements = Array.from(pulses.measurements)
  const measurementsStorage = useStorage(`measurements-${pulses.id}`, <MeasurementStorage[] | null>[])
  // const pulsesStore = getCurrentPulsesStore()
  // const pulsesStore = usePulsesStore()
  // console.log('getPS()',getPS());

  // console.log(pulsesStore);
  
  const globalState = useState()
  // console.log(globalState.pulsesStore.value?.xScale.value);
  // const pulsesStore = globalState.pulsesStore.value
  const view = globalState.view


  const state = shallowReactive<Pulses>({
    ...pulses as Pulses,
    id: pulses.id || uuidv4(),
    measurements: shallowReactive(new Set<Measurement>()),
    isHovered: false,
  })


  const getters: PulsesGetters = {
    // xScale: computed(() => state.raw_data.length + state.xOffset),
    timeBisector: bisector((d) => d.time),
    sum: computed(() => sum(state.raw_data)),
    scaledXOffset: computed(() => pulsesStore.xScale.value(state.xOffset + pulsesStore?.minX.value)),
    minPulseWidth: computed(() => Math.min(...state.raw_data)),
    maxPulseWidth: computed(() => Math.max(...state.raw_data),),
    data: computed(() => {
      let startLevel = 0
      if (state.raw_data[state.raw_data.length - 1] !== 0) state.raw_data.push(0)
      let time = 0
      return state.raw_data.map((d, i) => {
        if (i !== 0) time += state.raw_data[i - 1]
        return { level: (i + startLevel) % 2, width: d, time, scaledTime: pulsesStore?.xScale.value(time) || 0, scaledWidth: pulsesStore?.xScale.value(d) || 0 }
      })
    }),
    viewBox: computed<{ x: number, w: number }>(() => {
      // let xOffset = computed(() => pulsesStore.active.xScale(state.xOffset + pulsesStore.active.minX))
      const ZT = view.ZT
      const x = -ZT.x / ZT.k - getters.scaledXOffset.value
      const w = view.elBounds.width.value / ZT.k
      return { x, w }
    })
    // pulsesInViewportRangeIDs: computed(() => {
    //   const b = bisector((d: PulsesItem) => d.scaledTime)
    //   const f = b.left(state.data.value, pulsesStore.active.view.value.viewportLeft.value - state.scaledXOffset.value)
    //   return [f,1]
    // })
  }


  const actions: PulsesActions = {
    addMeasurement: (x1: number, x2: number, color?: string) => {
      const m = createMeasurement(x1, x2, state, color)
      state.measurements.add(m)
      return m
    },
    remove() {
      console.log("remove pulses from Pulses.ts",);
      state.measurements.forEach((m) => m.remove())
      pulsesStore.data.delete(state)
    },
    saveToStorage() {
      measurementsStorage.value = Array.from(pulses.measurements).map((m) => {
        return pick(m, ["x1", "x2", "color"])
      })
    }
  }

  tmpMeasurements.forEach((m) => actions.addMeasurement(m.x1, m.x2, m.color))

  Object.assign(state, getters, actions)

  return state
}
