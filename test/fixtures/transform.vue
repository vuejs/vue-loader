<template>
<div>
  <img src="./logo.png">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">
    <image xlink:href="./logo.png" />
  </svg>
  <img src="./logo.png" srcset="./logo.png">
  <img src="./logo.png" srcset="./logo.png 2x">
  <img src="./logo.png" srcset="./logo.png, ./logo.png 2x">
  <img src="./logo.png" srcset="./logo.png 2x, ./logo.png">
  <img src="./logo.png" srcset="./logo.png 2x, ./logo.png 3x">
  <img src="./logo.png" srcset="./logo.png, ./logo.png 2x, ./logo.png 3x">
  <img
    src="./logo.png"
    srcset="
      ./logo.png 2x,
      ./logo.png 3x
  ">
</div>
</template>

<style>
html { background-image: url(./logo.png); }
</style>
