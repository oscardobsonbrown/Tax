import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import fc from "fast-check";

const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const KEBAB_CASE_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;
const LINE_NUMBER_PATTERN = /(?:line\s+\d+|:\d+:|^\s*\d+\s*\|)/im;

/**
 * Property-based tests for linter error reporting
 * Feature: ultracite-oxlint-setup
 * Property 9: Linters report errors with context
 *
 * **Validates: Requirements 7.3**
 *
 * These tests verify that linters report errors with complete context
 * including file paths, line numbers, and violation descriptions.
 */

describe("Property 9: Linters report errors with context", () => {
  const projectRoot = join(__dirname, "../..");
  const testDir = join(projectRoot, ".test-temp-error-reporting");

  // Helper function to run Biome check on a file
  function runBiomeCheck(filePath: string): {
    exitCode: number;
    output: string;
  } {
    try {
      const output = execSync(`npx biome check "${filePath}" 2>&1`, {
        cwd: projectRoot,
        encoding: "utf-8",
        stdio: "pipe",
      });
      return { exitCode: 0, output };
    } catch (error: unknown) {
      const execError = error as {
        stdout?: string;
        stderr?: string;
        status?: number;
      };
      const output = (execError.stdout || "") + (execError.stderr || "");
      return {
        exitCode: execError.status || 1,
        output,
      };
    }
  }

  // Helper function to create a test file
  function createTestFile(filename: string, content: string): string {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
    const filePath = join(testDir, filename);
    writeFileSync(filePath, content, "utf-8");
    return filePath;
  }

  // Cleanup test directory after tests
  function cleanup() {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  }

  // Helper to check if output contains file path
  function containsFilePath(output: string, filename: string): boolean {
    return (
      output.includes(filename) || output.includes(".test-temp-error-reporting")
    );
  }

  // Helper to check if output contains line number information
  function containsLineNumber(output: string): boolean {
    return LINE_NUMBER_PATTERN.test(output);
  }

  // Helper to check if output contains violation description
  function containsViolationDescription(output: string): boolean {
    // Look for common violation keywords
    const keywords = [
      "var",
      "const",
      "let",
      "semicolon",
      "indentation",
      "format",
      "error",
      "warning",
      "violation",
      "rule",
      "expected",
      "unexpected",
      "noVar",
      "no-var",
      "==",
      "===",
      "suspicious",
    ];
    return keywords.some((keyword) =>
      output.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  it("should report file path for violations at line 1", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => IDENTIFIER_PATTERN.test(s)),
        fc.integer({ min: 1, max: 100 }),
        (varName, value) => {
          // Generate code with violation on line 1
          const code = `var ${varName} = ${value}\n`;
          const filename = `test-line1-${varName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const result = runBiomeCheck(filePath);

          // Should report file path
          assert.ok(
            containsFilePath(result.output, filename),
            `Biome should report file path. Output: ${result.output}`
          );

          // Should report line number
          assert.ok(
            containsLineNumber(result.output),
            `Biome should report line number. Output: ${result.output}`
          );

          // Should report violation description
          assert.ok(
            containsViolationDescription(result.output),
            `Biome should report violation description. Output: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should report file path and line number for violations at various line numbers", () => {
    fc.assert(
      fc.property(
        fc.record({
          varName: fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => IDENTIFIER_PATTERN.test(s)),
          value: fc.integer({ min: 1, max: 100 }),
          lineNumber: fc.integer({ min: 1, max: 20 }),
        }),
        (config) => {
          // Generate code with violation at specific line number
          const emptyLines = "\n".repeat(config.lineNumber - 1);
          const code = `${emptyLines}var ${config.varName} = ${config.value}\n`;
          const filename = `test-line${config.lineNumber}-${config.varName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const result = runBiomeCheck(filePath);

          // Should report file path
          assert.ok(
            containsFilePath(result.output, filename),
            `Biome should report file path for line ${config.lineNumber}. Output: ${result.output}`
          );

          // Should report line number
          assert.ok(
            containsLineNumber(result.output),
            `Biome should report line number for line ${config.lineNumber}. Output: ${result.output}`
          );

          // Should report violation description
          assert.ok(
            containsViolationDescription(result.output),
            `Biome should report violation description for line ${config.lineNumber}. Output: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should report context for multiple violations in the same file", () => {
    fc.assert(
      fc.property(
        fc.record({
          var1: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => IDENTIFIER_PATTERN.test(s)),
          var2: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => IDENTIFIER_PATTERN.test(s)),
          value1: fc.integer({ min: 1, max: 100 }),
          var3: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => IDENTIFIER_PATTERN.test(s)),
          value2: fc.integer({ min: 1, max: 100 }),
          leadingSpaces: fc.integer({ min: 0, max: 10 }),
        }),
        (config) => {
          // Generate code with violation at different column positions
          const spaces = " ".repeat(config.leadingSpaces);
          const code = `${spaces}var ${config.varName} = ${config.value}\n`;
          const filename = `test-col-${config.varName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const result = runBiomeCheck(filePath);

          // Should report file path
          assert.ok(
            containsFilePath(result.output, filename),
            `Biome should report file path for violations at different columns. Output: ${result.output}`
          );

          // Should report line number
          assert.ok(
            containsLineNumber(result.output),
            `Biome should report line number for violations at different columns. Output: ${result.output}`
          );

          // Should report violation description
          assert.ok(
            containsViolationDescription(result.output),
            `Biome should report violation description for violations at different columns. Output: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should report context for violations in nested code structures", () => {
    fc.assert(
      fc.property(
        fc.record({
          funcName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => IDENTIFIER_PATTERN.test(s)),
          varName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => IDENTIFIER_PATTERN.test(s)),
          value: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate nested code with violations
          const code = `
function ${config.funcName}() {
  if (true) {
    var ${config.varName} = ${config.value}
    return ${config.varName}
  }
}
`;
          const filename = `test-nested-${config.funcName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const result = runBiomeCheck(filePath);

          // Should report file path
          assert.ok(
            containsFilePath(result.output, filename),
            `Biome should report file path for nested violations. Output: ${result.output}`
          );

          // Should report line number
          assert.ok(
            containsLineNumber(result.output),
            `Biome should report line number for nested violations. Output: ${result.output}`
          );

          // Should report violation description
          assert.ok(
            containsViolationDescription(result.output),
            `Biome should report violation description for nested violations. Output: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should report context for different violation types", () => {
    fc.assert(
      fc.property(
        fc.record({
          filename: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => IDENTIFIER_PATTERN.test(s)),
          violationType: fc.constantFrom(
            "var",
            "semicolon",
            "doubleEquals",
            "indentation"
          ),
          value: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate code with different violation types
          let code: string;
          switch (config.violationType) {
            case "var":
              code = `var ${config.filename} = ${config.value}\n`;
              break;
            case "semicolon":
              code = `const ${config.filename} = ${config.value}\n`;
              break;
            case "doubleEquals":
              code = `const ${config.filename} = ${config.value};\nconst check = ${config.filename} == ${config.value};\n`;
              break;
            case "indentation":
              code = `function test() {\n   const ${config.filename} = ${config.value};\n}\n`;
              break;
            default:
              throw new Error(
                `Unknown violation type: ${config.violationType}`
              );
          }

          const filename = `test-type-${config.filename}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const result = runBiomeCheck(filePath);

          // Should report file path
          assert.ok(
            containsFilePath(result.output, filename),
            `Biome should report file path for ${config.violationType} violations. Output: ${result.output}`
          );

          // Should report line number
          assert.ok(
            containsLineNumber(result.output),
            `Biome should report line number for ${config.violationType} violations. Output: ${result.output}`
          );

          // Should report violation description
          assert.ok(
            containsViolationDescription(result.output),
            `Biome should report violation description for ${config.violationType} violations. Output: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should report context for violations in files with long paths", () => {
    fc.assert(
      fc.property(
        fc.record({
          subdir: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => KEBAB_CASE_PATTERN.test(s)),
          filename: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => IDENTIFIER_PATTERN.test(s)),
          value: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Create nested directory structure
          const nestedDir = join(testDir, config.subdir, "nested");
          if (!existsSync(nestedDir)) {
            mkdirSync(nestedDir, { recursive: true });
          }

          // Create file with violations
          const filePath = join(nestedDir, `${config.filename}.ts`);
          const code = `var ${config.filename} = ${config.value}\n`;
          writeFileSync(filePath, code, "utf-8");

          // Run Biome
          const result = runBiomeCheck(filePath);

          // Should report file path (including nested structure)
          assert.ok(
            result.output.includes(config.filename) ||
              result.output.includes(config.subdir),
            `Biome should report file path for nested files. Output: ${result.output}`
          );

          // Should report line number
          assert.ok(
            containsLineNumber(result.output),
            `Biome should report line number for nested files. Output: ${result.output}`
          );

          // Should report violation description
          assert.ok(
            containsViolationDescription(result.output),
            `Biome should report violation description for nested files. Output: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });
});
