import { join } from "path";
import { LlamaChatSession, LlamaContext, LlamaModel } from "node-llama-cpp";
import { Db } from "./db";
import { createTextEmbedding } from "./embedding";

const { LLAMA_CPP_MODELS_PATH } = import.meta.env;
if (LLAMA_CPP_MODELS_PATH == null)
  throw new Error("no env: LLAMA_CPP_MODELS_PATH");
using db = new Db("./emoji.sqlite");
using embedding = await createTextEmbedding();

const model = new LlamaModel({
  modelPath: join(
    LLAMA_CPP_MODELS_PATH,
    "WestLake-7B-v2-laser-truthy-dpo.q5_k_m.gguf",
  ),
  gpuLayers: 32,
  useMlock: true,
});

const context = new LlamaContext({ model });
const session = new LlamaChatSession({
  context,
  systemPrompt: `As a word combination expert, you will receive two words separated by commas.
Answer with another word similar to the two words you received.
The word must be a valid word.
Do not respond with any explanation other than the word.
The word must be Korean.
You must answer only one word.`,
});

const genRandomItems = <T>(collection: Set<T>, n: number) => {
  if (collection.size === 0) return [];
  const arr = Array.from(collection);
  return Array.from({ length: n }, () => arr[(Math.random() * arr.length) | 0]);
};

const words = new Set(["물", "불", "땅", "바람"]);
const emojiMap = new Map<string, string>();
const f = async (word: string) => {
  if (emojiMap.has(word)) {
    return `${emojiMap.get(word)} ${word}`;
  }
  const e = await embedding.get(word);
  const row = db.search(e)[0];
  if (row == null) throw new Error(`no matching emoji for "${word}"`);
  emojiMap.set(word, row.unicode);
  return `${row.unicode} ${word}`;
};

const epoch = async () => {
  const [w0, w1] = genRandomItems(words, 2);
  console.log(`User: ${await f(w0)} + ${await f(w1)}`);
  const answer = await session.prompt(`${w0}, ${w1}`);

  const word = answer.replaceAll(/\n.+/g, "").trim();

  if (word.length > 53)
    throw new RangeError(`word.length(${word.length}) > 53`);
  if (!/^[가-힣]+( [가-힣]+)*$/.test(word))
    throw new Error(`no Korean in "${word}"`);
  words.add(word);
  console.log(`                         = ${await f(word)}`);
};

for (let i = 0; i < 20; i++) {
  try {
    await epoch();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}
