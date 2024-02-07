import { annotationsDerived } from "cldr-annotations-derived-modern/annotationsDerived/en/annotations.json";
import { annotations } from "cldr-annotations-modern/annotations/en/annotations.json";

export const codePointsToString = (cps: string[]) => {
  return String.fromCodePoint(...cps.map((cp) => parseInt(cp, 16)));
};
export const getName = (emoji: string) => {
  return (
    annotations.annotations[emoji as keyof typeof annotations.annotations]
      ?.tts[0] ??
    annotationsDerived.annotations[
      emoji as keyof typeof annotationsDerived.annotations
    ]?.tts[0]
  );
};

export function* parse(text: string) {
  const matches = text.matchAll(
    /^(?<code_point>(?:[0-9A-F]{4,5})(?:(?<is_range>\.\.[0-9A-F]{4,5})|(?<is_seq> [0-9A-F]{4,5})+)?)\s*;\s*(?<type_field>Basic_Emoji|Emoji_Keycap_Sequence|RGI_Emoji_(?:Flag|Tag|Modifier|ZWJ)_Sequence)\s*;\s*(?<short_name>.+?)(?=\s*#|$)/gim,
  );
  for (const match of matches) {
    if (match.groups == null) continue;
    const { code_point, type_field, short_name, is_range, is_seq } =
      match.groups;
    if (is_range != null) {
      const [begin, end] = code_point.split("..").map((cp) => parseInt(cp, 16));
      for (let cp = begin; cp <= end; cp++) {
        const emoji = String.fromCodePoint(cp);
        const name = getName(emoji);
        if (name == null) throw new Error(`Unknown emoji: ${emoji} ${cp}`);
        yield {
          emoji,
          type: type_field,
          name,
        };
      }
    } else if (is_seq != null) {
      yield {
        emoji: codePointsToString(code_point.split(/\s+/g)),
        type: type_field,
        name: short_name,
      };
    } else {
      yield {
        emoji: codePointsToString([code_point]),
        type: type_field,
        name: short_name,
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
