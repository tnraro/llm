import { pipeline } from "@sroussey/transformers";

export const createFeatureExtractor = async () => {
	const extractor = await pipeline(
		"embeddings",
		"tnraro/distiluse-base-multilingual-cased-v1",
		{ quantized: false },
	);

	return async (query: string) => {
		const e = await extractor(query, { pooling: "mean" });
		return e.data as Float32Array;
	};
};
