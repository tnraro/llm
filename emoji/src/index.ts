import { emojis } from "./cldr";
import { Db } from "./db";
import { createTextEmbedding } from "./embedding";
using db = new Db("./emoji.sqlite");
using embedding = await createTextEmbedding();

if (db.isInitialRun) {
  console.time("prepare data");
  const rows = [];
  for (const [emoji, ko] of emojis) {
    rows.push({
      unicode: emoji,
      ko: {
        description: ko,
        embedding: await embedding.get(ko),
      },
    });
  }
  console.timeEnd("prepare data");
  console.log(rows.length);
  console.time("insert data");
  db.insertBulk(rows);
  console.timeEnd("insert data");
}

const pray = await embedding.get("큐피드");
console.log(
  db
    .search(pray, 5)
    .map((x) => `${x.unicode},${x.ko}`)
    .join(","),
);
