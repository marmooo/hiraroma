import { hiraToRoma, romaToHira, table, tree } from "./mod.js";
import { TextLineStream } from "jsr:@std/streams/text-line-stream";
import { assertEquals } from "jsr:@std/assert/equals";

function kanaToHira(str) {
  return str.replace(/[ァ-ヶ]/g, (match) => {
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
    const file = await Deno.open(dict);
    const lineStream = file.readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());
    for await (const line of lineStream) {
      const yomiKana = line.split(",")[11];
      if (!yomiKana.match(/^[ァ-ヶーゐゑ-]+$/)) continue;
      const yomiHira = kanaToHira(yomiKana);
      const yomiFrom = yomiHira.replace(/-/g, "ー");
      const yomiTo = romaToHira(hiraToRoma(yomiFrom));
      assertEquals(yomiFrom, yomiTo);
    }
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

function testRomaHira(roma, hiraTest) {
  const hira = romaToHira(roma);
  assertEquals(hira, hiraTest);
}

function traverse(node, path = [], result = []) {
  if (typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      const newPath = [...path, key];
      traverse(value, newPath, result);
      if (typeof value === "string") {
        const kv = [newPath.join(""), value];
        result.push(kv);
      }
    }
  }
  return result;
}

Deno.test("Simple check", () => {
  testHira("-");
  testHira("!\"#$%&'()=~|@`+*;:<>,./?_･[]{}\\^");
  testHira("！”＃＄％＆’（）〜｜＠｀＋＊；：＜＞、。／？＿・「」｛｝￥＾");
  testHira("ゐゑ");
  testHira("っっっ");
  testHira("はがっにゃ");
  testHira("ぎじゅつしゃ");
  testHira("吉野家");
  testHira("😄💢✋");
  testHira("👨‍👩‍👧‍👦");
});
Deno.test("Single way check", () => {
  traverse(tree).forEach(([roma, hira]) => {
    const tableRoma = table[hira];
    if (!tableRoma) {
      if (roma == "xtu") return assertEquals(hira, "っ");
      if (roma == "xtsu") return assertEquals(hira, "っ");
      if (roma == "ltu") return assertEquals(hira, "っ");
      if (roma == "ltsu") return assertEquals(hira, "っ");
      throw new Error("Missing test definition");
    } else if (roma != tableRoma) {
      assertEquals(tableRoma, hiraToRoma(romaToHira(roma)));
    }
  });
});
Deno.test("Sokuon check", () => {
  testHiraRoma("あっネコ", "axtuネコ");
  testHiraRoma("あっ犬", "axtu犬");
  testHiraRoma("あっ!?", "axtu!?");
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
  testHiraRoma("あっにゃ", "axtunya");
});
Deno.test("Hatsuon check", () => {
  testRomaHira("annnya", "あんにゃ");
  testRomaHira("annya", "あんや");
  testRomaHira("anno", "あんお");
  testRomaHira("annno", "あんの");
  testRomaHira("annki", "あんき");
  testRomaHira("axnnya", "あんにゃ");
  testRomaHira("axnya", "あんや");
  testRomaHira("axno", "あんお");
  testRomaHira("axnno", "あんの");
  testRomaHira("axnki", "あんき");
});
Deno.test("Shortest check", () => {
  testHiraRoma("あかちゃん", "akachann");
  testHiraRoma("ぎじゅつしゃ", "gijutsusha");
  testHiraRoma("かがくしゃ", "kagakusha");
  testHiraRoma("けっしょう", "kesshou");
  testHiraRoma("がっこう", "gakkou");
});
Deno.test("Short hatsuon check", () => {
  testRomaHira("anko", "あんこ");
  testRomaHira("tankobu", "たんこぶ");
  testRomaHira("tantanmenn", "たんたんめん");
  testRomaHira("ponpon", "ぽんぽん");
  testRomaHira("kanjou", "かんじょう");
});
Deno.test("Short sokuon check", () => {
  testRomaHira("alltu", "あっっ");
  testRomaHira("nyokilltu", "にょきっっ");
  testRomaHira("nyokkki", "にょっっき");
  testRomaHira("xxtu", "っっ");
  testRomaHira("xxn", "っん");
});
try {
  Deno.statSync("SudachiDict");
  Deno.test("SudachiDict check", async () => {
    await testSudachi(dicts);
  });
} catch {
  console.warn("test SudachiDict check ... skip");
}
