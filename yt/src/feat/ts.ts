import { $, write } from "bun";
import { parseM3u } from "../lib/ts";
import { exists } from "../lib/fs";

export const concatTs = async (inputs: string[], output: string) => {
  await $`cat ${inputs} > ${output}`;
}

export const clearTs = async (inputs: string[]) => {
  await $`rm ${inputs}`;
}

export const extractTsInfo = (m3uLink: string) => {
  const url = new URL(m3uLink);
  const { pathname } = url;
  const fileExt = pathname.replace(/.+\/(?=[^/]+$)/, "");
  const filename = fileExt.replace(/\.[^.]+$/, "");
  const dirname = pathname.slice(0, -fileExt.length);

  return {
    filename,
    dirname,
    url,
  }
}

export const downloadTs = async (m3uLink: string, output: string) => {
  const { filename, dirname, url } = extractTsInfo(m3uLink);

  const res = await fetch(m3uLink);
  if (!res.ok) throw res;
  const text = await res.text();
  const { playlist } = parseM3u(text)

  for (const ts of playlist) {
    const _url = new URL(dirname + ts, url.origin);
    if (await exists(`.cache/${ts}`)) {
      continue;
    }
    const res = await fetch(_url.href);
    if (!res.ok) throw res;
    await write(`.cache/${ts}`, res);
  }
  const inputs = playlist.map(input => `.cache/${input}`);
  await concatTs(inputs, output);
  // await clearTs(inputs);
}