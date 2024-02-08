import { describe, expect, test } from "bun:test";
import { createTransformersTextEmbedding } from "./transformers-text-embedding";

describe("transformers embedding", () => {
  test("distiluse-base-multilingual-cased-v1", async () => {
    const embedding = await createTransformersTextEmbedding(
      "tnraro/distiluse-base-multilingual-cased-v1",
      512,
    );
    const vector = await embedding.get("sentence");
    expect(vector).toBeInstanceOf(Float32Array);
    expect(embedding.dimensions).toBe(vector.length);
  });
  test("paraphrase-multilingual-mpnet-base-v2", async () => {
    const embedding = await createTransformersTextEmbedding(
      "Xenova/paraphrase-multilingual-mpnet-base-v2",
      768,
    );
    const vector = await embedding.get("sentence");
    expect(vector).toBeInstanceOf(Float32Array);
    expect(embedding.dimensions).toBe(vector.length);
  });
  test("paraphrase-multilingual-MiniLM-L12-v2", async () => {
    const embedding = await createTransformersTextEmbedding(
      "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
      384,
    );
    const vector = await embedding.get("sentence");
    expect(vector).toBeInstanceOf(Float32Array);
    expect(embedding.dimensions).toBe(vector.length);
  });
});
