import { Database } from "bun:sqlite";
import { load } from "sqlite-vss";
import { dirname } from "path";

crypto.getRandomValues(new BigInt64Array(1));

export interface Store {
	version(): string;
	init(): void;
	insert(data: Article): void;
	get(url: string): { url: string } | null;
	contains(urls: string[]): string[];
	[Symbol.dispose](): void;
}

interface Article {
	url: string;
	title: string;
	content: string;
}

export class BunSqliteStore implements Store {
	#db;
	constructor(filename?: string) {
		this.#db = new Database(filename);
	}
	init() {
		load(this.#db);
		this.#db.exec("PRAGMA journal_mode = WAL;");
		this.#db.exec(`create virtual table if not exists vss_article using vss0(
      vss_content(512)
    );`);
		this.#db.exec(`create table if not exists article (
      url text primary key,
      title text not null,
      content text not null
    );`);
	}
	insert(
		article: Article & {
			contentEmbedding: Float32Array;
		},
	): void {
		this.#db.transaction(() => {
			const { rowid } = this.#db
				.query(
					`insert into article(url, title, content)
					 values($url, $title, $content)
					 on conflict(url) do update
					 set
						 title=excluded.title,
					   content=excluded.content
					 returning rowid`,
				)
				.get({
					$url: article.url,
					$title: article.title,
					$content: article.content,
				}) as { rowid: number };
			this.#db.query("delete from vss_article where rowid=$rowid").run({
				$rowid: rowid,
			});
			this.#db
				.query(
					`insert or replace into vss_article(rowid, vss_content)
				 	 values($rowid, $vss_content)`,
				)
				.run({
					$rowid: rowid,
					$vss_content: article.contentEmbedding,
				});
		})();
	}
	get(url: string) {
		return this.#db
			.query("select * from article where url=$url;")
			.get({ $url: url }) as Article | null;
	}
	search(
		queryEmbedding: Float32Array,
		options?: { distance?: number; limit?: number },
	) {
		const opt = {
			distance: 2,
			limit: 3,
			...options,
		};
		return this.#db
			.query(`with results as (
									select rowid, distance from vss_article
									where vss_search(vss_content, $query_embedding)
										and distance < $distance
									limit $limit
								)
								select * from article
								join results on article.rowid=results.rowid`)
			.all({
				$query_embedding: queryEmbedding,
				$distance: opt.distance,
				$limit: opt.limit,
			}) as (Article & { rowid: number, distance: number })[];
	}
	/** @deprecated */
	contains(urls: string[]) {
		return this.#db.transaction((urls: string[]) =>
			urls
				.map(
					(url) =>
						(
							this.#db
								.query("select url from article where url=$url")
								.get({ $url: url }) as Pick<Article, "url"> | null
						)?.url,
				)
				.filter(<T>(url: T | null): url is T => url != null),
		)(urls);
	}
	version(): string {
		const res = this.#db.prepare("select vss_version() as version").get() as {
			version: string;
		};
		if (res == null) throw new Error("no such function: vss_version");
		return res.version;
	}
	[Symbol.dispose]() {
		this.#db.close();
	}
}
