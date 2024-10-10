import { ShallowReactive } from "vue"
// import { currentSession } from "./sessions.store"
import { Pulses, PulsesStorage } from "../models/Pulses"
// import viewStore from "./view.store"
import { max, min } from "d3-array"
import { scaleLinear, type ScaleLinear } from "d3-scale"



export class PulsesStore {
  key = ref("")
  data = shallowReactive(new Set<Pulses>())
  storage: Ref<PulsesStorage[] | null>
  constructor(key: string) {
    this.key.value = key
    this.storage = useStorage(`pulsesStore-${key}`, <PulsesStorage[] | null>[])
    this.loadFromStorage()
  }
  get view() { return useViewStore().view }
  width = computed<number>(() => toValue(this.view.elBounds.width))
  offsets = computed<number[]>(() => [...this.data].map<number>((d: Pulses) => d.xOffset.value) as number[])
  minOffset = computed<number>(() => min(this.offsets.value) || 0)
  // // projectedCursorX: (state) => asd.xScale.invert(this.view.cursorX.value)
  minX = computed<number>(() => Math.min(0, this.minOffset.value))
  maxX = computed<number>(() => max(this.data, (pulses) => toValue(pulses.sum) + toValue(pulses.xOffset)) || 0)
  xScale = computed<ScaleLinear<number, number, never>>(() => scaleLinear([toValue(this.minX), toValue(this.maxX)], [0, toValue(this.width)]))
  pixelRatio = computed(() => (Math.abs(toValue(this.xScale).domain()[0]) + toValue(this.xScale).domain()[1]) / toValue(this.width))

  add(obj: PulsesStorage) {
    const p = new Pulses(this, obj)
    this.data.add(p)
    return p
  }
  loadFromStorage() {
    this.storage.value?.forEach(d => {
      this.add(d)
    })
  }
  saveToStorage() {
    // console.log("SAVE",Array.from(this.data));
    this.storage.value = Array.from(this.data as unknown as PulsesStorage[])
  }
  clearStorage() {
    this.storage.value = null
  }
  remove(p: Pulses) {
    p.remove()
    this.data.delete(p)
  }
  removeAll() {
    this.data.clear()
    this.saveToStorage()
  }
}

export const usePulsesStore = createGlobalState(() => {
  const { currentSession } = useSessionsStore()

  const pulsesStore = shallowReactive(new PulsesStore(currentSession.value.id))

  watch(() => currentSession.value.id, () => {
    Object.assign(pulsesStore, new PulsesStore(currentSession.value.id))
  })

  return pulsesStore
})



///////////

interface PulsesGetters {
  width: ComputedRef<number>
  offsets: ComputedRef<number[]>
  maxX: ComputedRef<number>
  minX: ComputedRef<number>
  minOffset: ComputedRef<number>
  xScale: ComputedRef<ScaleLinear<number, number, never>>
  pixelRatio: ComputedRef<number>
}


export const createPulsesStore = (key: string ) => {
  console.log("pulsesStoreFactory", key);
  const data = shallowReactive(new Set<ShallowReactive<Pulses>>())

  // let storage = ref()
  let storage = useStorage(`pulses-${key}`, <PulsesStorage[] | null>[])
  // const state = {}
  
  // const viewStore = useViewStore()
  // const view = getCurrentViewStore().view
  // console.log("view in store", view);
  // tryOnMounted(() => {
  //   nextTick(() => {
  //     actions.loadFromStorage()
  //   })
  // }, false)
  

  const getters: PulsesGetters = {
    width: computed<number>(() => toValue(state.view?.elBounds?.width)),
    offsets: computed<number[]>(() => [...data].map<number>((d: Pulses) => d.xOffset) as number[]),
    minOffset: computed<number>(() => min(getters.offsets.value) || 0),
    // projectedCursorX: (state) => asd.xScale.invert(this.view.cursorX.value)
    minX: computed<number>(() => Math.min(0, getters.minOffset.value)),
    maxX: computed<number>(() => max(data, (d) => d.sum.value + d.xOffset) || 0),
    xScale: computed<ScaleLinear<number, number, never>>(() => scaleLinear([toValue(getters.minX), toValue(getters.maxX)], [0, toValue(getters.width)])),
    pixelRatio: computed(() => (Math.abs(getters.xScale.value.domain()[0]) + getters.xScale.value.domain()[1]) / getters.width.value)
  }

  const actions = {
    add(pulses: PulsesStorage) {
      // return data.add(pulses)
      const p = createPulses(pulses as Pulses, {data, ...actions, ...getters})
      console.log("ADD");
      data.add(p)
      actions.saveToStorage()
      return p
    },
    remove(pulses: Pulses) {
      console.log("REMOVE", pulses);
      // data.delete(pulses)
      pulses.remove()
      actions.saveToStorage()
    },
    removeAll() {
      data.forEach((d) => d.remove())
    },
    loadFromStorage() {
      storage.value?.forEach(d => {
        let p = createPulses(d, {data, ...actions, ...getters})
        data.add(p)
      })
    },
    saveToStorage() {
      let a = Array.from(data).map((d) => {
        return { 
          ...pick(d, ["id", "rssi", "xOffset", "measurements", "raw_data"]),          
          measurements: Array.from(d.measurements).map(m => pick(m, ["x1", "x2", "color"]))
        }
      })
      storage.value = a as unknown as PulsesStorage[]
    },
  }

  tryOnMounted(() => {
    actions.loadFromStorage()
  })
  // actions.loadFromStorage()

  return { data, ...actions, ...getters }
}


