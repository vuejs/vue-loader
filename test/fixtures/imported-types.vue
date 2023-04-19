<script setup lang="ts">
import type { Props } from './imported-types'
import type { Props as P } from 'foo'

const props = defineProps<Props & P>()
</script>

<template>
  {{ Object.keys(props) }}
</template>
