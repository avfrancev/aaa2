declare module "*.vue" {
  import type { DefineComponent } from "vue"

  const component: DefineComponent<object, object, any>
  export default component
}

declare module "pulseplot/lib/histogram.js" {
  export class Histogram {
    constructor(data: any, tolerance?: number)
    bins: any[]
    get length(): number
    histogram_sum(data: any, tolerance?: number): void
    delete_bin(index: any): void
    swap_bins(index1: any, index2: any): void
    sort_mean(): void
    sort_count(): void
    fuse_bins(tolerance?: number): void
    trim_bins(tolerance?: number): void
    find_bin_index(width: any): number
    console_print(): void
    string_print(separator?: string): string
  }
  export class Analyzer {
    constructor(data: any, tolerance?: number)
    analyse_pulses(data: any, messages: any, tolerance?: number): void
    pulses: any[]
    gaps: any[]
    periods: any[]
    pulse_sum: number
    gap_sum: number
    pulse_gap_ratio: number
    pulse_gap_skew: number
    hist_pulses: Histogram
    hist_gaps: Histogram
    hist_periods: Histogram
    hist_timings: Histogram
    guess(): {
      name: string
      modulation?: undefined
      short?: undefined
      long?: undefined
      gap?: undefined
      reset?: undefined
      tolerance?: undefined
      sync?: undefined
    } | {
      name: string
      modulation: string
      short: any
      long: any
      gap: number
      reset: number
      tolerance?: undefined
      sync?: undefined
    } | {
      name: string
      modulation: string
      short: any
      long: any
      tolerance: number
      reset: number
      gap?: undefined
      sync?: undefined
    } | {
      name: string
      modulation: string
      short: any
      long: any
      reset: number
      gap?: undefined
      tolerance?: undefined
      sync?: undefined
    } | {
      name: string
      modulation: string
      short: any
      long: any
      gap: number
      tolerance: number
      reset: number
      sync?: undefined
    } | {
      name: string
      modulation: string
      short: any
      long: any
      sync: any
      reset: number
      gap?: undefined
      tolerance?: undefined
    }
    create_rfraw(data: any): string
    rfrawB0: any
    rfrawB1: any
    console_log(): void
    print_plain(messages: any): void
    print(timings: any, messages: any): void
  }
}

declare module "pulseplot/lib/slicer.js" {
  export function sliceGuess(pulses: any, guess: any): any[] | {
    hints: any[][]
    bits: Bitbuffer
  }
  export function slicePCM(pulses: any, guess: any): {
    hints: (string | number)[][]
    bits: Bitbuffer
  }
  export function sliceNRZ(pulses: any, guess: any): {
    hints: number[][]
    bits: Bitbuffer
  }
  export function sliceRZ(pulses: any, guess: any): {
    hints: (string | number)[][]
    bits: Bitbuffer
  }
  export function slicePPM(pulses: any, guess: any): {
    hints: (string | number)[][]
    bits: Bitbuffer
  }
  export function slicePWM(pulses: any, guess: any): {
    hints: any[][]
    bits: Bitbuffer
  }
  export function sliceMC(pulses: any, guess: any): {
    hints: any[][]
    bits: Bitbuffer
  }
  export function sliceDM(pulses: any, guess: any): {
    hints: any[][]
    bits: Bitbuffer
  }
  export function sliceNRZI(pulses: any, guess: any): {
    hints: (string | number)[][]
    bits: Bitbuffer
  }
  export function sliceCMI(pulses: any, guess: any): {
    hints: any[][]
    bits: Bitbuffer
  }
  export function slicePIWM(pulses: any, guess: any): {
    hints: any[][]
    bits: Bitbuffer
  }
  import type { Bitbuffer } from "pulseplot/lib/bitbuffer.js"

}
declare module "pulseplot/lib/bitbuffer.js" {
  export class Bitbuffer {
    constructor(bytes?: any[], len?: number)
    bytes: any[]
    len: number
    fromString(s: any): void
    pushZero(): void
    pushOne(): void
    pushSymbol(s: any): void
    push(bit: any): void
    pushNibble(n: any): void
    pushByte(n: any): void
    pushBreak(): void
    toBitArray(): number[]
    toHexString(): string
  }
}

declare module "pulseplot/lib/rfraw" {
  export class RfRaw {
    static getPulses(value: string): number[]
    static isRfRaw(data: string): boolean
  }
}
