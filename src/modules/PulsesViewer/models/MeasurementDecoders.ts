/* eslint no-console: ["error", { allow: ["log"] }] */

import type { IAnalyzerWorkerArgs, IAnalyzerWorkerResult } from "../workers/analyzer.worker"
import type { Measurement } from "./Measurements"
import AnalyzerWorker from "../workers/analyzer.worker?sharedworker"

const analyzerWorker = new AnalyzerWorker()
analyzerWorker.port.start()
analyzerWorker.port.onmessageerror = (e) => {
  console.log("SHARED WORKER ERROR", e)
}

// export const slicers = ["PCM", "PWM", "PPM", "MC", "DM", "NRZI", "CMI", "PIWM"]

export class Decoder {
  static slicers = ["PCM", "PWM", "PPM", "MC", "DM", "NRZI", "CMI", "PIWM"]
  state = shallowReactive({
    isLoading: false,
    pickedSlicer: null,
    analyzer: {},
    guessed: {},
    sliceGuess: {},
  } as IAnalyzerWorkerResult & { isLoading: boolean, pickedSlicer: string | null })

  measurementID: string

  constructor(m: Measurement) {
    const pulsesStore = m.pulses.pulsesStore
    this.measurementID = m.id

    analyzerWorker.port.addEventListener("message", this.workerListener.bind(this))

    const rangeIdsString = computed(() => m.rangeIds.value.toString())

    watch(() =>
      [
        rangeIdsString.value,
        m.pulses.raw_data,
        m.xScale.domain().toString(),
        this.state.pickedSlicer,
      ], () => {
      const args = {
        measurementID: this.measurementID,
        pulses: toRaw(m.pulses.raw_data),
        scale: {
          domain: pulsesStore.xScale.value.domain() as [number, number],
          range: pulsesStore.xScale.value.range() as [number, number],
        },
        rangeIds: m.rangeIds.value,
        pickedSlicer: this.state.pickedSlicer,
        firstPulse: m.firstPulse.value,
        lastPulse: m.lastPulse.value,
      } as IAnalyzerWorkerArgs
      analyzerWorker.port.postMessage(args)
    }, {
      immediate: true,
    })
  }

  workerListener(e: MessageEvent) {
    const data: IAnalyzerWorkerResult = e.data
    if (data.measurementID === this.measurementID) {
      this.state.analyzer = data.analyzer
      this.state.guessed = data.guessed
      this.state.sliceGuess = data.sliceGuess
    }
  }

  remove() {
    analyzerWorker.port.removeEventListener("message", this.workerListener)
  }
}
