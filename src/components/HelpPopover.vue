<script setup lang="ts">
</script>

<template lang="pug">
PopoverRoot
  PopoverTrigger(:as-child="true")
    slot
  PopoverPortal
    PopoverContent.DropdownMenuContent(class="flex flex-col gap-2 p-4 text-sm")
      PopoverArrow(class="fill-base-300")
      .divider.divider-start.h-0: b Pulses
      .shortcut
        span #[kbd ctrl] + #[kbd scroll] zoom view
      .shortcut
        span #[kbd alt] + #[kbd drag] change offset
      .shortcut
        span #[kbd shift] + #[kbd drag] create new measurement
      .divider.divider-start.h-0: b Measurements
      .shortcut
        span #[kbd del] or #[kbd d] delete measurement
      .shortcut
        kbd c
        span change color
      .shortcut
        span #[kbd ←] or #[kbd →] move measurement
      .shortcut
        span #[kbd alt] + #[kbd drag resize handler] stick to pulses
</template>

<style lang="sass" scoped>
.shortcut
  @apply flex items-center gap-2
  kbd
    @apply kbd kbd-sm text-xs mx-1
</style>
