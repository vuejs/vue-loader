<script setup lang="ts">
import { ref, Ref } from 'vue'
import { Props } from './types'

const a: Ref<number> = ref(12)

const props = defineProps<Props>()
console.log(Object.keys(props))
</script>

<template>
  <pre>{{ Object.keys(props) }}</pre>
  <p @click="a++">From TSssss: {{ a?.toFixed(2) }}</p>
</template>
