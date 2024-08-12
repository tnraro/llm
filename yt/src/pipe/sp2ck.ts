import { splitToChunks } from "../lib/chunk";

export const sp2ck = (size: number) => (content: string | string[]): string[] => {
  if (typeof content !== "string") {
    return content;
  }
  const chunks = splitToChunks(content, size);
  return chunks
}
