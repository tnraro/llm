import { file } from "bun";
import { convertToWav, postRecognizeSpeech, recognizeSpeech } from "../feat/audio";
import { downloadTs, extractTsInfo } from "../feat/ts";
import { cache } from "../lib/cache";
import { exists } from "../lib/fs";

export const dlts = (m3uLink: string) => {
  return async () => {
    const info = extractTsInfo(m3uLink);
    const key = `.cache/${info.filename}`;
    const ts = `${key}.ts`;
    const wav = `${key}.wav`;
    const wavTxt = `${key}.wav.txt`;
    const txt = `${key}.txt`;

    if (!await cache(ts))
      await downloadTs(m3uLink, ts);
    if (!await cache(wav, ts))
      await convertToWav(ts, wav);
    if (!await cache(wavTxt, wav))
      await recognizeSpeech(wav);
    if (!await cache(txt, wavTxt))
      await postRecognizeSpeech(wavTxt, txt);
    if (await exists(txt)) {
      return {
        content: await file(txt).text(),
      }
    }
    throw new Error("no txt");
  }
}