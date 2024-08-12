export const concat = (delimiter = "\n\n") => (content: string | string[]) => {
  if (typeof content === "string") return content
  return content.join(delimiter)
}