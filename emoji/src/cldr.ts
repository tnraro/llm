import { annotationsDerived } from "cldr-annotations-derived-modern/annotationsDerived/ko/annotations.json";
import { annotations } from "cldr-annotations-modern/annotations/ko/annotations.json";

export const emojis = new Map<string, string>();

for (const key of Object.keys(
  annotationsDerived.annotations,
) as (keyof typeof annotationsDerived.annotations)[]) {
  emojis.set(key, annotationsDerived.annotations[key].tts[0]);
}
for (const key of Object.keys(
  annotations.annotations,
) as (keyof typeof annotations.annotations)[]) {
  emojis.set(key, annotations.annotations[key].tts[0]);
}
