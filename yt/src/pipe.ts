import { file, hash, write } from "bun";
import { convertToWav, downloadAudio, postRecognizeSpeech, recognizeSpeech } from "./feat/audio";
import { autoInfer, mapReduce } from "./feat/llm";
import { convertToText as convertToTxt, downloadSubtitle } from "./feat/subtitle";
import { cache, getCache, setCache } from "./lib/cache";
import { splitToChunks } from "./lib/chunk";
import { measureTime } from "./lib/time";
import { parseId } from "./lib/yt";

interface PipelineContext {
  id: string;
  content: string | string[];
}

export class Pipeline {
  #context: PipelineContext;
  constructor(link: string) {
    const id = parseId(link)!;
    this.#context = {
      id,
      content: "",
    }
  }
  async pipe(type: PipeType, cache?: boolean) {
    using _ = measureTime(type);
    if (cache != null) {
      const key = this.#context.id + type;
      const hashed = hash(JSON.stringify(this.#context));
      if (cache) {
        const content = getCache(key, hashed);
        if (content != null) {
          this.#context.content = content;
          return;
        }
      }
      await intrinsicPipe[type](this.#context);
      setCache(key, hashed, this.#context.content);
    } else {
      await intrinsicPipe[type](this.#context);
    }
  }
  get id() {
    return this.#context.id;
  }
  get content() {
    return this.#context.content;
  }
}

export type PipeType = keyof typeof intrinsicPipe;
const intrinsicPipe = {
  "download-subtitle": async (context: PipelineContext) => {
    const { id } = context;
    const key = `.cache/${id}`;
    const vtt = `.cache/${id}.en.vtt`;
    const txt = `.cache/${id}.txt`;
    const wav = `.cache/${id}.wav`;
    const wavTxt = `.cache/${id}.wav.txt`
    if (!await file(txt).exists()) {
      await downloadSubtitle(id, key);
    }
    if (await file(vtt).exists()) {
      await convertToTxt(vtt, txt);
    } else {
      if (!await cache(key))
        await downloadAudio(id, key);
      if (!await cache(wav, key))
        await convertToWav(key, wav);
      if (!await cache(wavTxt, wav))
        await recognizeSpeech(wav);
      if (!await cache(txt, wavTxt))
        await postRecognizeSpeech(wavTxt, txt);
    }
    if (await file(txt).exists()) {
      context.content = await file(txt).text();
    }
  },
  "split-to-chunks": async (context: PipelineContext) => {
    const { id, content } = context;
    if (typeof content !== "string") {
      context.content = content;
      return;
    }
    const chunks = splitToChunks(content, 1024);
    context.content = chunks;
  },
  "map": async (context: PipelineContext) => {
    const system = `The text content is a set of documents. Based on this list of docs, please identify the main themes`;
    context.content = await autoInfer(system, context.content);
  },
  "reduce": async (context: PipelineContext) => {
    const system = `The text content is set of summaries. Take these and distill it into a final, consolidated summary of the main themes.`
    context.content = await autoInfer(system, context.content);
  },
  "map-reduce": async (context: PipelineContext) => {
    let content = context.content
    if (typeof content === "string") {
      content = splitToChunks(content, 1024);
    }
    context.content = await mapReduce(content);
  },
  "summarize": async (context: PipelineContext) => {
    const system = "Your task is to summarize the content. I will tip $200. Write the content like you're explaining it to beginner in field. Answer given in a natural human-like manner. Let's think step-by-step.";
    context.content = await autoInfer(system, context.content);
  },
  "improve-readability": async (context: PipelineContext) => {
    const system = "Improve the readability of the content. I will tip $200. Answer given in a natural human-like manner. Let's think step-by-step.";
    context.content = await autoInfer(system, context.content);
  },
  "translate-to-korean": async (context: PipelineContext) => {
    const system = "Translate the content into Korean.";
    context.content = await autoInfer(system, context.content);
  },
  "adjust-tone-to-professional": async (context: PipelineContext) => {
    const system = "Let's think step-by-step. Adjust the tone of the content to fit a professional context.";
    context.content = await autoInfer(system, context.content);
  },
};