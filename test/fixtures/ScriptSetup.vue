<template>
  <button @click="inc">{{ count }}</button>
</template>

<script setup>
import { ref } from 'vue'

export const count = ref(0)

export function inc() {
  count.value++
}
</script>
