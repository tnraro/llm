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

export const answer = async (content: string | string[], question: string) => {
  const system = "";
  const result = await autoInfer(system, user());
  if (typeof result === "string") {
    return unmd(result);
  }
  return result.map(x => unmd(x));

  function user(): string | string[] {
    if (typeof content === "string") return `${content}\nquestion: ${question}`;
    return content.map(c => `${content}\nquestion: ${question}`);
  }
}