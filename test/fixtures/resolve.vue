<template>
<div>
  <img src="./logo.png">
  <img src="~fixtures/logo.png">
  <!-- Maybe we can remove this -->
  <!-- <https://github.com/vuejs/vue-loader/pull/927#issuecomment-714333544> -->
  <img src="~/fixtures/logo.png">
</div>
</template>

<style>
  html { background-image: url(./logo.png); }
  body { background-image: url(~fixtures/logo.png); }
</style>
