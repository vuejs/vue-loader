<style scoped>
body, h2 {
  color: yellow;
}
:scope {
  color: red;
}
div:scope.test {
  color: blue;
}
h1 {
  color: green;
}
</style>

<template>
<div><h1>hi</h1></div>
<p class="abc def">hi</p>
</template>
