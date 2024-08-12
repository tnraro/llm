import { answer } from "../feat/llm";

export const asr = (question: string) => async (content: string | string[]) => await answer(content, question)
