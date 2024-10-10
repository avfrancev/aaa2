import { Analyzer } from 'pulseplot/lib/histogram.js'
import { sliceGuess } from 'pulseplot/lib/slicer.js'
import { Bitbuffer } from 'pulseplot/lib/bitbuffer.js'
import { bisector } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { PulsesItem } from '../models/Pulses';

export interface IAnalyzerWorkerArgs {
  measurementID: number | string
  pulses: number[]
  rangeIds: [number, number]
  scale: {
    domain: [number, number]
    range: [number, number]
  }
  pickedSlicer: string | null
  firstPulse: PulsesItem
}

export interface IAnalyzerWorkerResult {
  measurementID: number | string
  analyzer?: Analyzer
  guessed?: ReturnType<Analyzer['guess']>
  sliceGuess?: {
    hints: any[][]
    bytesHints: IBitsHintsGroup[]
    bits: Bitbuffer
  }
}

export interface ISliceGuessResult {
  hints: BitsHints[]
  bits: Bitbuffer
  bytesHints: number[]
  hex: string
}


export type BitsHints = [number, number, "X" | "O" | "1"]
export type IBitsHintsGroup = BitsHints[] & {
  // asd: number
  bbuf: Bitbuffer
  range: [number, number]
  scaledRange: [number, number]
  bytes: BitsHints[]
  hex: string
}

export type Hint = {
  id: number
  x1: number
  x2: number
  scaledX1: number
  scaledX2: number
  scaledWidth: number
  label: string
}


const bytesHints = (bitsHints: BitsHints[]) => {
  const groups = splitArrayWithDelimiter(bitsHints, (h: BitsHints, i: number, arr: BitsHints[]) => {
    // prevh[3]
    let prevh = arr[i - 1]
    let hasBreak = !prevh || prevh[1] !== h[0]
    return hasBreak || h[2] === "X"
  }) as IBitsHintsGroup[]

  // console.log(groups[0][0], bitsHints);


  groups.forEach((g) => {
    g.bbuf = new Bitbuffer()
    for (let i = 0; i < g.length; ++i) {
      g.bbuf.pushSymbol(g[i][2])
    }
    g.range = [g[0][0], g[g.length - 1][1] || g[g.length - 1][0]]
    g.scaledRange = [g[0][3], g[g.length - 1][4]]

    g.bytes = g.bbuf.bytes.map((byte: string, i: number) => {
      let startBit = g[i * 8]
      let endBit = g[i * 8 + 7]
      if (!endBit) endBit = g[g.length - 1]
      let x1 = startBit[0]
      let x2 = endBit[1]
      let scaledx1 = startBit[3]
      let scaledx2 = endBit[4]
      let h = [x1, x2, byte, scaledx1, scaledx2, i * 8, i * 8 + 7]
      // console.log(h, startBit, endBit);
      return h as BitsHints
    })
    // g.viewportRangeIDs = computed(() => {
    //   let sxo = get(pulses.scaledXOffset)
    //   let l = viewStore.state.viewportLeft - sxo / viewStore.state.ZT.k
    //   let r = viewStore.state.viewportRight - sxo / viewStore.state.ZT.k
    //   let ids = [bisector((h) => h[4]).left(g.bytes, l), bisector((h) => h[3]).right(g.bytes, r)]
    //   return ids
    // })
    g.bytes.sort((a, b) => (a[4] - a[3]) - (b[4] - b[3]))
    g.sort((a, b) => (a[4] - a[3]) - (b[4] - b[3]))
  })

  return groups
}

function splitArrayWithDelimiter<T>(arr: T[] = [], delimiterCallback: Function) {
  let result = [[]] as T[][]
  arr.forEach((item, i) => {
    if (delimiterCallback(item, i, arr)) {
      result.push([item])
    } else {
      result[result.length - 1].push(item)
    }
  })
  return result.filter((g) => g.length)
}

const timeBisector = bisector((d: PulsesItem) => d.time)

interface SharedWorkerGlobalScope {
  onconnect: (event: MessageEvent) => void;
}

const _self: SharedWorkerGlobalScope = self as any;

function createHintsGroups(_hints: BitsHints[], xScale: Function) {
  const hints = _hints.map((h, id) => {
    return {
      id, x1: h[0], x2: h[1],
      scaledX1: xScale(h[0]), scaledX2: xScale(h[1]),
      scaledWidth: xScale(h[1] - h[0]),
      label: h[2],
    }
  })
  const groups = splitArrayWithDelimiter(hints, (h: Hint, i: number, arr: Hint[]) => {
    let prev = arr[i - 1]
    let hasBreak = !prev || prev.x2 !== h.x1
    return hasBreak || h.label === "X"
  })
  return groups.map((g) => {
    return {
      bits: g.toSorted((a, b) => a.scaledWidth - b.scaledWidth),
    }
  })
}

_self.onconnect = (e) => {
  const port = e.ports[0];
  port.onmessage = (e) => {
    const {
      measurementID,
      pulses: allPulses,
      rangeIds,
      scale,
      pickedSlicer,
      firstPulse,
    } = e.data as IAnalyzerWorkerArgs

    let xScale = scaleLinear().domain(scale.domain).range(scale.range)

    const pulses = allPulses.slice(...rangeIds)


    const analyzer = new Analyzer(pulses)
    const guessed = analyzer.guess()
    guessed.modulation = pickedSlicer || guessed.modulation
    const sg = sliceGuess(pulses, guessed) as ISliceGuessResult

    const hintsGroups = createHintsGroups(sg.hints, xScale)
    sg.hintsGroups = hintsGroups



    sg.hints?.forEach((h) => {
      h[0] += firstPulse.time
      h[1] += firstPulse.time
      h[3] = xScale(h[0])
      h[4] = xScale(h[1])
      // h[5] = h[4] - h[3]
    })
    sg.hex = sg.bits?.toHexString()
    sg.bytesHints = bytesHints(sg.hints)


    const result: IAnalyzerWorkerResult = {
      measurementID, analyzer, guessed, sliceGuess: sg
    }
    port.postMessage(result)
  }
};
