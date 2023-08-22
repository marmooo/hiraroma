import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.js"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "hiraroma",
    version: Deno.args[0],
    description: "Convert between hiragana and romaji.",
    license: "MIT",
    main: "mod.js",
    repository: {
      type: "git",
      url: "git+https://github.com/marmooo/hiraroma.git",
    },
    bugs: {
      url: "https://github.com/marmooo/hiraroma/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
