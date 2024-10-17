import { Analyzer } from 'pulseplot/lib/histogram.js'
import { sliceGuess } from 'pulseplot/lib/slicer.js'
import { Bitbuffer } from 'pulseplot/lib/bitbuffer.js'
import { bisector } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { PulsesItem } from '../models/Pulses';
import { v4 as uuid } from 'uuid';

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
  id: string
  x1: number
  x2: number
  scaledX1: number
  scaledX2: number
  scaledWidth: number
  label: string
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

function toHexadecimal(num: number) {
  if (num < 0 || num > 255) {
    return 'Error: Input must be between 0 and 255.';
  }
  return '0x' + num.toString(16).padStart(2, '0').toUpperCase();
}

function createBytesHints(g: Hint[]) {
  const bbuf = new Bitbuffer()
  for (const h of g) {
    bbuf.pushSymbol(h.label)
  }
  return bbuf.bytes.map((byte: string, i: number): Hint & { bits: Hint[] } => {
    let startBit = g[i * 8]
    let endBit = g[i * 8 + 7]
    const bits = g.slice(i * 8, i * 8 + 8).toSorted((a, b) => a.scaledWidth - b.scaledWidth)
    if (!endBit) endBit = g[g.length - 1]
    let x1 = startBit.x1
    let x2 = endBit.x2
    let scaledX1 = startBit.scaledX1
    let scaledX2 = endBit.scaledX2
    let scaledWidth = scaledX2 - scaledX1
    const label = toHexadecimal(+byte)

    // return {id: (i + scaledX1), x1, x2, scaledX1, scaledX2, scaledWidth, label, bits}
    return { id: uuid(), x1, x2, scaledX1, scaledX2, scaledWidth, label, bits }
  })
}

function createHintsGroups(_hints: BitsHints[], xScale: Function, firstPulse: PulsesItem, lastPulse: PulsesItem, rangeIds: [number, number]) {
  const hints = _hints.map((h, id) => {
    const x1 = h[0] + firstPulse.time
    const x2 = h[1] ? (h[1] + firstPulse.time) : lastPulse.time
    const scaledX1 = xScale(x1)
    const scaledX2 = xScale(x2)
    const scaledWidth = scaledX2 - scaledX1
    return {
      id: uuid(),
      x1, x2,
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

    const hintsGroups = createHintsGroups(sg.hints || [], xScale, firstPulse, lastPulse, rangeIds)

    const result: IAnalyzerWorkerResult = {
      measurementID, analyzer, guessed, sliceGuess: { ...sg, hintsGroups }
    }
    port.postMessage(result)
  }
};
