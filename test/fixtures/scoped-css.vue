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
</style>

<template>
<div><h1>hi</h1></div>
<p class="abc def">hi</p>
<template v-if="ok"><p class="test">yo</p></template>
<svg><template><p></p></template></svg>
</template>
