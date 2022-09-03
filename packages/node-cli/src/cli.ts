import { Command } from "commander";
import { treeche, TreecheOptions } from "../../core/src/treeche/mod.js";

function main() {
  const program = new Command();

  program
    .argument("[strings...]", "target file path, you can use Node glob pattern")
    .option(
      "-e, --excludes <strings...>",
      "exclude files, you can use node glob pattern"
    )
    .option(
      "--entry-point <string>",
      "the unique entry point, you can check the module is tree-shakable also in node_modules "
    )
    .option(
      "--pure-functions <string...>",
      "register pure function to ignore treeche checker"
    )
    .action((inputs, options) => {
      treeche({
        inputs,
        ...options,
      } as TreecheOptions);
    });

    program.parse();
}

main();
