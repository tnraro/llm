import { file, hash, write } from "bun";
import { createDatabase } from "./db";

export const cache = async (output: string, input?: string): Promise<boolean> => {
  if (input == null) {
    const outfile = file(output);
    if (!await outfile.exists()) {
      return false;
    }
  } else {
    const outfile = file(output);
    const hashfile = file(`${input}.hash`);

    const hashed = hash(await file(input).arrayBuffer()).toString();

    if (!await hashfile.exists()
      || !await outfile.exists()
      || (await hashfile.text()) !== hashed) {
      await write(`${input}.hash`, hashed);
      return false;
    }
  }

  console.log(`[cached] ${output}`);
  return true;
}
const cacheDb = createDatabase(`.cache/cache.sqlite`);
cacheDb.exec(`create table if not exists Cache (
  id text not null,
  hash text unique not null,
  content text not null
)`);

const selectCache = cacheDb.query<
  { content: string },
  { $id: string, $hash: string }
>(`select content from Cache where id=$id and hash=$hash limit 1`);
const insertCache = cacheDb.query(`insert into Cache (id, hash, content)
values ($id, $hash, $content)
on conflict (hash) do update set content=excluded.content`);

export const getCache = (id: string, hash: number | bigint) => {
  const x = selectCache.get({
    $id: id,
    $hash: hash.toString(),
  });
  return x == null ? null : JSON.parse(x.content);
}
export const setCache = (id: string, hash: number | bigint, content: unknown) => {
  insertCache.run({
    $id: id,
    $hash: hash.toString(),
    $content: JSON.stringify(content)
  });
}