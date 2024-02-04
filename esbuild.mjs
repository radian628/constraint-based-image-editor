import * as process from "process";
import * as esbuild from "esbuild";
import { lessLoader } from "esbuild-plugin-less";
import { copy } from "esbuild-plugin-copy";

const dev = process.argv.includes("dev");

const ctx = await esbuild.context({
  outdir: "build",
  entryPoints: ["src/index.tsx", "src/examples/**/*.tsx"],
  bundle: true,
  plugins: [
    lessLoader(),
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./src/**/*.html"],
        to: ["./build/"],
      },
    }),
  ],
  loader: {
    ".png": "dataurl",
    ".svg": "dataurl",
    ".obj": "dataurl",
  },
  sourcemap: dev,
  minify: !dev,
});

if (dev) {
  console.log("Watching...");
  await ctx.watch();
} else {
  console.log("Building...");
  await ctx.build();
}
