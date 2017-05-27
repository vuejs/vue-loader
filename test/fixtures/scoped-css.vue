<style scoped>
.test {
  color: yellow;
}
.test:after {
  content: 'bye!';
}
h1 {
  color: green;
}
.anim {
  animation: color 5s infinite, other 5s;
}
.anim-2 {
  animation-name: color;
  animation-duration: 5s;
}
@keyframes color {
  from { color: red; }
  to { color: green; }
}
.foo p >>> .bar {
  color: red;
}
</style>

<template>
<div>
  <div><h1>hi</h1></div>
  <p class="abc def">hi</p>
  <template v-if="ok"><p class="test">yo</p></template>
  <svg><template><p></p></template></svg>
</div>
</template>
