// import { MaybeComputedElementRef } from "@vueuse/core";
// import { sum } from "d3-array";
// import { IView, ZoomTransform } from "~/composables/usePanZoom";
// import { Pulses, PulsesStorage } from "../models/Pulses";


// export function getPulsesStore() {
//   return toValue(useState().pulsesStore)
// }

// export const useState = createGlobalState(
//   () => {

//     const viewEl = ref()
//     console.log(123123123);
    
//     let view = createViewStore(viewEl)

//     const sessionsStore = useSessionsStore()

//     let pulsesStores = shallowReactive(new Map<string, ReturnType<typeof createPulsesStore>>())

//     // const pulsesStore = reactive(computedWithControl(
//     //   () => sessionsStore.currentSession.value.id,
//     //   () => pulsesStores.get(sessionsStore.currentSession.value.id)
//     // ))

//     const pulsesStore = shallowReactive({})

//     // nextTick(() => {
//     //   Object.assign(pulsesStore, createPulsesStore(sessionsStore.currentSession.value.id))
//     // })

//     watchEffect(() => {
//       // pulsesStore. = pulsesStores.get(sessionsStore.currentSession.value.id)
//       // console.log(123);

//       // Object.assign(pulsesStore, pulsesStores.get(sessionsStore.currentSession.value.id))
//     })


//     function init(el: MaybeComputedElementRef) {
//       pulsesStores.clear()
//       sessionsStore.sessions.value.forEach(s => {
//         const ps = createPulsesStore(s.id)
//         pulsesStores.set(s.id, ps)
//       })
//       Object.assign(pulsesStore, pulsesStores.get(sessionsStore.currentSession.value.id))

//       tryOnMounted(() => {
//         viewEl.value = toValue(el)
//         // console.log(state.pulsesStore);
//       })
//     }
//     const state = {}
//     // const state = shallowReactive({
//     //   sessionsStore,
//     //   view,
//     //   pulsesStores,
//     //   pulsesStore: reactiveComputed(() => pulsesStore.value || {}),
//     //   init,
//     // })



//     // return state

//     return { sessionsStore, view, pulsesStores, pulsesStore, init, state }
//   }
// )



// function makePS(key: string) {
//   const state = shallowReactive({
//     key,
//     data: shallowReactive(new Set<Pulses>()),
//   })

//   const storage = useStorage(`pulsesStore-${key}`, <PulsesStorage[] | null>[])
  
//   const getters = {}
//   const actions = {}
//   return Object.assign(state, getters, actions)
// }


// const sss = useSSS()
// sss.init()