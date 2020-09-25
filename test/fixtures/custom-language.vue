<unit-test lang="js">
  describe('example', () => {
    it('basic', done => {
      done();
    })
  })
</unit-test>

<documentation>
  This is example documentation for a component.
</documentation>

<template>
  <h2 class="red">{{msg}}</h2>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello from Component A!'
    }
  }
}
</script>

<style>
comp-a h2 {
  color: #f00;
}
</style>
