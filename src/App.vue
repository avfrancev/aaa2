<script setup lang="ts">

</script>

<template lang="pug">
//- main(class="container mx-auto px-2 min-h-svh grid")
main(class="container mx-auto px-2 min-h-svh flex flex-col max-sm:max-w-[100svw]")
  .flex.flex-col.flex-1
    Navbar
    PulsesViewer.flex-1
</template>

<style lang="sass">
  html, body
    scroll-behavior: smooth
    height: 100%
    display: grid
    &[data-theme='light']
      background-image: url("/corrugation.png")
    &[data-theme='dark']
      background-image: url("/fake-brick.png")

  #app
    position: relative
    width: 100%
    min-height: 100vh

  path, circle
    vector-effect: non-scaling-stroke
</style>
