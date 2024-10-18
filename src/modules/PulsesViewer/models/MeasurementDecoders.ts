import { Pulses } from "./Pulses"
import { EffectScope } from "vue"
import AnalyzerWorker from "../workers/analyzer.worker?sharedworker"
import { IAnalyzerWorkerArgs, IAnalyzerWorkerResult } from "../workers/analyzer.worker"
import { Measurement } from "./Measurements"
import { PulsesStore } from "../store/pulses.store"
import { v4 } from "uuid"

const analyzerWorker = new AnalyzerWorker()
analyzerWorker.port.start()
analyzerWorker.port.onmessageerror = (e) => {
  console.log("SHARED WORKER ERROR", e);
}


export class Decoder {
  state = shallowReactive({
    isLoading: false,
    analyzer: {} as IAnalyzerWorkerResult['analyzer'],
    guessed: {} as IAnalyzerWorkerResult['guessed'],
    sliceGuess: null as (IAnalyzerWorkerResult['sliceGuess'] | null)
  })

  constructor(m: Measurement) {
    const pulsesStore = m.pulses.pulsesStore
    let p = m.id

    analyzerWorker.port.addEventListener("message", (e: MessageEvent<any>) => {
      const data: IAnalyzerWorkerResult = e.data

      if (data.measurementID === p) {
        // console.log(data.sliceGuess);
        this.state.analyzer = data.analyzer
        this.state.guessed = data.guessed
        this.state.sliceGuess = data.sliceGuess
      }
    }, false)

    const rangeIdsString = computed(() => m.rangeIds.value.toString())

    // const { view } = usePulsesStore()

    watch(() =>
      [
        rangeIdsString.value,
        m.xScale.domain().toString(),
      ],
      () => {
        // const pulses = toRaw(m.pulses.raw_data)
        // nextTick(() => {
        // })
        
        const args = {
          measurementID: p,
          pulses: toRaw(m.pulses.raw_data),
          scale: {
            domain: pulsesStore.xScale.value.domain() as [number, number],
            range: pulsesStore.xScale.value.range() as [number, number],
          },
          rangeIds: m.rangeIds.value,
          pickedSlicer: null,
          firstPulse: m.firstPulse.value,
          lastPulse: m.lastPulse.value,
        } as IAnalyzerWorkerArgs
        analyzerWorker.port.postMessage(args)
      }, {
      immediate: true,
    })
  }

}

