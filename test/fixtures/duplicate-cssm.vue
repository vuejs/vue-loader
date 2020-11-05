<template>
  <h1 :class="$style.red">hi</h1>
</template>

<style module>
@value color from './duplicate-cssm.css';

.red {
  color: color;
}
</style>
