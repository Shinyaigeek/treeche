import { transform } from "esbuild";

export const compileTypescript: (content: string) => Promise<string> =
  async function (content) {
    // transpile
    const { code } = await transform(content, {
      loader: "tsx",
    });

    return code;
  };
