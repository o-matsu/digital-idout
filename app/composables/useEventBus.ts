import mitt, { type Emitter } from 'mitt'

// Define event types
type Events = {
  PICK_REGIONS: unknown[]
  DRAW_REGIONS: unknown[]
  TOGGLE_REGIONS_VIEW: boolean
  MOUSE_CLICK: MouseEvent
  TOGGLE_PICKING_MODE: boolean
  REGISTER_SECOND_STEP: unknown[]
}

// Create a singleton event bus
const emitter: Emitter<Events> = mitt<Events>()

// Composable for use in Vue components
export const useEventBus = () => {
  return {
    emit: emitter.emit,
    on: emitter.on,
    off: emitter.off,
    all: emitter.all
  }
}

// Direct export for use in non-component contexts (like ThreeBrain.js)
export const eventBus = emitter
