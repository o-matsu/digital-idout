import mitt from 'mitt'

const emitter = mitt()

// Vue 2 EventBus API compatibility
export default {
  $emit: emitter.emit,
  $on: emitter.on,
  $off: emitter.off,
}
