import { autoInfer } from "../feat/llm"

export const infer = (system: string) => {
  return async ({ content }: { content: string | string[] }) => {
    return {
      content: await autoInfer(system, content),
    }
  }
}