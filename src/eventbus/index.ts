import EventEmitter from 'eventemitter3'

export interface EventBusTypes {
  messageNotice: () => void
}

export class EventBus extends EventEmitter<EventBusTypes> {}
