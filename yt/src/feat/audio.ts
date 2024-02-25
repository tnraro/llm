import { $, env, file, write } from "bun";

export const downloadAudio = async (input: string, output: string) => {
  await $`${env.YT_DLP} -f ba -o ${output} ${input}`;
}

export const convertToWav = async (input: string, output: string) => {
  await $`${env.FFMPEG} -vn -i ${input} -c:a pcm_s16le -ac 1 -ar 16000 ${output} -y`
}

export const recognizeSpeech = async (input: string) => {
  await $`${env.WHISPER_MAIN} -otxt -np -l auto -m ${env.WHISPER_MODEL} -f ${input}`;
}

export const postRecognizeSpeech = async (input: string, output: string) => {
  const text = await file(input).text();
  await write(output, [...text
    .replaceAll(/\[[^\]]+?\]|\([^)]+?\)/g, "")
    .matchAll(/(?<=^\s*)\S.*?(?=\s*$)/gm)].join("\n"));
}