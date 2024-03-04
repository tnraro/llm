import { answer, autoInfer } from "../feat/llm";

export const asr = (question: string) => {
  return async ({ content }: { content: string | string[] }) => {
    return {
      content: await answer(question, content as string),
    }
  }
}