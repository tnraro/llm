import { test, expect, describe } from "bun:test";
import { BunSqliteStore } from "./store";

describe("store", () => {
	describe("BunSqliteStore", () => {
		test("init", () => {
			const store = new BunSqliteStore();
			store.init();
		});
		test("version", () => {
			const store = new BunSqliteStore();
			store.init();
			expect(store.version()).toBeString();
		});
		test("insert", () => {
			const store = new BunSqliteStore();
			store.init();
			store.insert({
				url: "/test",
				title: "Test Title",
				content: "test content",
				contentEmbedding: new Float32Array(512),
			});
			store.insert({
				url: "/test/2",
				title: "Test Title 2",
				content: "test content 2",
				contentEmbedding: new Float32Array(512),
			});
			store.insert({
				url: "/test",
				title: "Test Title 3",
				content: "test content 3",
				contentEmbedding: new Float32Array(512),
			});
			expect(store.get("/test/2")).toStrictEqual({
				url: "/test/2",
				title: "Test Title 2",
				content: "test content 2",
			});
			expect(store.get("/test")).toStrictEqual({
				url: "/test",
				title: "Test Title 3",
				content: "test content 3",
			});
		});
		test("search", () => {
			const store = new BunSqliteStore();
			store.init();
			store.insert({
				url: "/cat",
				title: "cat",
				content: "I am a cat",
				contentEmbedding: new Float32Array(512),
			});
			store.insert({
				url: "/feline",
				title: "feline",
				content: "I am a feline",
				contentEmbedding: new Float32Array(
					Array.from({ length: 512 }, () => 0.01),
				),
			});
			store.insert({
				url: "/dog",
				title: "dog",
				content: "I am a dog",
				contentEmbedding: new Float32Array(
					Array.from({ length: 512 }, () => 1),
				),
			});
			expect(store.search(new Float32Array(512))).toStrictEqual([
				{
					rowid: 1,
					distance: 0,
					url: "/cat",
					title: "cat",
					content: "I am a cat",
				},
				{
					rowid: 2,
					distance: 0.05119997262954712,
					url: "/feline",
					title: "feline",
					content: "I am a feline",
				},
			]);
		});
	});
});
