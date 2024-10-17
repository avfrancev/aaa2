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
    
    setTimeout(() => this.loadFromStorage(), 10)

    watchDebounced(() => this.dataString.value, () => {
      this.saveToStorage()
    }, { debounce: 1000, maxWait: 1000 })
    
  }
  get view() { return useViewStore().view }
  width = computed<number>(() => toValue(this.view.elBounds.width))
  offsets = computed<number[]>(() => [...this.data].map<number>((d: Pulses) => d.xOffset.value) as number[])
  minOffset = computed<number>(() => min(this.offsets.value) || 0)
  minX = computed<number>(() => Math.min(0, this.minOffset.value))
  maxX = computed<number>(() => max(this.data, (pulses) => toValue(pulses.sum) + toValue(pulses.xOffset)) || 0)
  xScale = computed<ScaleLinear<number, number, never>>(() => scaleLinear([toValue(this.minX), toValue(this.maxX)], [0, toValue(this.width)]))
  pixelRatio = computed(() => (Math.abs(toValue(this.xScale).domain()[0]) + toValue(this.xScale).domain()[1]) / toValue(this.width))
  dataString = computed(() => JSON.stringify(Array.from(this.data)))

  add(obj: PulsesStorage) {
    const p = new Pulses(this, obj)
    this.data.add(p)
    return p
  }
  loadFromStorage() {
    try {
      const s = window.localStorage.getItem(`pulsesStore-${this.key.value}`)
      const parsed = s ? JSON.parse(s) : null
      if (parsed) {
        parsed.forEach((p: PulsesStorage) => this.add(p))
      }
    } catch (e) {
      console.error(e)
    }
  }
  saveToStorage() {
    try {
      window.localStorage.setItem(`pulsesStore-${this.key.value}`, this.dataString.value)
    } catch (e) {
      console.error(e)
    }
  }
  clearStorage() {
    window.localStorage.removeItem(`pulsesStore-${this.key.value}`)
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

  const pulsesStore = shallowReactive(new PulsesStore(currentSession.value))

  watch(() => currentSession.value, () => {
    Object.assign(pulsesStore, new PulsesStore(currentSession.value))
  })

  return pulsesStore
})

