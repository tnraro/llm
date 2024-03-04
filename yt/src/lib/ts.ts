export const parseM3u = (m3u: string) => {
  if (!m3u.startsWith("#EXTM3U")) throw new Error("");

  const playlist = [...m3u.matchAll(/^[^#].+\.ts/gm)].map(x => x[0]);
  return {
    playlist,
  }
}