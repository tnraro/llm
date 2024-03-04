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
    return await inferChunks(system, contentOrChunks);
  }
}

export const answer = async (context: string, question: string) => {
  const system = "Let's first understand the question, extract the paragraph that best suits for the question, and make a plan. Then, let's carry out the plan step by step, and qoute the best suits sentence.";
  const user = `${context}\nquestion: ${question}`;
  const result = await autoInfer(system, user);
  if (typeof result === "string") {
    return unmd(result);
  }
  return result.map(x => unmd(x));
}