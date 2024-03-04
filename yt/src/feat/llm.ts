import { splitToChunks } from "../lib/chunk";
import { unmd } from "../lib/md";
import { generate } from "../lib/ollama";

export const infer = async (system: string, content: string) => {
  const res = await generate({
    system,
    prompt: content
  });
  const result = res.response.trim().replaceAll(/\n+(?=\n)/g, "");
  return result;
}

export const inferChunks = async (system: string, chunks: string[]) => {
  const result: string[] = [];
  for (const chunk of chunks) {
    const inferred = await infer(system, chunk);
    result.push(inferred);
  }
  return result;
}

export const autoInfer = async (system: string, contentOrChunks: string | string[]) => {
  if (typeof contentOrChunks === "string") {
    return infer(system, contentOrChunks);
  } else {
    return (await inferChunks(system, contentOrChunks)).join("\n\n");
  }
}

export const mapReduce = async (chunks: string[], limit = 3): Promise<string> => {
  const reducePrompt = "The text content is set of summaries. Take these and distill it into a final, consolidated summary of the main themes."
  const mapPrompt = "The text content is a set of documents. Based on this list of docs, please identify the main themes in 100 words or less";
  if (chunks.length <= limit) {
    return [await autoInfer(mapPrompt, chunks), await autoInfer(reducePrompt, chunks.join(" "))].map(unmd).join("\n\n");
  }
  const mappedChunks = await inferChunks(mapPrompt, chunks);
  const splittedChunks = splitToChunks(mappedChunks.map(x => unmd(x)).join(" "), 1024);
  return await mapReduce(splittedChunks, limit);
}
export const answer = async (context: string, question: string) => {
  const system = "Let's first understand the question, extract the paragraph that best suits for the question, and make a plan. Then, let's carry out the plan step by step, and qoute the best suits sentence.";
  const user = `${context}\nquestion: ${question}`;
  return unmd(await autoInfer(system, user));
}