import test from "node:test";
import assert from "node:assert/strict";

import {
  addProductionQueueItem,
  PRODUCTION_QUEUE_KEY,
  readProductionQueue,
  removeProductionQueueItem
} from "../src/production-queue.js";

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    }
  };
}

test("production queue helpers add and remove local items", () => {
  const storage = createMemoryStorage();
  const first = addProductionQueueItem(
    { id: "a1", fileName: "part-a.stl", totalPriceThb: 120 },
    storage
  );
  const second = addProductionQueueItem(
    { id: "b2", fileName: "part-b.stl", totalPriceThb: 180 },
    storage
  );

  assert.equal(first.length, 1);
  assert.equal(second.length, 2);
  assert.deepEqual(
    readProductionQueue(storage).map((item) => item.id),
    ["b2", "a1"]
  );

  const next = removeProductionQueueItem("a1", storage);
  assert.deepEqual(next.map((item) => item.id), ["b2"]);
  assert.ok(storage.getItem(PRODUCTION_QUEUE_KEY));
});
