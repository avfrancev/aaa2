<template lang="pug">
div
  pre {{ currentSession?.id }}
  span.join.mr-2(v-for="(s, i) in sessions" :key="s.id")
    button.btn.join-item(
      :title="s.id"
      :class="{ 'btn-accent': s.id === currentSession.id }"
      @click="currentSession = s") Session \#{{ i }}
    button.btn.join-item(
      @click="removeSession(s)") X
  button.btn(@click="addSession()") ADD
  //- div
    select(v-model="currentSession")
      option(v-for="s in sessions" :value="s") {{ s.id }}
</template>

<script setup lang="ts">
// const state = useState()
const { sessions, currentSession, addSession, removeSession } = useSessionsStore()

</script>
