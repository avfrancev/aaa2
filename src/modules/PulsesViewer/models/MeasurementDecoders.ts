import { Pulses } from "./Pulses"
import { EffectScope } from "vue"
import AnalyzerWorker from "../workers/analyzer.worker?sharedworker"
import { IAnalyzerWorkerArgs, IAnalyzerWorkerResult } from "../workers/analyzer.worker"
import { Measurement } from "./Measurements"
import { PulsesStore } from "../store/pulses.store"

const analyzerWorker = new AnalyzerWorker()
analyzerWorker.port.start()
analyzerWorker.port.onmessageerror = (e) => {
  console.log("SHARED WORKER ERROR", e);
}


// export interface Decoder extends IAnalyzerWorkerResult {
//   // worker: Worker
//   isLoading: boolean
//   scope: EffectScope
// }
export class Decoder {
  state = shallowReactive({
    isLoading: false,
    analyzer: {} as IAnalyzerWorkerResult['analyzer'],
    guessed: {} as IAnalyzerWorkerResult['guessed'],
    sliceGuess: null as (IAnalyzerWorkerResult['sliceGuess'] | null)
  })

  constructor(private m: Measurement) {
    const pulsesStore = m.pulses.pulsesStore
    let p = performance.now()

    analyzerWorker.port.addEventListener("message", (e: MessageEvent<any>) => {
      const data: IAnalyzerWorkerResult = e.data

      if (data.measurementID === p) {
        console.log(data.sliceGuess);
        this.state.analyzer = data.analyzer
        this.state.guessed = data.guessed
        this.state.sliceGuess = data.sliceGuess
      }
    }, false)

    const rangeIdsString = computed(() => m.rangeIds.value.toString())

    watch(() =>
      [
        rangeIdsString.value,
        pulsesStore.xScale.value,
      ],
      () => {
        // const pulses = toRaw(m.pulses.raw_data)
        p = performance.now()
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
        // m.firstPulse.value.
        // worker.postMessage(args)
        analyzerWorker.port.postMessage(args)
      }, {
      immediate: true
    })
  }

}



export function createDecoder(m: Measurement, pulses: Pulses): Decoder {
  // const pulsesStore = getPulsesStore()
  const state = shallowReactive({
    isLoading: false,
  }) as Decoder

  const scope = effectScope()

  const pulses_raw_data = computed(() => toRaw(pulses.raw_data))

  let p = performance.now()

  function analyzerWorkerOnmessage(e: MessageEvent<any>) {
    if (e.data.measurementID === p) {
      // console.log("SHARED WORKER GET DATA", e.data);
      state.isLoading = false
      state.analyzer = e.data.analyzer
      state.guessed = e.data.guessed
      state.sliceGuess = e.data.sliceGuess
    }
  }
  analyzerWorker.port.addEventListener("message", analyzerWorkerOnmessage, false)

  // state.colorScale = computed(() => D3Scale.scaleSequentialSqrt(["blue", "orange"]).domain([state.guessed?.short, state.guessed?.long]))
  // state.minPulseWidth = computed(() => state.guessed?.long)
  // state.pulsesCount = computed(() => m.rangeIds.value[1] - m.rangeIds.value[0] + 1)
  // // pulsesStore.xScale(m.decoder.minPulseWidth.value) * ZT.k
  // const b = bisector((x: ArrayLike<number>) => x[3])
  // state.ddd = computed(() => {
  //   const LID = b.right(state.sliceGuess?.hints || [], viewStore.view.viewportLeft - pulses.scaledXOffset.value - m.firstPulse.value.scaledTime)
  //   const RID = b.left(state.sliceGuess?.hints || [], viewStore.view.viewportRight - pulses.scaledXOffset.value - m.firstPulse.value.scaledTime)
  //   return [LID, RID]
  // })
  // state.geth = (i) => state.sliceGuess?.hints[i]

  // state.filteredHints = computed(() => {
  //   // const [LID, RID] = state.hintsInViewportRangeIDs.value
  //   // return state.sliceGuess?.hints.slice(LID, RID)
  //   return 9
  //   return state.sliceGuess?.hints.filter(x => viewStore.view.isPointInView(x[3]))
  // })

  watch(() => m.rangeIds.value.toString(), () => {
    state.isLoading = true
  })


  function runWorker() {
    p = performance.now()
    const args = {
      measurementID: p,
      pulses: pulses_raw_data.value,
      scale: {
        domain: pulsesStore?.xScale.value.domain(),
        range: pulsesStore?.xScale.value.range(),
      },
      rangeIds: m.rangeIds.value,
      pickedSlicer: null
    } as IAnalyzerWorkerArgs

    // worker.postMessage(args)
    analyzerWorker.port.postMessage(args)
  }

  scope.run(() => {
    watchDebounced(() => m.rangeIds.value.toString(), runWorker, {
      debounce: 300,
    })
    onScopeDispose(() => {
      analyzerWorker.port.removeEventListener("message", analyzerWorkerOnmessage, false)
    })
  })

  return Object.assign(state, { scope })

}
