import { annotationsDerived } from "cldr-annotations-derived-modern/annotationsDerived/ko/annotations.json";
import { annotations } from "cldr-annotations-modern/annotations/ko/annotations.json";

export const codePointsToEmoji = (cps: string[]) => {
  return String.fromCodePoint(...cps.map((cp) => parseInt(cp, 16)));
};
const getAnnotation = (
  emoji: string,
): { default: string[]; tts: string[] } | undefined => {
  return (
    annotations.annotations[emoji as keyof typeof annotations.annotations] ??
    annotationsDerived.annotations[
      emoji as keyof typeof annotationsDerived.annotations
    ]
  );
};
export const getName = (emoji: string) => {
  return getAnnotation(emoji)?.tts[0];
};
export const getNames = (emoji: string) => {
  return getAnnotation(emoji)?.default.join(". ");
};

export function* parse(text: string) {
  const matches = text.matchAll(
    /^(?<code_point>(?:[0-9A-F]{4,5})(?:(?<is_range>\.\.[0-9A-F]{4,5})|(?<is_seq> [0-9A-F]{4,5})+)?)\s*;\s*(?<type_field>Basic_Emoji|Emoji_Keycap_Sequence|RGI_Emoji_(?:Flag|Tag|Modifier|ZWJ)_Sequence)\s*;\s*(?<short_name>.+?)(?=\s*#|$)/gim,
  );
  for (const match of matches) {
    if (match.groups == null) continue;
    const { code_point, type_field, is_range, is_seq } = match.groups;
    if (is_range != null) {
      const [begin, end] = code_point.split("..").map((cp) => parseInt(cp, 16));
      for (let cp = begin; cp <= end; cp++) {
        const emoji = String.fromCodePoint(cp);
        const name = getName(emoji);
        if (name == null)
          throw new Error(`Unknown emoji: ${emoji} ${cp.toString(16)}`);
        yield {
          emoji,
          type: type_field,
          name,
        };
      }
    } else if (is_seq != null) {
      const cps = code_point.split(/\s+/g).map((cp) => parseInt(cp, 16));
      const emoji = String.fromCodePoint(...cps);

      const name = getName(
        (() => {
          const _cps = cps.filter(
            (cp) => cp !== 0xfe0f /* VARIATION SELECTOR-16 */,
          );
          return String.fromCodePoint(..._cps);
        })(),
      );
      if (name == null)
        throw new Error(`Unknown emoji: ${emoji} ${code_point}`);
      yield {
        emoji,
        type: type_field,
        name,
      };
    } else {
      const emoji = codePointsToEmoji([code_point]);
      const name = getName(emoji);
      if (name == null)
        throw new Error(`Unknown emoji: ${emoji} ${code_point}`);
      yield {
        emoji,
        type: type_field,
        name,
      };
    }
  }
}

export const getEmojis = async () => {
  const [r0, r1] = await Promise.all(
    [
      "https://unicode.org/Public/emoji/15.1/emoji-sequences.txt",
      "https://unicode.org/Public/emoji/15.1/emoji-zwj-sequences.txt",
    ].map((url) => fetch(url).then((res) => res.text())),
  );
  return [...parse(r0), ...parse(r1)];
};
