import { pipeline } from "@sroussey/transformers";

export const createTextEmbedding = async () => {
  const extractor = await pipeline(
    "feature-extraction",
    "tnraro/distiluse-base-multilingual-cased-v1",
    { quantized: false },
  );
  const get = async (text: string) => {
    const tensor = await extractor(text, { pooling: "mean" });
    return tensor.data as Float32Array;
  };

  return {
    get,
    [Symbol.dispose]() {
      extractor.dispose();
    },
  };
};
