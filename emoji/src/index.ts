import { Db } from "./db";
import { config } from "./embedding/config";
import { createTransformersTextEmbedding } from "./embedding/transformers-text-embedding";
import { getEmojis } from "./emoji";
const embeddingConfig = config["Xenova/paraphrase-multilingual-MiniLM-L12-v2"];
using embedding = await createTransformersTextEmbedding(
  embeddingConfig.name,
  embeddingConfig.dimensions,
);
using db = new Db({
  filename: "./emoji3.sqlite",
  dimensions: embedding.dimensions,
});

if (db.isInitialRun) {
  const emojis = await getEmojis();
  console.time("prepare data");
  const rows = [];
  for (const { emoji, name } of emojis) {
    rows.push({
      emoji,
      ko: {
        description: name,
        embedding: await embedding.get(name),
      },
    });
  }
  console.timeEnd("prepare data");
  console.log(rows.length);
  console.time("insert data");
  db.insertBulk(rows);
  console.timeEnd("insert data");
}

const query = process.argv.slice(2).join(" ").trim();
if (query.length === 0)
  throw new Error("no input:\nUsage:\n  pnpm start [query]");
const result = await embedding.get(query);
console.log("input:", query);
console.log(
  db
    .search(result, 10)
    .map((x) => `  ${x.distance}\t${x.emoji}\t${x.ko}`)
    .join("\n"),
);
