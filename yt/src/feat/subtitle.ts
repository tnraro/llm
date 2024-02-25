import { $, env, file, write } from "bun";

export const parseVtt = (text: string) => {
  return [...text
    .replaceAll(/\u2028/g, "\n")
    .matchAll(/(?<=\n\d\d:\d\d:\d\d\.\d\d\d --> \d\d:\d\d:\d\d\.\d\d\d\n).+?(?=\n\n)/gs)].join("\n");
}

export const downloadSubtitle = async (input: string, output: string) => {
  await $`${env.YT_DLP} --skip-download -o ${output} --write-subs --convert-subs vtt --sub-lang en ${input}`;
}

export const convertToText = async (input: string, output: string) => {
  await write(output, parseVtt(await file(input).text()));
}