<script setup lang="ts">
const { currentSession, sessions, addSession, removeSession: _removeSession } = useSessionsStore()
const config = useConfig()

// const sessionsSorted = computed(() => {
//   if (config.useESP32)
//     return new Set(["ESP32", ...sessions.value])
//   else
//     return sessions.value
// })

function removeSession(session: string) {
  _removeSession(session)
  nextTick(() => {
    if (currentSession.value === session) {
      currentSession.value = [...sessions.value][0]
    }
  })
}

watch(() => config.useESP32, () => {
  if (!config.useESP32 && currentSession.value === "ESP32") {
    currentSession.value = [...sessions.value][0]
  }
})
</script>

<template lang="pug">
SelectRoot(v-model="currentSession" )
  SelectTrigger(class="whitespace-nowrap input input-bordered bg-transparent hover:input-primary h-8 inline-flex mx-4 items-center space-x-3" aria-label="Select session")
    SelectValue(placeholder="Select session...")
    i-radix-icons:chevron-down
  SelectPortal
    SelectContent(class="SelectContent" :side-offset="5" position="popper")
      SelectScrollUpButton(class="SelectScrollButton")
        i-radix-icons:chevron-up
      SelectViewport(class="relative p-[5px]")
        SelectGroup(class="relative")
          SelectItem(
            v-if="config.useESP32"
            class="SelectItem"
            value="ESP32")
            SelectItemIndicator(class="absolute left-0 inline-flex items-center justify-center w-[25px]")
              i-radix-icons:check
            SelectItemText ESP32
          SelectItem(
            v-for="(option, index) in sessions"
            :key="option"
            class="SelectItem"
            :value="option")
            SelectItemIndicator(class="absolute left-0 inline-flex items-center justify-center w-[25px]")
              i-radix-icons:check
            SelectItemText {{ `Session #${index + 1}` }}
          div(class="absolute top-0 right-0")
            div(v-if="config.useESP32" class="h-8")
            div(
              v-for="s in sessions"
              :key="s")
              button(
                class="btn btn-xs my-1 text-xs btn-square btn-ghost hover:bg-error hover:text-error-content"
                @click="removeSession(s)")
                i-ph:x
          button(class="btn btn-xs btn-block btn-ghost" @click="currentSession = addSession()")
            i-ph:plus(class="text-xs")
      SelectScrollDownButton(class="SelectScrollButton")
        i-radix-icons:chevron-down
</template>
