import { Database } from "bun:sqlite";
import { load } from "sqlite-vss";

interface Emoji {
  unicode: string;
  ko: { description: string; embedding: Float32Array };
}
interface Row {
  unicode: string;
  ko: string;
  distance: number;
}

export class Db {
  #db;
  #insertEmoji;
  #insertEmojiVss;
  #insert;
  #search;
  constructor(filename?: string) {
    this.#db = new Database(filename);
    load(this.#db);
    this.#db.exec("PRAGMA journal_mode = WAL;");
    this.#db.exec(`
      create table if not exists emoji (
        id integer primary key autoincrement,
        unicode text not null unique,
        ko text not null
      );
      create virtual table if not exists emoji_vss using vss0(
        ko(512)
      );
    `);
    this.#insertEmoji = this.#db.query(
      "insert into emoji (unicode, ko) values ($unicode, $ko) returning id",
    );
    this.#insertEmojiVss = this.#db.query(
      "insert into emoji_vss(rowid, ko) values ($id, $ko)",
    );
    this.#insert = this.#db.transaction((row: Emoji) => {
      const { id } = this.#insertEmoji.get({
        $unicode: row.unicode,
        $ko: row.ko.description,
      }) as { id: number };
      this.#insertEmojiVss.run({
        $id: id,
        $ko: row.ko.embedding,
      });
    });
    this.#search = this.#db.query(`
      with similar_emoji as (
        select rowid, distance
        from emoji_vss
        where vss_search(ko, $ko)
        limit $top_k
      )
      select unicode, ko, distance
      from emoji
      join similar_emoji on id=rowid
    `);
  }
  insert(row: Emoji) {
    this.#insert(row);
  }
  search(embedding: Float32Array, topK = 1) {
    return this.#search.all({
      $ko: embedding,
      $top_k: topK,
    }) as Row[];
  }
  [Symbol.dispose]() {
    this.#db.close();
  }
}
