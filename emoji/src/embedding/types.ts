export interface IEmbedding {
  readonly name: string;
  readonly dimensions: number;
  get: (text: string) => Promise<Float32Array>;
  [Symbol.dispose]: () => void;
}
