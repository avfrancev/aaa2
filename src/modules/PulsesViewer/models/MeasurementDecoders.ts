/* eslint no-console: ["error", { allow: ["log"] }] */

import type { IAnalyzerWorkerArgs, IAnalyzerWorkerResult } from '../workers/analyzer.worker'
import type { Measurement } from './Measurements'
import AnalyzerWorker from '../workers/analyzer.worker?sharedworker'

const analyzerWorker = new AnalyzerWorker()
analyzerWorker.port.start()
analyzerWorker.port.onmessageerror = (e) => {
  console.log('SHARED WORKER ERROR', e)
}
export class Decoder {
  state = shallowReactive({
    isLoading: false,
    analyzer: {},
    guessed: {},
    sliceGuess: null as (IAnalyzerWorkerResult['sliceGuess'] | null),
  } as IAnalyzerWorkerResult & { isLoading: boolean })

  constructor(m: Measurement) {
    const pulsesStore = m.pulses.pulsesStore
    const p = m.id

    analyzerWorker.port.addEventListener('message', (e: MessageEvent<any>) => {
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
      ], () => {
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
