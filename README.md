# hiraroma

ひらがなとローマ字を相互変換します。

## Usage

```
import { hiraToRoma, romaToHira } from "https://raw.githubusercontent.com/marmooo/hiraroma/main/mod.js";

console.log(hiraToRoma("しょうがっこう")); // --> shougakkou
console.log(romaToHira("chuugakkou")); // --> ちゅうがっこう
```

## Test

1. install [SudachiDict](https://github.com/WorksApplications/SudachiDict)
2. `deno test --allow-read`

## License

MIT

## Attribution

- `romaToHira()` is inspired from
  [JavaScriptでローマ字をカタカナに変換する関数](https://qiita.com/recordare/items/35a27f6b88b9413fef91)
- `hiraToRoma()` is inspired from
  [cloneko/kana2romaji](https://github.com/cloneko/kana2romaji)
