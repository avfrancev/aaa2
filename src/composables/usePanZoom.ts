import { useGesture } from "@vueuse/gesture"
// import { animate, easeInOut, inertia } from "popmotion"

import type { MaybeComputedElementRef, UseElementBoundingReturn } from "@vueuse/core"
import type { State } from "@vueuse/gesture"
import { MaybeRef, ShallowReactive } from "vue"


export class ZoomTransform {
  k: number
  x: number
  y: number
  constructor(k: number, x: number, y: number) {
    this.k = k
    this.x = x
    this.y = y
  }

  scale(k: number) {
    return k === 1 ? this : new ZoomTransform(this.k * k, this.x, this.y)
  }

  translate(x: number, y: number) {
    return x === 0 && y === 0 ? this : new ZoomTransform(this.k, this.x + this.k * x, this.y + this.k * y)
  }

  apply(point: [number, number]) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y]
  }

  applyX(x: number) {
    return x * this.k + this.x
  }

  applyY(y: number) {
    return y * this.k + this.y
  }

  invert(location: [number, number]) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k]
  }

  invertX(x: number) {
    return (x - this.x) / this.k
  }

  invertY(y: number) {
    return (y - this.y) / this.k
  }

  rescaleX(x: any) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x))
  }

  rescaleY(y: any) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y))
  }

  toString() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")"
  }
}

type T = MaybeRef<number> | ComputedRef<number> | number
export interface IViewConstrains {
  scaleConstraints: Array<T>
  translateConstraints: Array<[T, T]>
}
export interface IViewArgs {
  el: MaybeComputedElementRef
  elBounds: UseElementBoundingReturn
  extents: IViewConstrains
  ZT?: ZoomTransform
}

export interface IView {
  el: Ref
  elBounds: UseElementBoundingReturn
  extents: IViewConstrains
  ZT: ZoomTransform
  mouseX: Ref<number>
  viewportLeft: ComputedRef<number>
  viewportRight: ComputedRef<number>
  viewportWidth: ComputedRef<number>
  gestures: ReturnType<typeof getGestures>
  gesturesState: ComputedRef<State>
  translateBy: (x: number, y: number) => void
  scaleToPointX: (scaleFactor: number, p0: number) => void
  getScaleToPointX: (scaleFactor: number, p0: number) => ZoomTransform
  isRangeInView: (x1: number, x2: number) => boolean
  isPiontInView: (x: number) => boolean
}

function getGestures(view: IView) {
  const gestures = useGesture(
    {
      onMove: (s) => {
        // window.requestAnimationFrame(() => {
        // })
        view.mouseX.value = view.ZT.invertX(s.event.clientX - view.elBounds.left.value)
      },
      onWheel: (s) => {
        if (s.direction[1]) return
        s.event.preventDefault()
        view.translateBy(s.delta[0], 0)
        nextTick(() => {
          view.mouseX.value = view.ZT.invertX(s.event.clientX - view.elBounds.left.value)
        })
      },
      onDrag: (s) => {
        gestures.state.move.cancel()
        s.event.preventDefault()
        // window.requestAnimationFrame(() => {
        // })
        view.translateBy(s.delta[0], 0)
      },
      onPinch: (s) => {
        if (s.pinching) {
          s.event.preventDefault()
          // gestures.state.wheel.cancel()
          const scaleFactor = Math.exp(s.delta[1] * -0.001)
          // @ts-ignore
          // window.requestAnimationFrame(() => {
          // })
          let x = s.event.clientX - toValue(view.elBounds.left.value)
          view.scaleToPointX(scaleFactor, x)
          view.mouseX.value = view.ZT.invertX(s.event.clientX - view.elBounds.left.value)
        }
      },
    },
    {
      // HACK
      domTarget: '' as MaybeRef,
      wheel: {
        lockDirection: true,

      },
      drag: {
        lockDirection: true,
        useTouch: true,
        preventWindowScrollY: true,
      },
      eventOptions: { passive: false },
    },
  )

  return gestures
}


export function createView(el: MaybeComputedElementRef, elBounds: UseElementBoundingReturn, extents: IViewConstrains, ZT?: ShallowReactive<ZoomTransform>): IView {
  const state = shallowReactive({
    el: el,
    elBounds: elBounds,
    extents: extents,
    ZT: ZT || shallowReactive(new ZoomTransform(1, 0, 0)),
    mouseX: ref(0),
  } as IView)

  const unwrapedConstraints = computed(() => {
    return {
      scaleConstraints: state.extents.scaleConstraints.map<number>(x => toValue(x)),
      translateConstraints: state.extents.translateConstraints.map<[number, number]>(x => [toValue(x[0]), toValue(x[1])]),
    }
  })

  const getters = {
    width: computed<number>(() => state.elBounds.width.value || 0),
    height: computed<number>(() => state.elBounds.height.value || 0),
    viewportRight: computed<number>(() => {
      return state.ZT.invertX(state.elBounds.width.value)
    }),
    viewportLeft: computed<number>(() => {
      return -state.ZT.x / state.ZT.k
    }),
    viewportWidth: computed<number>((): number => {
      return getters.viewportRight.value - getters.viewportLeft.value
    }),
    gesturesState: computed(() => {
      return state.gestures.state
    }),
    isPiontInView(x: number) {
      return state.viewportLeft.value < x && x < state.viewportRight.value
    },
    isRangeInView(x1: number, x2: number) {
      return state.viewportLeft.value < x2 && x1 < state.viewportRight.value
    }
  }

  const actions = {
    getScaleToPointX(scaleFactor: number, p0: number) {
      let p1 = state.ZT.invertX(p0)
      let newZT = toRaw(state.ZT.scale(scaleFactor))
      const scaleConstraints = unwrapedConstraints.value.scaleConstraints
      newZT.k = Math.max(scaleConstraints[0], Math.min(scaleConstraints[1], newZT.k))
      newZT.x = p0 - p1 * newZT.k
      newZT = actions.constrain(newZT)
      return newZT
    },
    translateBy(xOffset = 0, yOffset = 0) {
      state.ZT.x += xOffset
      state.ZT.y += yOffset
      Object.assign(state.ZT, actions.constrain(state.ZT))
    },
    scaleToPointX(scaleFactor: number, p0: number) {
      let newZT = actions.getScaleToPointX(scaleFactor, p0)
      Object.assign(state.ZT, newZT)
      // debugger
    },
    constrain(ZT: ZoomTransform) {
      let unwraped = unwrapedConstraints.value.translateConstraints
      return actions.defaultConstrain(ZT, unwraped, unwraped)
    },
    defaultConstrain(transform: ZoomTransform, extent: Array<[number, number]>, translateExtent: Array<[number, number]>) {
      var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
        dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0],
        dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
        dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1]
      return transform.translate(
        dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
        dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1),
      )
    },
  }

  Object.assign(state, getters, actions)

  state.gestures = getGestures(state)
  watch(() => state.el.value, () => {
    state.gestures.config.domTarget = state.el.value
    state.gestures.clean()
    state.gestures.bind()
  })

  return state
  // return Object.assign(state, { gestures }) as IView
}
