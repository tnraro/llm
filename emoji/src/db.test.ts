import { expect, test } from "bun:test";
import { Db } from "./db";

const createEmbedding = (value: number) =>
  new Float32Array(Array.from({ length: 512 }, () => value));

test("init", () => {
  using db = new Db({ dimensions: 512 });
});

test("insertBulk", () => {
  using db = new Db({ dimensions: 512 });
  db.insertBulk([
    {
      emoji: "📒",
      embeddings: [
        { text: "공책", embedding: createEmbedding(0) },
        { text: "노트", embedding: createEmbedding(0.1) },
        { text: "원장", embedding: createEmbedding(0.2) },
      ],
    },
  ]);
});

test("search", () => {
  using db = new Db({ dimensions: 512 });
  db.insertBulk([
    {
      emoji: "📒",
      embeddings: [
        { text: "공책", embedding: createEmbedding(0) },
        { text: "노트", embedding: createEmbedding(0.1) },
        { text: "원장", embedding: createEmbedding(0.2) },
      ],
    },
    {
      emoji: "📔",
      embeddings: [
        { text: "공책", embedding: createEmbedding(0) },
        { text: "노트", embedding: createEmbedding(0.1) },
        { text: "표지가 있는 노트", embedding: createEmbedding(0.5) },
      ],
    },
    {
      emoji: "📃",
      embeddings: [
        { text: "안으로 말린 문서", embedding: createEmbedding(0.7) },
        { text: "페이지", embedding: createEmbedding(1.1) },
      ],
    },
    {
      emoji: "💹",
      embeddings: [
        { text: "시장 호황", embedding: createEmbedding(2) },
        { text: "엔화 관련 상승하는 그래프", embedding: createEmbedding(3) },
        { text: "호황", embedding: createEmbedding(2.5) },
      ],
    },
    {
      emoji: "🧲",
      embeddings: [
        { text: "말굽 자석", embedding: createEmbedding(5.3) },
        { text: "자석", embedding: createEmbedding(5) },
        { text: "편자", embedding: createEmbedding(5.7) },
      ],
    },
  ]);
  const result = db.search(createEmbedding(0), 3);
  expect(result).toBeArray();
  expect(result.length).toBeLessThanOrEqual(3);
  expect(result).toMatchObject([{ emoji: "📔" }, { emoji: "📒" }]);
});

test("ab issue", () => {
  using db = new Db({ dimensions: 512 });
  db.insertBulk([
    {
      emoji: "🆎",
      embeddings: [
        { text: "AB", embedding: createEmbedding(0) },
        { text: "에이비형", embedding: createEmbedding(1) },
        { text: "혈액형 에이비형", embedding: createEmbedding(1.5) },
        { text: "AB", embedding: createEmbedding(0) },
        { text: "AB button (blood type)", embedding: createEmbedding(2.5) },
        { text: "blood type", embedding: createEmbedding(2) },
      ],
    },
  ]);
});

test("load", () => {
  using db = new Db({ dimensions: 512 });
  expect(db.isInitialRun).toBe(true);
  expect(db.exists()).toBe(true);
});
