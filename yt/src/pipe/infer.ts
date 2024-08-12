import { autoInfer } from "../feat/llm"

export const infer = (system: string) => async (content: string | string[]) => await autoInfer(system, content)
