<script setup lang="ts">
import type { Measurement } from "../models/Measurements"
import type { Pulses, PulsesItem } from "../models/Pulses"
import { curveStepAfter, line } from "d3-shape"

const { currentSession, sessions } = useSessionsStore()
const config = useConfig()

const props = defineProps<{ pulses: Pulses }>()

const { view } = useViewStore()
const { ZT } = view

const pulsesStore = usePulsesStore()

const itemEl = ref<HTMLElement | null>(null)

const genLine = line(
  (d: PulsesItem) => d.scaledTime,
  (d: PulsesItem) => (d.level ? 20 : 80),
)
  .curve(curveStepAfter)
// .curve(curveStepBefore)
const linePath = computed<string>(() => {
  return genLine(props.pulses?.data.value) as string
})

let tmpMeasurement: Measurement | null = null

const isDropDownMoreOpen = ref(false)
function copyAs(type: "RFRAW" | "JSON" | "ARRAY") {
  switch (type) {
    case "RFRAW":{
      console.log("RFRAW")
      break
    }
    case "JSON": {
      const a = JSON.stringify(props.pulses)
      console.log("JSON", a)
      break
    }
    case "ARRAY": {
      console.log("ARRAY")
      break
    }
    default:
      break
  }
}

function onItemDrag(s: any) {
  if (s.altKey) {
    s.event.stopImmediatePropagation()
    // props.pulses.xOffset.value += (pulsesStore.pixelRatio.value * s.delta[0]) / ZT.k
    props.pulses.setXOffset(props.pulses.xOffset.value + (pulsesStore.pixelRatio.value * s.delta[0]) / ZT.k)
  }
  else if (s.shiftKey) {
    s.event.stopImmediatePropagation()
    const dx = (pulsesStore.pixelRatio.value * s.delta[0]) / ZT.k
    let x = (s.event.clientX - view.elBounds.left.value)
    x = ZT.invertX(x)
    x -= props.pulses.scaledXOffset.value
    x = pulsesStore.xScale.value.invert(x)
    if (s.first) {
      // props.pulses.addMeasurement(x, x) ?????
      tmpMeasurement = props.pulses.addMeasurement(x, x)
    }
    else if (tmpMeasurement) {
      tmpMeasurement.x2.value += dx
    }
    else if (s.last) {
      tmpMeasurement = null
    }
  }
}
</script>

<template lang="pug">
div.relative(
  ref="itemEl"
  v-hover="(s: any) => { !isDropDownMoreOpen && pulses.setIsHovered(s.hovering) }"
  )
  //- pre {{ 20/view.ZT.k }}
  //- pre {{ pulses.isHovered }}
  .h-10
    .actions.mt-2.relative(
      v-show="pulses.isHovered.value"
      class="join *:btn *:btn-sm *:text-md")
      button.join-item.btn-square
        i-ph:dots-six-vertical-bold
      PulsesViewEditPulsesDialog(
        :model-value="props.pulses.raw_data"
        @update:model-value="props.pulses.setRawData($event)"
        )
        button(class="join-item btn-square")
          i-ph:pencil-simple
        button(class="join-item btn-square hover:btn-error" @click="pulsesStore.remove(props.pulses)")
          i-ph:trash
          
      DropdownMenuRoot(v-model:open="isDropDownMoreOpen" :default-open="false")
        DropdownMenuTrigger.btn-square.join-item
          i-ph:dots-three-outline-fill
        DropdownMenuPortal
          DropdownMenuContent.DropdownMenuContent
            DropdownMenuArrow(class="fill-base-300")
            DropdownMenuItem.DropdownMenuItem(:disabled="pulses.xOffset.value === 0" @click="pulses.setXOffset(0)")
              i-ph:align-left-simple-fill.mr-2
              | Reset offset
            DropdownMenuSub
              DropdownMenuSubTrigger.DropdownMenuItem(value="more copy")
                i-ph:align-left-simple-fill.mr-2
                | Copy to
                DropdownMenuPortal
                  DropdownMenuSubContent.DropdownMenuContent
                    DropdownMenuItem.DropdownMenuItem(
                      v-if="config.useESP32"
                      @click="copyToSession('ESP32', pulses.toJSON())"
                      ) {{ currentSession === "ESP32" ? "Current" : "ESP32" }}
                    DropdownMenuItem.DropdownMenuItem(
                      v-for="(s, id) in sessions"
                      :key="s"
                      @click="copyToSession(s, pulses.toJSON())"
                      ) {{ currentSession === s ? "Current" : `Session #${id + 1}` }}
                      //- @click="console.log(pulses.toJSON())"
            DropdownMenuSub
              DropdownMenuSubTrigger.DropdownMenuItem(value="more copy")
                i-ph:align-left-simple-fill.mr-2
                | Copy as
                DropdownMenuPortal
                  DropdownMenuSubContent.DropdownMenuContent
                    DropdownMenuItem.DropdownMenuItem(@click="copyAs('RFRAW')")
                      | RFRaw
                    DropdownMenuItem.DropdownMenuItem(@click="copyAs('JSON')")
                      | JSON
                    DropdownMenuItem.DropdownMenuItem(@click="copyAs('ARRAY')")
                      | Array
            DropdownMenuItem.DropdownMenuItem(
              @click="pulses.addMeasurement(pulses.data.value.at(0)?.time || 0, pulses.data.value.at(-1)?.time || 0)"
              )
              i-ph:brackets-square-duotone.mr-2
              | Measure all
            DropdownMenuItem.DropdownMenuItem(class="hover:bg-error hover:text-error-content" @click="pulsesStore.remove(props.pulses)")
              i-ph:trash.mr-2
              | Delete
        //- @update:model-value="props.pulses.setRawData($event)"
      //- pre asdasd

      //- AlertDialogRoot()
        AlertDialogTrigger(class="btn btn-sm btn-ghost")
          i-ph:ambulance-light
        AlertDialogPortal
        AlertDialogOverlay(class="DialogOverlay")
        AlertDialogContent(class="DialogContent" @escape-key-down="cancelSave")
          AlertDialogTitle ASDASD
          AlertDialogDescription Description
          textarea.textarea(v-model.lazy="tmpRawPulsesData")
          div(class="flex justify-end items-center gap-6")
            AlertDialogCancel(class="btn btn-xs btn-ghost" @click="cancelSave") Cancel
            AlertDialogAction(class="btn btn-sm btn-success" @click="save") Save

  //- pre {{ props.pulses.viewBox }}
  svg.w-full(
    v-drag="onItemDrag"
    class="h-[100px]"
    :viewBox="`${props.pulses.viewBox.value.x} 0 ${props.pulses.viewBox.value.w} 100`"
    preserveAspectRatio="none"
    )
    //- :viewBox="`${viewStore.view.viewportLeft.value - pulses.scaledXOffset.value} 0 ${viewStore.view.viewportWidth.value} 100`"
    path.fill-none(
      class="stroke-base-content/60"
      :d="linePath"
      stroke-width="1"
      vector-effect="non-scaling-stroke"
      )
    PulsesViewMeasurementsRects(v-bind="{ pulses }")
    PulsesViewWidthMeasure( v-bind="{ pulses }")
    //- path(d="M0,0 L10,0 L10,10 L0,10 z")
  PulsesViewMeasurementsDecoders(v-bind="{ pulses: props.pulses }")
</template>
