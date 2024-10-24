import type { Measurement } from "../models/Measurements"
// import { currentSession } from "./sessions.store"
import type { PulsesStorage } from "../models/Pulses"
import { Pulses } from "../models/Pulses"
// import viewStore from "./view.store"
import { max, min } from "d3-array"

import { scaleLinear, type ScaleLinear } from "d3-scale"
import sample_data from "../store/sample_data.json"

export class PulsesStore {
  key = ref("")
  data = shallowReactive(new Set<Pulses>())
  storage: Ref<PulsesStorage[] | null>
  constructor(key: string) {
    this.key.value = key
    this.storage = useStorage(`pulsesStore-${key}`, <PulsesStorage[] | null>[])

    // setTimeout(() => this.loadFromStorage(), 1)

    watchDebounced(() => this.dataString.value, () => {
      this.saveToStorage()
    }, { debounce: 1000, maxWait: 1000 })
  }

  get view() { return useViewStore().view }
  width = computed<number>(() => toValue(this.view.elBounds.width))
  offsets = computed<number[]>(() => [...this.data].map<number>((d: Pulses) => d.xOffset.value) as number[])
  minOffset = computed<number>(() => min(this.offsets.value) || 0)
  minX = computed<number>(() => Math.min(0, this.minOffset.value))
  maxX = computed<number>(() => max(this.data, pulses => toValue(pulses.sum) + toValue(pulses.xOffset)) || 0)
  xScale = computed<ScaleLinear<number, number, never>>(() => scaleLinear([toValue(this.minX), toValue(this.maxX)], [0, toValue(this.width)]))
  pixelRatio = computed(() => (Math.abs(toValue(this.xScale).domain()[0]) + toValue(this.xScale).domain()[1]) / toValue(this.width))
  dataString = computed(() => JSON.stringify(Array.from(this.data)))

  add(ps: Partial<PulsesStorage> = {}) {
    const p = new Pulses(this, this.createDefaultPulsesStorage(ps))
    this.data.add(p)
    return p
  }

  createDefaultPulsesStorage(obj: unknown = {}): PulsesStorage {
    return Object.assign({
      raw_data: [],
      xOffset: 0,
      rssi: 0,
      measurements: [],
    }, obj)
  }

  updatePulses(oldPulses: Pulses, pulses: Partial<PulsesStorage>) {
    this.remove(oldPulses)
    this.add(pulses)
  }

  loadFromStorage() {
    try {
      const s = window.localStorage.getItem(`pulsesStore-${this.key.value}`)
      const parsed = s ? JSON.parse(s) : null
      if (parsed) {
        for (const p of parsed) this.add(p)
      }
    }
    catch (e) {
      console.error(e)
    }
  }

  saveToStorage() {
    try {
      window.localStorage.setItem(`pulsesStore-${this.key.value}`, this.dataString.value)
    }
    catch (e) {
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

  minPulseWidth = computed(() => this.getMinPulseWidth())
  getMinPulseWidth() {
    let min = Infinity
    for (const pulses of this.data) {
      min = Math.min(min, pulses.minPulseWidth.value)
    }
    return min
  }

  allMeasurements = computed(() => {
    const ms = new Set<Measurement>()
    for (const pulses of this.data) {
      for (const m of pulses.measurements) ms.add(m)
    }
    return ms
  })

  removeAllMeasurements() {
    for (const m of this.allMeasurements.value) {
      m.remove()
    }
  }
}

export const usePulsesStore = createGlobalState(() => {
  const { currentSession } = useSessionsStore()

  const pulsesStore = shallowReactive(new PulsesStore(currentSession.value))

  watchImmediate(() => currentSession.value, () => {
    const ps = new PulsesStore(currentSession.value)
    Object.assign(pulsesStore, ps)
    // Object.assign(pulsesStore, new PulsesStore(currentSession.value))
    pulsesStore.loadFromStorage()
  })

  return pulsesStore
})

export function copyToSession(s: string, pulses: PulsesStorage) {
  const { currentSession } = useSessionsStore()
  if (s === currentSession.value) {
    usePulsesStore().add(pulses)
    return
  }
  const ps = new PulsesStore(s)
  ps.loadFromStorage()
  ps.add(pulses)
  ps.saveToStorage()
}

export function loadSamplePulses() {
  const ps = usePulsesStore()
  for (const p of sample_data) {
    ps.add(p)
  }
}
