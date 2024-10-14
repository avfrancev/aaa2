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
  lastPulse: PulsesItem
}

export interface IAnalyzerWorkerResult {
  measurementID: number | string
  analyzer?: Analyzer
  guessed?: ReturnType<Analyzer['guess']>
  sliceGuess?: {
    hints: any[][]
    // bytesHints: IBitsHintsGroup[]
    bits: Bitbuffer
    hintsGroups: HintsGroups
  }
}

export interface ISliceGuessResult {
  hints: BitsHints[]
  bits: Bitbuffer
  bytesHints: number[]
  hex: string
}

export type HintsGroups = ReturnType<typeof createHintsGroups>

export type BitsHints = [number, number, "X" | "O" | "1"]
export type IBitsHintsGroup = BitsHints[] & {
  // asd: number
  bbuf: Bitbuffer
  range: [number, number]
  scaledRange: [number, number]
  bytes: BitsHints[]
  hex: string
  hintsGroups: HintsGroups
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

interface SharedWorkerGlobalScope {
  onconnect: (event: MessageEvent) => void;
}

function createBytesHints(g: Hint[]) {
  const bbuf = new Bitbuffer()
  for (const h of g) {
    bbuf.pushSymbol(h.label)
  }
  return bbuf.bytes.map((byte: string, i: number) => {
    let startBit = g[i * 8]
    let endBit = g[i * 8 + 7]
    if (!endBit) endBit = g[g.length - 1]
    let x1 = startBit.x1
    let x2 = endBit.x2
    let scaledX1 = startBit.scaledX1
    let scaledX2 = endBit.scaledX2
    let scaledWidth = scaledX2 - scaledX1
    // let h = [x1, x2, byte, scaledx1, scaledx2, i * 8, i * 8 + 7]
    // console.log(h, startBit, endBit);
    return {id: i, x1, x2, scaledX1, scaledX2, scaledWidth, label: byte} as Hint
  })
}

function createHintsGroups(_hints: BitsHints[], xScale: Function, firstPulse: PulsesItem, lastPulse: PulsesItem) {
  const hints = _hints.map((h, id) => {
    const x1 = h[0] + firstPulse.time
    const x2 = h[1] ? (h[1] + firstPulse.time) : lastPulse.time
    const scaledX1 = xScale(x1)
    const scaledX2 = xScale(x2)
    const scaledWidth = scaledX2 - scaledX1
    return {
      id, x1, x2, 
      scaledX1, scaledX2, scaledWidth,
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
      bits: g.toSorted((a, b) => b.scaledWidth - a.scaledWidth),
      bytes: createBytesHints(g).toSorted((a, b) => b.scaledWidth - a.scaledWidth),
      x1: g[0].x1,
      x2: g[g.length - 1].x2,
      scaledX1: g[0].scaledX1,
      scaledX2: g[g.length - 1].scaledX2,
      scaledWidth: g[g.length - 1].scaledX2 - g[0].scaledX1,
    }
  })
}

const _self: SharedWorkerGlobalScope = self as any;

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
      lastPulse,
    } = e.data as IAnalyzerWorkerArgs

    let xScale = scaleLinear().domain(scale.domain).range(scale.range)

    const pulses = allPulses.slice(...rangeIds)


    const analyzer = new Analyzer(pulses)
    const guessed = analyzer.guess()
    guessed.modulation = pickedSlicer || guessed.modulation
    const sg = sliceGuess(pulses, guessed) as ISliceGuessResult

    const hintsGroups = createHintsGroups(sg.hints, xScale, firstPulse, lastPulse)
    // sg.hintsGroups = hintsGroups


    // sg.hints?.forEach((h) => {
    //   h[0] += firstPulse.time
    //   h[1] += firstPulse.time
    //   h[3] = xScale(h[0])
    //   h[4] = xScale(h[1])
    //   // h[5] = h[4] - h[3]
    // })
    // sg.hex = sg.bits?.toHexString()
    // sg.bytesHints = bytesHints(sg.hints)


    const result: IAnalyzerWorkerResult = {
      measurementID, analyzer, guessed, sliceGuess: {...sg, hintsGroups}
    }
    port.postMessage(result)
  }
};
