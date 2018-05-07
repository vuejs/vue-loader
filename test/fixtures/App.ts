import Vue from 'vue'

export default Vue.extend({
  data () {
    return {
      msg: 'Hello from Component A!'
    }
  },
  methods: {
    someMethod (arg: string): string {
      return 'hello'
    }
  }
})
