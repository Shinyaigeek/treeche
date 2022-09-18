import { describe, test, vi, afterEach, expect } from "vitest";
import { treeche } from "treeche-core/src/mod";

const stdouts: string[] = [];

afterEach(() => {
  vi.resetAllMocks();
  stdouts.splice(0);
});

describe("should output ok without side-effects", () => {
  test("sample.ts", async () => {
    const logMock = vi.spyOn(console, "log");
    logMock.mockImplementation((message: string) => {
      stdouts.push(message);
    });

    await treeche({
      inputs: ["./test-cases/should-output-ok-without-side-effects/__fixture__/sample.ts"],
    });

    expect(logMock).toHaveBeenCalled();
    expect(stdouts.length).toEqual(1);
    expect(stdouts.at(0)).toEqual(
      "Congratulation 🎉 All files are tree-shakeable ✨"
    );
  });
});
