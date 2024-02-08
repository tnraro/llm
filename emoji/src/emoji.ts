import en0 from "cldr-annotations-derived-modern/annotationsDerived/en/annotations.json";
import ko0 from "cldr-annotations-derived-modern/annotationsDerived/ko/annotations.json";
import en1 from "cldr-annotations-modern/annotations/en/annotations.json";
import ko1 from "cldr-annotations-modern/annotations/ko/annotations.json";

export const codePointsToEmoji = (cps: string[]) => {
  return String.fromCodePoint(...cps.map((cp) => parseInt(cp, 16)));
};
const getAnnotation = (
  emoji: string,
  lang: "en" | "ko",
): { default: string[]; tts: string[] } | undefined => {
  if (lang === "ko") {
    return (
      ko1.annotations.annotations[
        emoji as keyof typeof ko1.annotations.annotations
      ] ??
      ko0.annotationsDerived.annotations[
        emoji as keyof typeof ko0.annotationsDerived.annotations
      ]
    );
  }
  if (lang === "en") {
    return (
      en1.annotations.annotations[
        emoji as keyof typeof en1.annotations.annotations
      ] ??
      en0.annotationsDerived.annotations[
        emoji as keyof typeof en0.annotationsDerived.annotations
      ]
    );
  }
};
/**
 * @deprecated
 */
export const getName = (emoji: string) => {
  return getAnnotation(emoji, "ko")?.tts[0];
};
export const getNames = (emoji: string) => {
  return [
    ...(getAnnotation(emoji, "ko")?.default ?? []),
    ...(getAnnotation(emoji, "en")?.default ?? []),
  ];
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
        const names = getNames(emoji);
        if (names == null)
          throw new Error(`Unknown emoji: ${emoji} ${cp.toString(16)}`);
        yield {
          emoji,
          type: type_field,
          names,
        };
      }
    } else if (is_seq != null) {
      const cps = code_point.split(/\s+/g).map((cp) => parseInt(cp, 16));
      const emoji = String.fromCodePoint(...cps);

      const names = getNames(
        (() => {
          const _cps = cps.filter(
            (cp) => cp !== 0xfe0f /* VARIATION SELECTOR-16 */,
          );
          return String.fromCodePoint(..._cps);
        })(),
      );
      if (names == null)
        throw new Error(`Unknown emoji: ${emoji} ${code_point}`);
      yield {
        emoji,
        type: type_field,
        names,
      };
    } else {
      const emoji = codePointsToEmoji([code_point]);
      const names = getNames(emoji);
      if (names == null)
        throw new Error(`Unknown emoji: ${emoji} ${code_point}`);
      yield {
        emoji,
        type: type_field,
        names,
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
