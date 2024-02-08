import { FeatureExtractionPipeline, pipeline } from "@sroussey/transformers";
import { IEmbedding } from "./types";

export class TransformersTextEmbedding implements IEmbedding {
  readonly name;
  readonly dimensions;
  readonly caching;
  #pipe: FeatureExtractionPipeline;
  #cache = new Map<string, Float32Array>();
  constructor(options: {
    pipe: FeatureExtractionPipeline;
    modelName: string;
    dimensions: number;
    caching?: boolean;
  }) {
    const _options = {
      caching: false,
      ...options,
    };
    this.#pipe = _options.pipe;
    this.dimensions = _options.dimensions;
    this.name = _options.modelName;
    this.caching = _options.caching;
  }
  async get(text: string): Promise<Float32Array> {
    if (this.caching) {
      const v = this.#cache.get(text);
      if (v != null) {
        return v;
      }
    }
    const tensor = await this.#pipe(text, { pooling: "mean" });
    const v = tensor.data as Float32Array;
    if (this.caching) {
      this.#cache.set(text, v);
    }
    return v;
  }
  [Symbol.dispose](): void {
    this.#pipe.dispose();
  }
}
export const createTransformersTextEmbedding = async (
  modelName: string,
  dimensions: number,
  caching = false,
) => {
  const pipe = await pipeline("feature-extraction", modelName, {
    quantized: false,
  });
  return new TransformersTextEmbedding({
    pipe,
    modelName,
    dimensions,
    caching,
  });
};
