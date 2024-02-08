import { bench, group, run } from "mitata";
import { config } from "./config";
import { createTransformersTextEmbedding } from "./transformers-text-embedding";

const models = await Promise.all(
  [...Object.values(config)].map((model) =>
    createTransformersTextEmbedding(model.name, model.dimensions),
  ),
);

group(async () => {
  models.map((model) => {
    bench(model.name, async () => {
      await model.get("부탁드려요");
    });
  });
});

await run();
