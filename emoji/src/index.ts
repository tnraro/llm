import { Db } from "./db";
import { createTextEmbedding } from "./embedding";
import { getEmojis } from "./emoji";
using db = new Db("./emoji.sqlite");
using embedding = await createTextEmbedding();

if (db.isInitialRun) {
  const emojis = await getEmojis();
  console.time("prepare data");
  const rows = [];
  for (const { emoji, name } of emojis) {
    rows.push({
      unicode: emoji,
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

const query = process.argv.slice(2).join(" ");
const pray = await embedding.get(query);
console.log("input:", query);
console.log(
  db
    .search(pray, 5)
    .map((x) => `  ${x.unicode}\t${x.ko}`)
    .join("\n"),
);
