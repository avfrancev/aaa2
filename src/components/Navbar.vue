<script setup lang="ts">
// const { currentSession, sessions, addSession, removeSession: _removeSession } = useSessionsStore()
// const config = useConfig()

// import  { mode } from '~/stores/colors'
// console.log(mode.system.value);

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template lang="pug">
div(class="flex my-4 items-center overflow-x-auto")
  div(class="flex items-center mr-0 md:mr-4")
    i-twemoji:raccoon(class="hue-rotate-180 drop-shadow-lg mr-0 md:mr-4 text-3xl transition duration-600 hover:scale-110 hover:hue-rotate-0")
    pre(class="hidden md:block"): b(class="text-xl") RF Pulse Viewer
  PulsesViewSessionSelecotr
  .ml-auto(class="*:btn-sm *:sm:btn-md")
    button.btn.btn-sms.text-lg.btn-square.btn-ghost(@click="toggleDark()")
      i-carbon:moon(v-if="!isDark")
      i-carbon:sun(v-else)
    SettingsPopover
      button.btn.text-lg.btn-square.btn-ghost
        i-ph:gear
    a.btn.btn-sms.text-lg.btn-square.btn-ghost(href="https://github.com/avfrancev/pulseviewer" target="_blank")
      i-ph:github-logo-fill
    HelpPopover
      button.btn.text-xl.btn-ghost ?
  //- .flex.gap-2.text-center
    .size-12.bg-primary.text-primary-content.flex.items-center.justify-center
      .size-8.bg-secondary.text-secondary-content OO
    .size-12.bg-secondary.text-secondary-content.flex.items-center.justify-center
      .size-8.bg-primary.text-primary-content OO
    .size-12.bg-base-200.text-base-200-content.flex.items-center.justify-center
      .size-8.bg-base-300.text-base-300-content OO
    .size-12.bg-primary.text-primary-content OOO
    .size-12.bg-secondary.text-secondary-content OOO
    .size-12.bg-accent.text-accent-content OOO
    .size-12.bg-neutral.text-neutral-content OOO
    .size-12.bg-base-100.text-base-100-content OOO
    .size-12.bg-base-200.text-base-200-content OOO
    .size-12.bg-base-300.text-base-300-content OOO
    .size-12.bg-error.text-error-content OOO
    .size-12.bg-warning.text-warning-content OOO
    .size-12.bg-success.text-success-content OOO
    .size-12.bg-info.text-info-content OOO
</template>
