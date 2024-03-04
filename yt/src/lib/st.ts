export const parseVtt = (text: string) => {
  return [...text
    .replaceAll(/\u2028/g, "\n")
    .matchAll(/(?<=\n\d\d:\d\d:\d\d\.\d\d\d --> \d\d:\d\d:\d\d\.\d\d\d\n).+?(?=\n\n)/gs)].join("\n");
}

export const normalizeText = (text: string) => {
  return text.replaceAll(/\s*\n\s*/, " ");
}
