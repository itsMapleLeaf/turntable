type CacheItem<T> = {
  data: T
  expiry: number
}

export class Cache<T> {
  private readonly cache = new Map<string, CacheItem<T>>()

  constructor(
    private readonly options: {
      maxSize: number
      expiryTime: number
    },
  ) {}

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (item && item.expiry > Date.now()) {
      return item.data
    }
    this.cache.delete(key)
    return undefined
  }

  set(key: string, data: T): void {
    if (this.cache.size >= this.options.maxSize) {
      this.cache.delete(this.cache.keys().next().value as string)
    }
    this.cache.set(key, { data, expiry: Date.now() + this.options.expiryTime })
  }
}
