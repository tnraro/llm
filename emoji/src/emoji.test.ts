import { expect, test } from "bun:test";
import { parse } from "./emoji";

test("parse", async () => {
  const text = `231A..231B    ; Basic_Emoji                  ; watch..hourglass done                                          # E0.6   [2] (⌚..⌛)
23E9..23EC    ; Basic_Emoji                  ; fast-forward button..fast down button                          # E0.6   [4] (⏩..⏬)
1F0CF         ; Basic_Emoji                  ; joker                                                          # E0.6   [1] (🃏)
0023 FE0F 20E3; Emoji_Keycap_Sequence        ; keycap: \\x{23}                                                 # E0.6   [1] (#️⃣)
1F469 200D 1F469 200D 1F467 200D 1F467      ; RGI_Emoji_ZWJ_Sequence  ; family: woman, woman, girl, girl                               # E2.0   [1] (👩‍👩‍👧‍👧)`;
  const emojis = [...parse(text)];
  expect(emojis).toStrictEqual([
    {
      emoji: "⌚",
      name: "watch",
      type: "Basic_Emoji",
    },
    {
      emoji: "⌛",
      name: "hourglass done",
      type: "Basic_Emoji",
    },
    {
      emoji: "⏩",
      name: "fast-forward button",
      type: "Basic_Emoji",
    },
    {
      emoji: "⏪",
      name: "fast reverse button",
      type: "Basic_Emoji",
    },
    {
      emoji: "⏫",
      name: "fast up button",
      type: "Basic_Emoji",
    },
    {
      emoji: "⏬",
      name: "fast down button",
      type: "Basic_Emoji",
    },
    {
      emoji: "🃏",
      name: "joker",
      type: "Basic_Emoji",
    },
    {
      emoji: "#️⃣",
      name: "keycap: \\x{23}",
      type: "Emoji_Keycap_Sequence",
    },
    {
      emoji: "👩‍👩‍👧‍👧",
      name: "family: woman, woman, girl, girl",
      type: "RGI_Emoji_ZWJ_Sequence",
    },
  ]);
});
