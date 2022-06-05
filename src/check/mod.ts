import { rollup } from "rollup";
import { parse } from "@babel/parser";
// @ts-ignore
import virtual from "rollup-plugin-virtual";
import { replaceImportWithDummy } from "../replaceImportWithDummy/mod.js";
import { promises as fs } from "fs";
import { compileTypescript } from "../compileTypescript/mod.js";
import typescript from "@rollup/plugin-typescript";

export const check: (
  filename: string,
  shouldBundle: boolean
) => Promise<{
  file: string;
  shaken: boolean;
  diagnostics: string[];
}> = async function (filename, shouldBundle) {
  const fileContent = await fs.readFile(filename, "utf8");
  const bundled = await rollup({
    input: "__treeche__entry__",
    plugins: [
      virtual({
        __treeche__entry__: `import "${
          shouldBundle ? filename : "__treeche__target__"
        }"`,
        __treeche__target__: `${replaceImportWithDummy(
          await compileTypescript(fileContent)
        )}`,
      }),
      shouldBundle && typescript(),
    ],
    onwarn: (warning, handle) => {
      if (
        warning.code === "UNRESOLVED_IMPORT" ||
        warning.code === "EMPTY_BUNDLE"
      ) {
        return; // ignore
      }
      handle(warning);
    },
  });

  const result = await bundled.generate({
    format: "esm",
  });

  const { code } = result.output[0];

  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  const nodes = ast.program.body.filter((node) => {
    return node.type !== "ImportDeclaration";
  });

  return {
    file: filename,
    shaken: nodes.length === 0,
    diagnostics: nodes
      .map((node) => {
        const loc = node.loc;
        if (!loc) {
          return "";
        }

        const diagnoseCodeLines = code
          .split("\n")
          .slice(loc.start.line - 1, loc.end.line);

        const diagnoseCodeLinesWithPointer = diagnoseCodeLines.map(
          (diagnose, idx) => {
            const pointer = (() => {
              if (diagnoseCodeLines.length === 1) {
                return (
                  " ".repeat(loc.start.column) +
                  "^".repeat(loc.end.column - loc.start.column)
                );
              }

              if (idx === 0) {
                return (
                  " ".repeat(loc.start.column) +
                  "^".repeat(diagnose.length - loc.start.column)
                );
              }

              if (idx === diagnoseCodeLines.length - 1) {
                return "^".repeat(loc.end.column);
              }

              return "^".repeat(diagnose.length);
            })();

            return `${diagnose}${
              diagnose.endsWith("\n") ? "" : "\n"
            }${pointer}`;
          }
        );

        return diagnoseCodeLinesWithPointer.join("\n");
      })
      .filter((diagnose) => !!diagnose),
  };
};
