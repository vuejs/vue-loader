<script setup lang="ts">
let a: number = 12
</script>

<template>
  <p>From TS: {{ a?.toFixed(2) }}</p>
</template>
