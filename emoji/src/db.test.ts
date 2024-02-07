import { test, expect } from "bun:test";
import { Db } from "./db";

const createEmbedding = (value: number) =>
  new Float32Array(Array.from({ length: 512 }, () => value));

test("init", () => {
  using db = new Db();
});

test("insert", () => {
  using db = new Db();
  db.insert({
    unicode: "📒",
    ko: { description: "노트", embedding: createEmbedding(0) },
  });
});

test("search", () => {
  using db = new Db();
  db.insert({
    unicode: "📒",
    ko: { description: "노트", embedding: createEmbedding(0) },
  });
  db.insert({
    unicode: "📔",
    ko: { description: "표지가 있는 노트", embedding: createEmbedding(0.1) },
  });
  db.insert({
    unicode: "📃",
    ko: { description: "안으로 말린 문서", embedding: createEmbedding(0.7) },
  });
  db.insert({
    unicode: "💹",
    ko: {
      description: "엔화 관련 상승하는 그래프",
      embedding: createEmbedding(1),
    },
  });
  db.insert({
    unicode: "🧲",
    ko: { description: "자석", embedding: createEmbedding(2) },
  });
  const result = db.search(createEmbedding(0), 3);
  expect(result).toStrictEqual([
    { unicode: "📒", ko: "노트", distance: 0 },
    {
      distance: 5.119997501373291,
      ko: "표지가 있는 노트",
      unicode: "📔",
    },
    {
      distance: 250.87989807128906,
      ko: "안으로 말린 문서",
      unicode: "📃",
    },
  ]);
});
