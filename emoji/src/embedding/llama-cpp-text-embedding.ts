import { join } from "path";
import {
  LlamaEmbeddingContext,
  LlamaLogLevel,
  LlamaModel,
  getLlama,
} from "node-llama-cpp";
import { IEmbedding } from "./types";

class LlamaCppTextEmbedding implements IEmbedding {
  readonly name;
  readonly dimensions;
  #model;
  #context;
  constructor(model: LlamaModel, modelName: string, dimensions: number) {
    this.#model = model;
    this.#context = new LlamaEmbeddingContext({ model, contextSize: 256 });
    this.dimensions = dimensions;
    this.name = modelName;
  }
  async get(text: string): Promise<Float32Array> {
    const { vector } = await this.#context.getEmbeddingFor(text);
    return new Float32Array(vector);
  }
  [Symbol.dispose](): void {
    this.#model.dispose();
    this.#context.dispose();
  }
}

export const createLlamaCppTextEmbedding = async (
  modelName: string,
  dimensions: number,
) => {
  const { LLAMA_CPP_MODELS_PATH } = import.meta.env;
  if (LLAMA_CPP_MODELS_PATH == null)
    throw new Error("no env: LLAMA_CPP_MODELS_PATH");
  const llama = await getLlama({
    cuda: true,
    progressLogs: false,
    logLevel: LlamaLogLevel.error,
  });
  const model = new LlamaModel({
    llama,
    modelPath: join(LLAMA_CPP_MODELS_PATH, modelName),
    gpuLayers: 32,
  });
  return new LlamaCppTextEmbedding(model, modelName, dimensions);
};
