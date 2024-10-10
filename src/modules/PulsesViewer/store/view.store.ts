import { MaybeComputedElementRef } from "@vueuse/core"
import { IView, IViewConstrains, ZoomTransform } from "~/composables/usePanZoom"


export function createViewStore(el: MaybeComputedElementRef = ref(), ZT?: ZoomTransform): IView {
  const elBounds = useElementBounding(computed(() => toValue(el)))
  const extents = reactive<IViewConstrains>({
    scaleConstraints: [1, 100],
    translateConstraints: [
      [0, 0],
      [elBounds.width, elBounds.height],
    ],
  })
  const view = createView(el, elBounds, extents, ZT)
  return view as IView
}


export const useViewStore = createGlobalState(() => {
  let viewEl = ref()
  const view = createViewStore(viewEl)
  function init(el: MaybeComputedElementRef) {
    tryOnMounted(() => {
      viewEl.value = toValue(el)
    })
  }
  return { view, init }
})
