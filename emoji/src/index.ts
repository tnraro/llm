import { emojis } from "./cldr";
import { Db } from "./db";
import { createTextEmbedding } from "./embedding";

using db = new Db("./emoji.sqlite");
using embedding = await createTextEmbedding();

if (db.isInitialRun) {
  console.time("prepare data");
  for (const [emoji, ko] of emojis) {
    db.insert({
      unicode: emoji,
      ko: {
        description: ko,
        embedding: await embedding.get(ko),
      },
    });
  }
  console.timeEnd("prepare data");
}

const pray = await embedding.get("부탁드려요");
console.log(db.search(pray));
