# Inline Templates

If you want to integrate Vue files with an existing backend, you can with inline templates.

By omitting `<template>` from the vue file and specifying a string starting with a `#` on the [template](http://vuejs.org/api/#template) property on the components script, you can use of the common `<script type="x-template">` to include templates.

The template will replace the mounted element. Any existing markup inside the mounted element will be ignored, unless content distribution slots are present in the template.

*Warning: From a security perspective, you should only use Vue templates that you can trust. Never use user-generated content as your template.*
