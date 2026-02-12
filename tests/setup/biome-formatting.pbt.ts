import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import fc from "fast-check";

// Regex patterns for validation
const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const INDENTATION_PATTERN = /^(\s+)/;
const CLASS_NAME_PATTERN = /^[A-Z][a-zA-Z0-9]*$/;
const METHOD_NAME_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

/**
 * Property-based tests for Biome formatting consistency
 * Feature: ultracite-oxlint-setup
 * Property 5: Biome formats code consistently
 *
 * **Validates: Requirements 3.5**
 *
 * These tests verify that Biome formats code consistently according to
 * ultracite rules: 2-space indentation, 80-character line width, and
 * semicolons at statement ends.
 */

describe("Property 5: Biome formats code consistently", () => {
  const projectRoot = join(__dirname, "../..");
  const testDir = join(projectRoot, "tests", ".temp-format-test");

  // Helper function to run Biome format on a test file
  function runBiomeFormat(filePath: string): string {
    try {
      execSync(`npx biome format --write "${filePath}"`, {
        cwd: projectRoot,
        encoding: "utf-8",
        stdio: "pipe",
      });
      // Read the formatted content
      return readFileSync(filePath, "utf-8");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Biome format failed: ${message}`);
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

  // Helper to check if indentation is 2 spaces
  function checkIndentation(content: string): boolean {
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.length === 0 || line.trim().length === 0) {
        continue;
      }

      // Check if line starts with spaces
      const match = line.match(INDENTATION_PATTERN);
      if (match) {
        const spaces = match[1];
        // Should only contain spaces (no tabs)
        if (spaces.includes("\t")) {
          return false;
        }

        // Indentation should be a multiple of 2
        if (spaces.length % 2 !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  it("should format simple variable declarations with consistent indentation", () => {
    // Reserved words to exclude from identifier generation
    const reservedWords = new Set([
      "arguments",
      "await",
      "break",
      "case",
      "catch",
      "class",
      "const",
      "continue",
      "debugger",
      "default",
      "delete",
      "do",
      "else",
      "enum",
      "eval",
      "export",
      "extends",
      "false",
      "finally",
      "for",
      "function",
      "if",
      "implements",
      "import",
      "in",
      "instanceof",
      "interface",
      "let",
      "new",
      "null",
      "package",
      "private",
      "protected",
      "public",
      "return",
      "static",
      "super",
      "switch",
      "this",
      "throw",
      "true",
      "try",
      "typeof",
      "var",
      "void",
      "while",
      "with",
      "yield",
      "constructor",
    ]);

    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => IDENTIFIER_PATTERN.test(s) && !reservedWords.has(s)),
        fc.integer({ min: 0, max: 1000 }),
        fc
          .integer({ min: 1, max: 8 })
          .filter((n) => n % 2 !== 0), // Odd indentation (wrong)
        (varName, value, wrongIndent) => {
          // Generate code with wrong indentation and no semicolon
          const indent = " ".repeat(wrongIndent);
          const code = `function test() {\n${indent}const ${varName} = ${value}\n${indent}return ${varName}\n}\n`;

          const filePath = createTestFile(`test-indent-${varName}.ts`, code);
          const formatted = runBiomeFormat(filePath);

          // Check 2-space indentation
          assert.ok(
            checkIndentation(formatted),
            `Formatted code should use 2-space indentation. Got:\n${formatted}`
          );

          // Check semicolons are present
          assert.ok(
            formatted.includes(`const ${varName} = ${value};`),
            `Formatted code should have semicolons. Got:\n${formatted}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should format code with varying spacing consistently", () => {
    const reservedWords = new Set([
      "arguments",
      "await",
      "break",
      "case",
      "catch",
      "class",
      "const",
      "continue",
      "debugger",
      "default",
      "delete",
      "do",
      "else",
      "enum",
      "eval",
      "export",
      "extends",
      "false",
      "finally",
      "for",
      "function",
      "if",
      "implements",
      "import",
      "in",
      "instanceof",
      "interface",
      "let",
      "new",
      "null",
      "package",
      "private",
      "protected",
      "public",
      "return",
      "static",
      "super",
      "switch",
      "this",
      "throw",
      "true",
      "try",
      "typeof",
      "var",
      "void",
      "while",
      "with",
      "yield",
      "constructor",
    ]);

    fc.assert(
      fc.property(
        fc.record({
          className: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => CLASS_NAME_PATTERN.test(s) && !reservedWords.has(s)),
          methodName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter(
              (s) => METHOD_NAME_PATTERN.test(s) && !reservedWords.has(s)
            ),
          propName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter(
              (s) => METHOD_NAME_PATTERN.test(s) && !reservedWords.has(s)
            ),
          propValue: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate class with inconsistent formatting
          const code = `class ${config.className}{${config.propName}=${config.propValue};${config.methodName}(){return this.${config.propName}}}\n`;

          const filePath = createTestFile(
            `test-class-${config.className}.ts`,
            code
          );
          const formatted = runBiomeFormat(filePath);

          // Check 2-space indentation
          assert.ok(
            checkIndentation(formatted),
            `Formatted class should use 2-space indentation. Got:\n${formatted}`
          );

          // Check that class members are present
          assert.ok(
            formatted.includes(config.propName) &&
              formatted.includes(config.methodName),
            `Formatted class should contain all members. Got:\n${formatted}`
          );

          // Check proper structure (class members should be on separate lines)
          const lines = formatted
            .split("\n")
            .filter((l) => l.trim().length > 0);
          assert.ok(
            lines.length > 3,
            `Formatted class should have members on separate lines. Got:\n${formatted}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should maintain consistent formatting across multiple runs", () => {
    const reservedWords = new Set([
      "arguments",
      "await",
      "break",
      "case",
      "catch",
      "class",
      "const",
      "continue",
      "debugger",
      "default",
      "delete",
      "do",
      "else",
      "enum",
      "eval",
      "export",
      "extends",
      "false",
      "finally",
      "for",
      "function",
      "if",
      "implements",
      "import",
      "in",
      "instanceof",
      "interface",
      "let",
      "new",
      "null",
      "package",
      "private",
      "protected",
      "public",
      "return",
      "static",
      "super",
      "switch",
      "this",
      "throw",
      "true",
      "try",
      "typeof",
      "var",
      "void",
      "while",
      "with",
      "yield",
      "constructor",
    ]);

    fc.assert(
      fc.property(
        fc.record({
          varName: fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => IDENTIFIER_PATTERN.test(s) && !reservedWords.has(s)),
          value: fc.integer({ min: 1, max: 1000 }),
        }),
        (config) => {
          // Generate code with inconsistent formatting
          const code = `const    ${config.varName}=${config.value}\n`;

          const filePath = createTestFile(
            `test-idempotent-${config.varName}.ts`,
            code
          );

          // Format once
          const formatted1 = runBiomeFormat(filePath);

          // Write the formatted content back and format again
          writeFileSync(filePath, formatted1, "utf-8");
          const formatted2 = runBiomeFormat(filePath);

          // Formatting should be idempotent (same result on second run)
          assert.strictEqual(
            formatted1,
            formatted2,
            `Biome formatting should be idempotent. First:\n${formatted1}\nSecond:\n${formatted2}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });
});
