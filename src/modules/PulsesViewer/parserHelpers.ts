import type { PulsesStorage } from "./models/Pulses"
import { RfRaw } from "pulseplot/lib/rfraw"

export enum FormatType {
  unknown,
  RfRaw,
  Array,
  Json,
}

export interface IParsedPulses {
  type: keyof typeof FormatType
  data: number[] | PulsesStorage | undefined
}
export type ParsedType2 = ReturnType<typeof getParsedInputString>

export function getFromRFRaw(s: string): number[] | undefined {
  if (!RfRaw.isRfRaw(s))
    return undefined
  const p = RfRaw.getPulses(s).filter(Boolean)
  if (p.length)
    return p
  return undefined
}

export function isValidPulsesObject(pulses: unknown): boolean {
  if (pulses && pulses.constructor === Object) {
    const pulsesObj = pulses as { raw_data: number[] }
    if (pulsesObj.raw_data && pulsesObj.raw_data.length)
      return true
  }
  return false
}

export function getFromObject(s: string): Partial<PulsesStorage> | undefined {
  try {
    const p = JSON.parse(s)
    if (isValidPulsesObject(p))
      return p as Partial<PulsesStorage>
  }
  catch {
    return undefined
  }
  return undefined
}

export function getFromArray(s: string) {
  const p = s.split(",").map(Number).filter(Boolean)
  if (Array.isArray(p) && p.length)
    return p
}

export function getParsedInputString(s: string) {
  const formats = [
    {
      type: FormatType[FormatType.RfRaw],
      data: getFromRFRaw(s),
    },
    {
      type: FormatType[FormatType.Json],
      data: getFromObject(s),
    },
    {
      type: FormatType[FormatType.Array],
      data: getFromArray(s),
    },
  ]

  const res = formats.find(d => d.data)
  return res
}
