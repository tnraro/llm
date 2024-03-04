import { file } from "bun";
import { convertToWav, downloadAudio, downloadAudio as downloadYtAudio, postRecognizeSpeech, recognizeSpeech } from "../feat/audio";
import { convertVttToText, downloadYtSubtitle } from "../feat/subtitle";
import { cache } from "../lib/cache";
import { exists } from "../lib/fs";
import { parseId } from "../lib/yt";

export const dlyt = (link: string) => {
  const id = parseId(link);
  if (id == null) throw new Error(`not valid yt id`);
  const key = `.cache/${id}`;
  const vtt = `.cache/${id}.en.vtt`;
  const txt = `.cache/${id}.txt`;
  const wav = `.cache/${id}.wav`;
  const wavTxt = `.cache/${id}.wav.txt`

  return async () => {
    if (!await exists(txt)) {
      await downloadYtSubtitle(id, vtt);
    }
    if (await exists(vtt)) {
      await convertVttToText(vtt, txt);
    } else {
      if (!await cache(key))
        await downloadAudio(id, key);
      if (!await cache(wav, key))
        await convertToWav(key, wav);
      if (!await cache(wavTxt, wav))
        await recognizeSpeech(wav);
      if (!await cache(txt, wavTxt))
        await postRecognizeSpeech(wavTxt, txt);
    }
    if (await exists(txt)) {
      return {
        content: await file(txt).text(),
      }
    }
    throw new Error("no txt");
  }
}