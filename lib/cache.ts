
type Entry<T> = { value: T; expiresAt: number };
const store = new Map<string, Entry<any>>();

export function setCache<T>(key: string, value: T, ttlSec = 300) {
  store.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

export function getCache<T>(key: string): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return hit.value as T;
}
