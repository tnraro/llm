import { test, expect } from "bun:test";
import { createTextEmbedding } from "./embedding";

test("embedding", async () => {
  using embedding = await createTextEmbedding();
  const [cat, kitty] = await Promise.all(
    ["cat", "kitty"].map((text) => embedding.get(text)),
  );

  expect(cat).toBeInstanceOf(Float32Array);
  expect(kitty.length).toBe(512);
});
