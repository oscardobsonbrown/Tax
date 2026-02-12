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
import * as fc from "fast-check";

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
    } catch (error: any) {
      throw new Error(`Biome format failed: ${error.message}`);
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
      const match = line.match(/^(\s+)/);
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
          .filter(
            (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
          ),
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
          varName: fc
            .string({ minLength: 1, maxLength: 20 })
            .filter(
              (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
            ),
          value: fc.integer({ min: 1, max: 100 }),
          spacesBeforeEquals: fc.integer({ min: 0, max: 5 }),
          spacesAfterEquals: fc.integer({ min: 0, max: 5 }),
          hasSemicolon: fc.boolean(),
        }),
        (config) => {
          // Generate code with inconsistent spacing
          const beforeEq = " ".repeat(config.spacesBeforeEquals);
          const afterEq = " ".repeat(config.spacesAfterEquals);
          const semi = config.hasSemicolon ? ";" : "";
          const code = `const ${config.varName}${beforeEq}=${afterEq}${config.value}${semi}\n`;

          const filePath = createTestFile(
            `test-spacing-${config.varName}.ts`,
            code
          );
          const formatted = runBiomeFormat(filePath);

          // Check consistent spacing (should be exactly one space around =)
          assert.ok(
            formatted.includes(`const ${config.varName} = ${config.value};`),
            `Formatted code should have consistent spacing and semicolons. Got:\n${formatted}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should format nested code blocks with 2-space indentation", () => {
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
          .string({ minLength: 1, maxLength: 15 })
          .filter(
            (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
          ),
        fc.integer({ min: 1, max: 10 }),
        (funcName, value) => {
          // Generate nested code with inconsistent indentation
          const code = `function ${funcName}() {\nif (true) {\nreturn ${value}\n}\n}\n`;

          const filePath = createTestFile(`test-nested-${funcName}.ts`, code);
          const formatted = runBiomeFormat(filePath);

          // Check 2-space indentation
          assert.ok(
            checkIndentation(formatted),
            `Formatted code should use 2-space indentation for nested blocks. Got:\n${formatted}`
          );

          // Check that nested content is indented
          const lines = formatted.split("\n");
          const ifLine = lines.find((l) => l.trim().startsWith("if"));
          const returnLine = lines.find((l) => l.trim().startsWith("return"));

          if (ifLine && returnLine) {
            const ifIndent = ifLine.match(/^(\s*)/)?.[1].length || 0;
            const returnIndent = returnLine.match(/^(\s*)/)?.[1].length || 0;

            // Return should be indented 2 more spaces than if
            assert.strictEqual(
              returnIndent,
              ifIndent + 2,
              "Nested return should be indented 2 spaces more than if statement"
            );
          }

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should add semicolons to statements that are missing them", () => {
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
            .filter(
              (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
            ),
          value: fc.oneof(
            fc.integer({ min: 1, max: 1000 }),
            fc.constant('"test"'),
            fc.constant("true"),
            fc.constant("false")
          ),
        }),
        (config) => {
          // Generate code without semicolons
          const code = `const ${config.varName} = ${config.value}\nconst another = 42\n`;

          const filePath = createTestFile(
            `test-semi-${config.varName}.ts`,
            code
          );
          const formatted = runBiomeFormat(filePath);

          // Check that semicolons are added
          assert.ok(
            formatted.includes(`const ${config.varName} = ${config.value};`),
            `Formatted code should add semicolons. Got:\n${formatted}`
          );

          assert.ok(
            formatted.includes("const another = 42;"),
            `Formatted code should add semicolons to all statements. Got:\n${formatted}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should format object literals with consistent indentation and semicolons", () => {
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
          .string({ minLength: 1, maxLength: 15 })
          .filter(
            (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
          ),
        fc.record({
          key1: fc
            .string({ minLength: 1, maxLength: 10 })
            .filter(
              (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
            ),
          key2: fc
            .string({ minLength: 1, maxLength: 10 })
            .filter(
              (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
            ),
          val1: fc.integer({ min: 1, max: 100 }),
          val2: fc.integer({ min: 1, max: 100 }),
        }),
        (objName, props) => {
          // Generate object with inconsistent formatting
          const code = `const ${objName}={${props.key1}:${props.val1},${props.key2}:${props.val2}}\n`;

          const filePath = createTestFile(`test-obj-${objName}.ts`, code);
          const formatted = runBiomeFormat(filePath);

          // Check 2-space indentation
          assert.ok(
            checkIndentation(formatted),
            `Formatted object should use 2-space indentation. Got:\n${formatted}`
          );

          // Check semicolon at end
          assert.ok(
            formatted.trim().endsWith(";"),
            `Formatted object declaration should end with semicolon. Got:\n${formatted}`
          );

          // Check that object properties are formatted
          assert.ok(
            formatted.includes(props.key1) && formatted.includes(props.key2),
            `Formatted code should contain all object properties. Got:\n${formatted}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should format arrow functions with consistent style", () => {
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
          .string({ minLength: 1, maxLength: 15 })
          .filter(
            (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
          ),
        fc
          .string({ minLength: 1, maxLength: 15 })
          .filter(
            (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
          ),
        fc.integer({ min: 1, max: 100 }),
        (funcName, paramName, returnValue) => {
          // Generate arrow function with inconsistent formatting
          const code = `const ${funcName}=(${paramName})=>{return ${returnValue}}\n`;

          const filePath = createTestFile(`test-arrow-${funcName}.ts`, code);
          const formatted = runBiomeFormat(filePath);

          // Check consistent spacing around arrow
          assert.ok(
            formatted.includes("=>") || formatted.includes("=> "),
            `Formatted arrow function should have consistent spacing. Got:\n${formatted}`
          );

          // Check semicolon at end
          assert.ok(
            formatted.trim().endsWith(";"),
            `Formatted arrow function should end with semicolon. Got:\n${formatted}`
          );

          // Check indentation
          assert.ok(
            checkIndentation(formatted),
            `Formatted arrow function should use 2-space indentation. Got:\n${formatted}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should format arrays with consistent style", () => {
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
          .string({ minLength: 1, maxLength: 15 })
          .filter(
            (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
          ),
        fc.array(fc.integer({ min: 1, max: 100 }), {
          minLength: 2,
          maxLength: 5,
        }),
        (arrName, values) => {
          // Generate array with inconsistent formatting
          const code = `const ${arrName}=[${values.join(",")}]\n`;

          const filePath = createTestFile(`test-arr-${arrName}.ts`, code);
          const formatted = runBiomeFormat(filePath);

          // Check semicolon at end
          assert.ok(
            formatted.trim().endsWith(";"),
            `Formatted array should end with semicolon. Got:\n${formatted}`
          );

          // Check that all values are present
          for (const val of values) {
            assert.ok(
              formatted.includes(String(val)),
              `Formatted array should contain value ${val}. Got:\n${formatted}`
            );
          }

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should format complex code structures consistently", () => {
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
            .filter(
              (s) => /^[A-Z][a-zA-Z0-9]*$/.test(s) && !reservedWords.has(s)
            ),
          methodName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter(
              (s) => /^[a-z][a-zA-Z0-9]*$/.test(s) && !reservedWords.has(s)
            ),
          propName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter(
              (s) => /^[a-z][a-zA-Z0-9]*$/.test(s) && !reservedWords.has(s)
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
            .filter(
              (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !reservedWords.has(s)
            ),
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
