export const splitToChunks = (content: string, size = 1024, padding = 4) => {
  const lines: { text: string, byteLength: number }[] = [];
  const encoder = new TextEncoder();
  for (const m of content.matchAll(/(?<=^\s*)\S.*?(?=\s*$)/gm)) {
    const line = m[0]
    const byteLength = encoder.encode(line).byteLength;
    lines.push({
      text: line,
      byteLength,
    });
  }
  return lines.reduce((o, line) => {
    const lastElement = o.at(-1);
    if (lastElement == null) {
      o.push({
        texts: [line.text],
        byteLength: line.byteLength
      });
    } else {
      const sum = line.byteLength + lastElement.byteLength;
      if (sum <= size) {
        lastElement.texts.push(line.text);
        lastElement.byteLength = sum;
      } else {
        const paddingLines = lastElement.texts.slice(-padding);
        o.push({
          texts: [...paddingLines, line.text],
          byteLength: line.byteLength // does not include padding
        });
      }
    }
    return o;
  }, [] as { texts: string[], byteLength: number }[])
    .map(line => line.texts.join(" "));
}