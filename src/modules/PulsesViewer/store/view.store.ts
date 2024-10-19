import type { MaybeComputedElementRef } from '@vueuse/core'
import type { IView, IViewConstrains } from '~/composables/usePanZoom'
import { ZoomTransform } from '~/composables/usePanZoom'

export function createViewStore(el: MaybeComputedElementRef = ref(), ZT?: ZoomTransform): IView {
  const elBounds = useElementBounding(computed(() => toValue(el)))
  const extents = reactive<IViewConstrains>({
    scaleConstraints: [1, 1000],
    translateConstraints: [
      [0, 0],
      [elBounds.width, elBounds.height],
    ],
  })
  const view = createView(el, elBounds, extents, ZT)
  return view as IView
}

export const useViewStore = createGlobalState(() => {
  const viewEl = ref()
  const view = createViewStore(viewEl)

  const { currentSession } = useSessionsStore()
  const viewStoreZTKey = computed(() => `viewStoreZT-${currentSession.value}`)

  watchImmediate(currentSession, () => {
    const ZT = window.localStorage.getItem(viewStoreZTKey.value)
    if (ZT) {
      const parsedZT = Object.values(JSON.parse(ZT)) as [number, number, number]
      Object.assign(view.ZT, new ZoomTransform(...parsedZT))
    }
    else {
      Object.assign(view.ZT, new ZoomTransform(1, 0, 0))
    }
  })

  watchDebounced(view.ZT, () => {
    window.localStorage.setItem(viewStoreZTKey.value, JSON.stringify(view.ZT))
  }, {
    debounce: 500,
  })

  function init(el: MaybeComputedElementRef) {
    tryOnMounted(() => {
      viewEl.value = toValue(el)
    })
  }
  return { view, init }
})
