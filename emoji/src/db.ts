import { Database } from "bun:sqlite";
import { load } from "sqlite-vss";

interface Emoji {
  emoji: string;
  ko: { description: string; embedding: Float32Array };
}
interface Row {
  emoji: string;
  ko: string;
  distance: number;
}

export class Db {
  #db;
  #insertEmoji;
  #insertEmojiVss;
  #insert;
  #insertBulk;
  #search;
  #isInitialRun;
  readonly isInitialRun;
  constructor(filename?: string) {
    this.#db = new Database(filename);
    load(this.#db);
    this.#db.exec("PRAGMA journal_mode = WAL;");
    this.#isInitialRun = this.#db.prepare(
      "select name from sqlite_master where type='table' and name='emoji'",
    );
    this.isInitialRun = this.#isInitialRun.get() == null;
    this.#db.exec(`
      create table if not exists emoji (
        id integer primary key autoincrement,
        emoji text not null unique,
        ko text not null
      );
      create virtual table if not exists emoji_vss using vss0(
        ko(512)
      );
    `);
    this.#insertEmoji = this.#db.query(
      "insert into emoji (emoji, ko) values ($emoji, $ko) returning id",
    );
    this.#insertEmojiVss = this.#db.query(
      "insert into emoji_vss(rowid, ko) values ($id, $ko)",
    );
    this.#insert = this.#db.transaction((row: Emoji) => {
      const { id } = this.#insertEmoji.get({
        $emoji: row.emoji,
        $ko: row.ko.description,
      }) as { id: number };
      this.#insertEmojiVss.run({
        $id: id,
        $ko: row.ko.embedding,
      });
    });
    this.#insertBulk = this.#db.transaction((rows: Emoji[]) => {
      for (const row of rows) {
        const { id } = this.#insertEmoji.get({
          $emoji: row.emoji,
          $ko: row.ko.description,
        }) as { id: number };
        this.#insertEmojiVss.run({
          $id: id,
          $ko: row.ko.embedding,
        });
      }
    });
    this.#search = this.#db.query(`
      with similar_emoji as (
        select rowid, distance
        from emoji_vss
        where vss_search(ko, $ko)
        limit $top_k
      )
      select emoji, ko, distance
      from emoji
      join similar_emoji on id=rowid
    `);
  }
  insert(row: Emoji) {
    this.#insert(row);
  }
  insertBulk(rows: Emoji[]) {
    this.#insertBulk(rows);
  }
  search(embedding: Float32Array, topK = 1) {
    return this.#search.all({
      $ko: embedding,
      $top_k: topK,
    }) as Row[];
  }
  exists() {
    return this.#isInitialRun.get() != null;
  }
  [Symbol.dispose]() {
    this.#db.close();
  }
}
