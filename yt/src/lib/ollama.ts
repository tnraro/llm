import { env } from "bun";

export interface NoStreamResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context: number[];
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

const req = async (path: string, options?: FetchRequestInit) => {
  const res = await fetch(`${env.OLLAMA_ORIGIN}${path}`, options);
  if (!res.ok) throw res;
  return res.json();
}
export const generate = async (options?: { system?: string, prompt?: string }) => {
  const { system, prompt } = { ...options };

  return await req("/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: env.OLLAMA_MODEL,
      system,
      prompt,
      stream: false,
    })
  }) as NoStreamResponse
}