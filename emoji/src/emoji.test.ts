import { expect, test } from "bun:test";
import { parse } from "./emoji";

test("parse", async () => {
  const text = `231A..231B    ; Basic_Emoji                  ; watch..hourglass done                                          # E0.6   [2] (⌚..⌛)
23E9..23EC    ; Basic_Emoji                  ; fast-forward button..fast down button                          # E0.6   [4] (⏩..⏬)
1F0CF         ; Basic_Emoji                  ; joker                                                          # E0.6   [1] (🃏)
0023 FE0F 20E3; Emoji_Keycap_Sequence        ; keycap: \\x{23}                                                 # E0.6   [1] (#️⃣)
1F469 200D 1F469 200D 1F467 200D 1F467      ; RGI_Emoji_ZWJ_Sequence  ; family: woman, woman, girl, girl                               # E2.0   [1] (👩‍👩‍👧‍👧)`;
  const emojis = [...parse(text)];
  expect(emojis).toMatchObject([
    {
      emoji: "⌚",
      type: "Basic_Emoji",
    },
    {
      emoji: "⌛",
      type: "Basic_Emoji",
    },
    {
      emoji: "⏩",
      type: "Basic_Emoji",
    },
    {
      emoji: "⏪",
      type: "Basic_Emoji",
    },
    {
      emoji: "⏫",
      type: "Basic_Emoji",
    },
    {
      emoji: "⏬",
      type: "Basic_Emoji",
    },
    {
      emoji: "🃏",
      type: "Basic_Emoji",
    },
    {
      emoji: "#️⃣",
      type: "Emoji_Keycap_Sequence",
    },
    {
      emoji: "👩‍👩‍👧‍👧",
      type: "RGI_Emoji_ZWJ_Sequence",
    },
  ]);
});
