export class Emitter<T> {
  private listeners = new Set<(data: T) => void>()

  subscribe(listener: (data: T) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  emit(data: T) {
    for (const listener of this.listeners) listener(data)
  }
}
