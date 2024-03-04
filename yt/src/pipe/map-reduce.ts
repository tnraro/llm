import { autoInfer } from "../feat/llm";

export const mr = async ({ content }: { content: string | string[] }) => {
  if (typeof content === "string") throw new Error(`not string[]`);
  const summarizations = await autoInfer(`Summarize it in one sentence.`, content);
  if (typeof summarizations === "string") throw new Error(`not string[]`);
  const res = await autoInfer(`Summarize it and extract some key points.`, summarizations.join(" "));
  return {
    content: res,
  }
};