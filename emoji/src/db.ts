import { Database } from "bun:sqlite";
import { load } from "sqlite-vss";

export interface Emoji {
  emoji: string;
  embeddings: {
    text: string;
    embedding: Float32Array;
  }[];
}

export class Db {
  #db;
  #insertEmoji;
  #insertEmojiEmbedding;
  #selectEmojiEmbeddingId;
  #insertEmojiEmbeddingVss;
  #insertBulk;
  #search;
  #isInitialRun;
  #insertEmojiHasEmojiEmbedding;
  readonly isInitialRun;
  constructor(options: { filename?: string; dimensions: number }) {
    const _options = {
      ...options,
    };
    this.#db = new Database(_options.filename);
    load(this.#db);
    this.#db.exec("PRAGMA journal_mode = WAL;");
    this.#isInitialRun = this.#db.prepare(
      "select name from sqlite_master where type='table' and name='emoji'",
    );
    this.isInitialRun = this.#isInitialRun.get() == null;
    this.#db.exec(`
      create table if not exists emoji (
        id integer primary key autoincrement,
        emoji text not null unique
      );
      create table if not exists emoji_embedding (
        id integer primary key autoincrement,
        text text not null unique on conflict ignore
      );
      create virtual table if not exists emoji_embedding_vss using vss0(
        embedding(${_options.dimensions})
      );
      create table if not exists emoji_has_emoji_embedding (
        emoji_id integer not null,
        emoji_embedding_id integer not null,
        primary key(emoji_id, emoji_embedding_id) on conflict ignore
      );
    `);
    this.#insertEmoji = this.#db.query<
      { emoji_id: number },
      { $emoji: string }
    >(`
      insert into emoji (emoji) values ($emoji)
      returning id as emoji_id
    `);
    this.#insertEmojiEmbedding = this.#db.query<
      { emoji_embedding_id: number },
      { $text: string }
    >(`
      insert into emoji_embedding(text)
      values ($text)
      returning id as emoji_embedding_id
    `);
    this.#selectEmojiEmbeddingId = this.#db.query<
      { emoji_embedding_id: number },
      { $text: string }
    >(`
      select id as emoji_embedding_id
      from emoji_embedding
      where text=$text
      limit 1
    `);
    this.#insertEmojiEmbeddingVss = this.#db.query<
      null,
      { $id: number; $embedding: Float32Array }
    >(`
      insert into emoji_embedding_vss(rowid, embedding)
      values ($id, $embedding)
    `);
    this.#insertEmojiHasEmojiEmbedding = this.#db.query<
      null,
      { $emoji_id: number; $emoji_embedding_id: number }
    >(`
      insert into emoji_has_emoji_embedding(emoji_id, emoji_embedding_id)
      values ($emoji_id, $emoji_embedding_id)
    `);
    this.#insertBulk = this.#db.transaction((rows: Emoji[]) => {
      for (const row of rows) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const { emoji_id } = this.#insertEmoji.get({
          $emoji: row.emoji,
        })!;
        for (const embedding of row.embeddings) {
          let emoji_embedding_id = this.#insertEmojiEmbedding.get({
            $text: embedding.text,
          })?.emoji_embedding_id;
          if (emoji_embedding_id != null) {
            this.#insertEmojiEmbeddingVss.run({
              $id: emoji_embedding_id,
              $embedding: embedding.embedding,
            });
          } else {
            emoji_embedding_id = this.#selectEmojiEmbeddingId.get({
              $text: embedding.text,
            })?.emoji_embedding_id;
            if (emoji_embedding_id == null)
              throw new Error("emoji_embedding_id is null");
          }
          this.#insertEmojiHasEmojiEmbedding.run({
            $emoji_id: emoji_id,
            $emoji_embedding_id: emoji_embedding_id,
          });
        }
      }
    });
    this.#search = this.#db.query<
      { emoji: string; score: number },
      { $embedding: Float32Array; $top_k: number }
    >(`
      with similar_emoji_embedding_vss as (
        select rowid, distance
        from emoji_embedding_vss
        where vss_search(embedding, $embedding)
        limit $top_k
      ),
      similar_emoji as (
        select emoji_id, sum(distance) as distance_sum, count(*) as similar_emoji_count
        from emoji_has_emoji_embedding
        join similar_emoji_embedding_vss on emoji_embedding_id=similar_emoji_embedding_vss.rowid
        group by emoji_id
        limit $top_k
      ),
      emoji_embedding_count_by_similar_emoji as (
        select emoji_id, count(*) as total, distance_sum, similar_emoji_count
        from emoji_has_emoji_embedding
        join similar_emoji using(emoji_id)
        group by emoji_id
      )
      select emoji, total, distance_sum, similar_emoji_count, (((total-similar_emoji_count)*2.8+distance_sum)/(total)) as score
      from emoji
      join emoji_embedding_count_by_similar_emoji on id=emoji_id
      order by score
      limit $top_k
    `);
  }
  insertBulk(rows: Emoji[]) {
    this.#insertBulk(rows);
  }
  search(embedding: Float32Array, topK = 1) {
    return this.#search.all({
      $embedding: embedding,
      $top_k: topK,
    });
  }
  exists() {
    return this.#isInitialRun.get() != null;
  }
  [Symbol.dispose]() {
    this.#db.close();
  }
}
