export const PRODUCTION_QUEUE_KEY = "print-it-now-production-queue";

export function readProductionQueue(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(PRODUCTION_QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProductionQueue(queue, storage = globalThis.localStorage) {
  storage?.setItem?.(PRODUCTION_QUEUE_KEY, JSON.stringify(queue));
  return queue;
}

export function addProductionQueueItem(item, storage = globalThis.localStorage) {
  const next = [item, ...readProductionQueue(storage)];
  return writeProductionQueue(next, storage);
}

export function removeProductionQueueItem(itemId, storage = globalThis.localStorage) {
  const next = readProductionQueue(storage).filter((item) => item.id !== itemId);
  return writeProductionQueue(next, storage);
}
