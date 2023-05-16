import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { readLines } from "https://deno.land/std/io/mod.ts";
import { hiraToRoma, romaToHira } from "./mod.js";

function kanaToHira(str) {
  return str.replace(/[ァ-ヶ]/g, function (match) {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

const dicts = [
  "SudachiDict/src/main/text/small_lex.csv",
  "SudachiDict/src/main/text/core_lex.csv",
  "SudachiDict/src/main/text/notcore_lex.csv",
];

async function testSudachi(dicts) {
  for (const dict of dicts) {
    const fileReader = await Deno.open(dict);
    for await (const line of readLines(fileReader)) {
      const yomiKana = line.split(",")[11];
      if (!yomiKana.match(/^[ァ-ヶーゐゑ-]+$/)) continue;
      const yomiHira = kanaToHira(yomiKana);
      const yomiFrom = yomiHira.replace(/-/g, "ー");
      const yomiTo = romaToHira(hiraToRoma(yomiFrom));
      assertEquals(yomiFrom, yomiTo);
    }
    fileReader.close();
  }
}

function testHira(hira) {
  const yomiFrom = hira.replace(/-/g, "ー");
  const yomiTo = romaToHira(hiraToRoma(hira));
  assertEquals(yomiFrom, yomiTo);
}

function testHiraRoma(hira, romaTest) {
  hira = hira.replace(/-/g, "ー");
  const roma = hiraToRoma(hira);
  assertEquals(roma, romaTest);
}

Deno.test("Simple check", () => {
  testHira("-");
  testHira("ゐゑ");
  testHira("っっっ");
  testHira("はがっにゃ");
  testHira("ぎじゅつしゃ");
  testHira("吉野家");
  testHira("😄💢✋");
  testHira("👨‍👩‍👧‍👦");
});
Deno.test("XTU check", () => {
  testHiraRoma("あっー", "axtu-");
  testHiraRoma("あっあ", "axtua");
  testHiraRoma("あっい", "axtui");
  testHiraRoma("あっう", "axtuu");
  testHiraRoma("あっえ", "axtue");
  testHiraRoma("あっお", "axtuo");
  testHiraRoma("あっな", "axtuna");
  testHiraRoma("あっに", "axtuni");
  testHiraRoma("あっぬ", "axtunu");
  testHiraRoma("あっね", "axtune");
  testHiraRoma("あっの", "axtuno");
});
Deno.test("Shortest check", () => {
  testHiraRoma("あかちゃん", "akachann");
  testHiraRoma("ぎじゅつしゃ", "gijutsusha");
  testHiraRoma("かがくしゃ", "kagakusha");
  testHiraRoma("けっしょう", "kesshou");
  testHiraRoma("がっこう", "gakkou");
});
Deno.test("SudachiDict", async () => {
  await testSudachi(dicts);
});
