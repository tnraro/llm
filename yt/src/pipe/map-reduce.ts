import { autoInfer } from "../feat/llm";

export const mr = async (content: string[]) => {
  const summarizations = await autoInfer(`Summarize it in one sentence.`, content);
  if (typeof summarizations === "string") throw new Error(`not string[]`);
  return await autoInfer(`Summarize it and extract some key points.`, summarizations.join(" "))
};