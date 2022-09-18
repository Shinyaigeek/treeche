import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

export const replaceImportWithDummy: (content: string) => string = function (
  content
) {
  const ast = parse(content, {
    sourceType: "module",
    plugins: ["typescript"],
  });

  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.importKind !== "type") {
        path.node.source.value = `dummy:${path.node.source.value}`;
      }
    },
    ExportNamedDeclaration(path) {
      if (path.node.exportKind !== "type" && path.node.source) {
        path.node.source.value = `dummy:${path.node.source.value}`;
      }
    },
    ExportAllDeclaration(path) {
      if (path.node.exportKind !== "type" && path.node.source) {
        path.node.source.value = `dummy:${path.node.source.value}`;
      }
    },
    ExpressionStatement(path) {
      if (path.node.expression.type === "CallExpression") {
        if (
          path.node.expression.callee.type === "Identifier" &&
          ["require", "import"].includes(path.node.expression.callee.name)
        ) {
          if (path.node.expression.arguments[0].type === "StringLiteral") {
            path.node.expression.arguments[0].value = `dummy:${path.node.expression.arguments[0].value}`;
          }
        }
      }
    },
  });

  const { code } = generate(ast);
  return code;
};
