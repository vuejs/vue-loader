<script setup lang="ts">
import { ref, Ref } from 'vue'
const a: Ref<number> = ref(12)
</script>

<template>
  <p @click="a++">From TSssss: {{ a?.toFixed(2) }}</p>
</template>
