import { FeatureExtractionPipeline, pipeline } from "@sroussey/transformers";
import { IEmbedding } from "./types";

export class TransformersTextEmbedding implements IEmbedding {
  readonly name;
  readonly dimensions;
  #pipe: FeatureExtractionPipeline;
  constructor(
    pipe: FeatureExtractionPipeline,
    modelName: string,
    dimensions: number,
  ) {
    this.#pipe = pipe;
    this.dimensions = dimensions;
    this.name = modelName;
  }
  async get(text: string): Promise<Float32Array> {
    const tensor = await this.#pipe(text, { pooling: "mean" });
    return tensor.data as Float32Array;
  }
  [Symbol.dispose](): void {
    this.#pipe.dispose();
  }
}
export const createTransformersTextEmbedding = async (
  modelName: string,
  dimensions: number,
) => {
  const pipe = await pipeline("feature-extraction", modelName, {
    quantized: false,
  });
  return new TransformersTextEmbedding(pipe, modelName, dimensions);
};
