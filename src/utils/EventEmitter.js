/** Mini sistema de eventos: obj.on('nome', fn) / obj.emit('nome', dados) */
export class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(listener);
  }

  emit(event, ...args) {
    this.listeners.get(event)?.forEach((listener) => listener(...args));
  }
}
