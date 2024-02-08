import { Db, Emoji } from "./db";
import { config } from "./embedding/config";
import { createTransformersTextEmbedding } from "./embedding/transformers-text-embedding";
import { getEmojis } from "./emoji";
const { EMOJI_DATABASE_PATH } = import.meta.env;
const embeddingConfig = config["Xenova/paraphrase-multilingual-MiniLM-L12-v2"];
using embedding = await createTransformersTextEmbedding(
  embeddingConfig.name,
  embeddingConfig.dimensions,
  true,
);
using db = new Db({
  filename: EMOJI_DATABASE_PATH,
  dimensions: embedding.dimensions,
});

if (db.isInitialRun) {
  const emojis = await getEmojis();
  console.time("prepare data");
  const rows: Emoji[] = [];
  for (const { emoji, names } of emojis) {
    const row: Emoji = {
      emoji,
      embeddings: [],
    };
    for (const name of names) {
      row.embeddings.push({
        text: name,
        embedding: await embedding.get(name),
      });
    }
    rows.push(row);
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
console.table(db.search(result, 7));
