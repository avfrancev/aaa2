<template lang="pug">
//- svg(
  class="overflow-visible hidden"
  :viewBox="`0 0 ${100*ZT.k} 100`" preserveAspectRatio="none" :width="100*ZT.k")
  path(
    opacity="0.5"
    stroke="red"
    :d="`M${(10/ZT.k)},0 L100,0 L100,100 L0,100 z`"
  )     
svg(
  class="overflow-visible hidden"
  )
  //- symbol#arrL.overflow-visible( viewBox="0 0 10 10" preserveAspectRatio="none")
  //-   path(d="M10,0 L0,5 L10,10" fill="blue" :transform="`matrix(${1 / ZT.k},0,0,1,${0},0)`" )
  //- symbol#arrR.overflow-visible( viewBox="0 0 10 10" preserveAspectRatio="none")
  //-   use(href="#arrL" x="0" y="0" transform="scale(-1,1)" )
  symbol#lll.overflow-visible( viewBox="0 0 1 1" preserveAspectRatio="none")
  symbol#lll.overflow-visible( viewBox="0 0 1 1" preserveAspectRatio="none")
    path(
      stroke='black'
      vector-effect="non-scaling-stroke"
      :d="`M${1 / ZT.k},0 L${1 - 1 / ZT.k},0 L1,0.5 L${1 - 1 / ZT.k},1 L${1 / ZT.k},1 L0,0.5 L${1 / ZT.k},0`"
    )
      //- :d="`M${1/ZT.k},0 L${1-1/ZT.k},0 M${1/ZT.k},1 L${1-1/ZT.k},1`"

</template>

<script lang="ts" setup>

const { ZT } = useViewStore().view

</script>