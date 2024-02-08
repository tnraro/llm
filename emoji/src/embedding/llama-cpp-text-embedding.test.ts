import { describe, expect, test } from "bun:test";
import { createLlamaCppTextEmbedding } from "./llama-cpp-text-embedding";

describe("llama.cpp embedding", () => {
  test("distiluse-base-multilingual-cased-v1", async () => {
    const embedding = await createLlamaCppTextEmbedding(
      "WestLake-7B-v2-laser-truthy-dpo.q5_k_m.gguf",
      4096,
    );
    const vector = await embedding.get("sentence");
    expect(vector).toBeInstanceOf(Float32Array);
    expect(embedding.dimensions).toBe(vector.length);
  });
});
