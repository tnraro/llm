import { run } from "./crawler";
import { createFeatureExtractor } from "./embedding";
import { measure } from "./measure";
import { BunSqliteStore } from "./store";
import { join } from "path";

export const createDataStore = async () => {
	const databaseName = join(import.meta.dir, "../dat.sqlite");
	const store = new BunSqliteStore(databaseName);
	store.init();
	const extractor = await createFeatureExtractor();

	const crawl = async (url: string, options?: { depth?: number }) => {
		const c = { s: 0, f: 0 };
		using _ = measure("crawl");
		for await (const page of run(url, options)) {
			console.log(page.url);
			try {
				const contentEmbedding = await extractor(page.content);
				store.insert({
					...page,
					contentEmbedding,
				});
				c.s++;
			} catch (error) {
				console.error(error);
				c.f++;
			}
		}
		console.info("crawl:", "s:", c.s, "f:", c.f);
	};

	const search = async (query: string) => {
		const queryEmbedding = await extractor(query);
		const result = store.search(queryEmbedding);
		return result;
	};

	return {
		crawl,
		search,
		[Symbol.dispose]() {
			store[Symbol.dispose]();
		}
	};
};