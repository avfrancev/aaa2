<script setup lang="ts">
const config = useConfig()
</script>

<template lang="pug">
PopoverRoot
  PopoverTrigger(:as-child="true")
    slot
  PopoverPortal
    PopoverContent.DropdownMenuContent(class="flex flex-col gap-2 p-4")
      PopoverArrow(class="fill-base-300")
      //- .divider.divider-start.h-0: b ESP32
      fieldset
        label Use ESP32
        input(
          v-model="config.useESP32"
          class="toggle toggle-primary toggle-sm" type="checkbox")
      fieldset
        label ESP32 WS Endpoint
        input(
          v-model.lazy="config.esp32WSEndpoint"
          class="input input-sm" type="text")
      //- .divider.divider-start.h-0: b Measurements
      //- fieldset
      //-   label Pin mea
      //-   input(
      //-     v-model="config.pinMeasurements"
      //-     class="toggle toggle-primary toggle-sm" type="checkbox")
</template>

<style lang="sass" scoped>
fieldset
  @apply flex justify-between gap-2 items-center text-sm
  label
    // @apply text-muted
  // @apply grid grid-cols-2 gap-2 items-center text-sm
  // input
</style>
