import { globby } from "globby";
import path from "path";
import { check } from "../check/mod.js";

export interface TreecheOptions {
  inputs: string[];
  excludes?: string[];
  entryPoint?: string;
  pureFunctions?: string[];
}

export const treeche: (options: TreecheOptions) => Promise<void> =
  async function ({
    inputs: rawInputs,
    excludes: rawExcludes,
    entryPoint,
    pureFunctions,
  }) {
    const targetFiles = await (async () => {
      if (entryPoint) {
        return [path.join(process.cwd(), entryPoint)];
      }
      const inputs = await globby(rawInputs);
      const excludes = rawExcludes ? await globby(rawExcludes) : [];
      return inputs
        .filter((input) => {
          return !excludes.includes(input);
        })
        .map((file) => path.join(process.cwd(), file));
    })();

    const results = await Promise.all(
      targetFiles.map(
        async (file) => await check(file, !!entryPoint, pureFunctions ?? [])
      )
    );
    if (results.every((result) => result.shaken)) {
      console.log("Congratulation 🎉 All files are tree-shakeable ✨");
      return;
    }

    for (const result of results) {
      if (!result.shaken) {
        console.log(
          `🚨 ${result.file} is not tree-shakable due to the following code:`
        );
        console.log("");
        console.log("```");
        for (const diagnostic of result.diagnostics) {
          console.log(diagnostic);
        }
        console.log("```");
        console.log("");
        console.log("");
      }
    }
  };
