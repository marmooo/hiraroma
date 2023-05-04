import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { readLines } from "https://deno.land/std/io/mod.ts";
import { hiraToRoma, romaToHira } from "./mod.js";

function kanaToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, function (match) {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

const dicts = [
  "SudachiDict/src/main/text/small_lex.csv",
  "SudachiDict/src/main/text/core_lex.csv",
  "SudachiDict/src/main/text/notcore_lex.csv",
];

async function test(dicts) {
  for (const dict of dicts) {
    const fileReader = await Deno.open(dict);
    for await (const line of readLines(fileReader)) {
      const yomiKana = line.split(",")[11];
      if (yomiKana.match(/[a-zA-Z0-9]+/)) continue;
      const yomiHira = kanaToHira(yomiKana);
      const yomiFrom = yomiHira.replace(/-/g, "ー");
      const yomiTo = romaToHira(hiraToRoma(yomiHira));
      assertEquals(yomiFrom, yomiTo);
    }
    fileReader.close();
  }
}

function testHira(yomiHira) {
  const yomiFrom = yomiHira.replace(/-/g, "ー");
  const yomiTo = romaToHira(hiraToRoma(yomiHira));
  assertEquals(yomiFrom, yomiTo);
}

Deno.test("Simple check", () => {
  testHira("-");
  testHira("っっっ");
  testHira("はがっにゃ");
  testHira("吉野家");
  testHira("😄💢✋");
  testHira("👨‍👩‍👧‍👦");
});
Deno.test("SudachiDict", async () => {
  await test(dicts);
});
