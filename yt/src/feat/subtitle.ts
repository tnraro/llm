import { $, env, file, write } from "bun";
import { normalizeText, parseVtt } from "../lib/st";

export const downloadYtSubtitle = async (input: string, output: string) => {
  await $`${env.YT_DLP} --skip-download -o ${output} --write-subs --convert-subs vtt --sub-lang en ${input}`;
}

export const convertVttToText = async (input: string, output: string) => {
  await write(output, normalizeText(parseVtt(await file(input).text())));
}