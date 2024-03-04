import { file } from "bun"

export const exists = async (path: string) => {
  return await file(path).exists();
}