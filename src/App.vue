<template lang="pug">
main(class="container mx-auto px-2 min-h-svh grid")
  PulsesViewer
</template>


<script setup lang="ts">

</script>

<style lang="sass">
  html, body
    scroll-behavior: smooth
    height: 100%
    display: grid
    &[data-theme='cupcake']
      background-image: url("/corrugation.png")
    &[data-theme='dracula']
      background-image: url("/fake-brick.png")

  #app
    position: relative
    width: 100%
    min-height: 100vh

  path, circle
    vector-effect: non-scaling-stroke
</style>
