import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      msg: 'Hello from Component A!',
    }
  },
  methods: {
    someMethod(arg: string): string {
      return 'hello'
    },
  },
})
