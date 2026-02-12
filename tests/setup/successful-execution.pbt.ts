import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import fc from "fast-check";

// Regex patterns for validation
const LOWERCASE_IDENTIFIER_PATTERN = /^[a-z][a-z0-9]*$/;
const UPPERCASE_IDENTIFIER_PATTERN = /^[A-Z][a-z0-9]*$/;
const ALPHANUMERIC_SPACE_PATTERN = /^[a-zA-Z0-9 ]+$/;
const FILE_PATH_PATTERN = /^[a-zA-Z0-9/._-]+$/;

/**
 * Property-based tests for successful linter execution on valid code
 * Feature: ultracite-oxlint-setup
 * Property 11: Linters execute successfully on valid code
 *
 * **Validates: Requirements 7.1, 7.2**
 *
 * These tests verify that both Biome and oxlint execute successfully
 * (exit code 0) when processing valid Next.js TypeScript code that
 * follows all ultracite rules.
 */

describe("Property 11: Linters execute successfully on valid code", () => {
  const projectRoot = join(__dirname, "../..");
  const testDir = join(projectRoot, ".test-temp-valid");

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

  // Helper function to run oxlint on a file
  function runOxlint(filePath: string): { exitCode: number; output: string } {
    try {
      const output = execSync(`npx oxlint "${filePath}" 2>&1`, {
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

  it("should execute successfully on valid TypeScript variable declarations", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => LOWERCASE_IDENTIFIER_PATTERN.test(s)),
        fc.integer({ min: 1, max: 100 }),
        (varName, value) => {
          // Generate valid TypeScript code following ultracite rules
          const code = `const ${varName} = ${value};\nconsole.log(${varName});\n`;
          const filename = `test-valid-${varName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully (exit code 0)
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid code. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully (exit code 0)
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid code. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should execute successfully on valid TypeScript functions", () => {
    fc.assert(
      fc.property(
        fc.record({
          funcName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => LOWERCASE_IDENTIFIER_PATTERN.test(s)),
          paramName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => LOWERCASE_IDENTIFIER_PATTERN.test(s)),
          returnValue: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate valid function following ultracite rules
          const code = `function ${config.funcName}(${config.paramName}: number): number {\n  return ${config.paramName} + ${config.returnValue};\n}\n\nconsole.log(${config.funcName}(10));\n`;
          const filename = `test-func-${config.funcName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid function. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid function. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should execute successfully on valid Next.js components using next/image", () => {
    fc.assert(
      fc.property(
        fc.record({
          componentName: fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => UPPERCASE_IDENTIFIER_PATTERN.test(s)),
          imgSrc: fc
            .string({ minLength: 2, maxLength: 30 })
            .filter((s) => FILE_PATH_PATTERN.test(s)),
          imgAlt: fc
            .string({ minLength: 2, maxLength: 30 })
            .filter(
              (s) => ALPHANUMERIC_SPACE_PATTERN.test(s) && s.trim().length > 1
            ),
        }),
        (config) => {
          // Generate valid Next.js component using next/image (correct way)
          // Use lowercase filename for kebab-case compliance
          const code = `import Image from "next/image";\n\nexport default function ${config.componentName}() {\n  return (\n    <div>\n      <Image alt="${config.imgAlt}" height={100} src="${config.imgSrc}" width={100} />\n    </div>\n  );\n}\n`;
          const filename = `${config.componentName.toLowerCase()}.tsx`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid Next.js component. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid Next.js component. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should execute successfully on valid arrow functions", () => {
    fc.assert(
      fc.property(
        fc.record({
          funcName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => LOWERCASE_IDENTIFIER_PATTERN.test(s)),
          paramName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => LOWERCASE_IDENTIFIER_PATTERN.test(s)),
          multiplier: fc.integer({ min: 1, max: 10 }),
        }),
        (config) => {
          // Generate valid arrow function following ultracite rules
          const code = `const ${config.funcName} = (${config.paramName}: number): number => {\n  return ${config.paramName} * ${config.multiplier};\n};\n\nconsole.log(${config.funcName}(5));\n`;
          const filename = `test-arrow-${config.funcName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid arrow function. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid arrow function. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should execute successfully on valid object literals", () => {
    fc.assert(
      fc.property(
        fc
          .record({
            objName: fc
              .string({ minLength: 1, maxLength: 15 })
              .filter((s) => LOWERCASE_IDENTIFIER_PATTERN.test(s)),
            key1: fc
              .string({ minLength: 1, maxLength: 10 })
              .filter((s) => LOWERCASE_IDENTIFIER_PATTERN.test(s)),
            key2: fc
              .string({ minLength: 1, maxLength: 10 })
              .filter(
                (s) => LOWERCASE_IDENTIFIER_PATTERN.test(s) && s !== "key1"
              ),
            val1: fc.integer({ min: 1, max: 100 }),
            val2: fc.integer({ min: 1, max: 100 }),
          })
          .filter((config) => config.key1 !== config.key2), // Ensure unique keys
        (config) => {
          // Generate valid object literal following ultracite rules
          const code = `const ${config.objName} = {\n  ${config.key1}: ${config.val1},\n  ${config.key2}: ${config.val2},\n};\n\nconsole.log(${config.objName});\n`;
          const filename = `test-obj-${config.objName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid object literal. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid object literal. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should execute successfully on valid arrays", () => {
    fc.assert(
      fc.property(
        fc.record({
          arrName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => LOWERCASE_IDENTIFIER_PATTERN.test(s)),
          values: fc.array(fc.integer({ min: 1, max: 100 }), {
            minLength: 2,
            maxLength: 5,
          }),
        }),
        (config) => {
          // Generate valid array following ultracite rules
          const code = `const ${config.arrName} = [${config.values.join(", ")}];\n\nconsole.log(${config.arrName});\n`;
          const filename = `test-arr-${config.arrName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid array. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid array. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should execute successfully on valid Next.js page components", () => {
    fc.assert(
      fc.property(
        fc.record({
          pageName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => UPPERCASE_IDENTIFIER_PATTERN.test(s)),
          title: fc
            .string({ minLength: 2, maxLength: 30 })
            .filter(
              (s) => ALPHANUMERIC_SPACE_PATTERN.test(s) && s.trim().length > 1
            ),
          content: fc
            .string({ minLength: 2, maxLength: 50 })
            .filter(
              (s) => ALPHANUMERIC_SPACE_PATTERN.test(s) && s.trim().length > 1
            ),
        }),
        (config) => {
          // Generate valid Next.js page component
          const code = `export default function ${config.pageName}() {\n  return (\n    <div>\n      <h1>${config.title}</h1>\n      <p>${config.content}</p>\n    </div>\n  );\n}\n`;
          const filename = `${config.pageName.toLowerCase()}.tsx`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid Next.js page. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid Next.js page. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should execute successfully on valid code with proper comparison operators", () => {
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
            .string({ minLength: 1, maxLength: 15 })
            .filter(
              (s) =>
                LOWERCASE_IDENTIFIER_PATTERN.test(s) && !reservedWords.has(s)
            ),
          value1: fc.integer({ min: 1, max: 100 }),
          value2: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate valid code using === (correct comparison)
          const code = `const ${config.varName} = ${config.value1};\nconst result = ${config.varName} === ${config.value2};\nconsole.log(result);\n`;
          const filename = `test-comparison-${config.varName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid comparison. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid comparison. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should execute successfully on valid JSX fragments", () => {
    fc.assert(
      fc.property(
        fc.record({
          componentName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => UPPERCASE_IDENTIFIER_PATTERN.test(s)),
          text1: fc
            .string({ minLength: 2, maxLength: 30 })
            .filter(
              (s) => ALPHANUMERIC_SPACE_PATTERN.test(s) && s.trim().length > 1
            ),
          text2: fc
            .string({ minLength: 2, maxLength: 30 })
            .filter(
              (s) => ALPHANUMERIC_SPACE_PATTERN.test(s) && s.trim().length > 1
            ),
        }),
        (config) => {
          // Generate valid component with JSX fragments
          const code = `export default function ${config.componentName}() {\n  return (\n    <>\n      <p>${config.text1}</p>\n      <p>${config.text2}</p>\n    </>\n  );\n}\n`;
          const filename = `${config.componentName.toLowerCase()}.tsx`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid JSX fragments. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid JSX fragments. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should execute successfully on valid conditional statements", () => {
    fc.assert(
      fc.property(
        fc.record({
          varName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => LOWERCASE_IDENTIFIER_PATTERN.test(s)),
          threshold: fc.integer({ min: 1, max: 50 }),
          value: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate valid conditional code
          const code = `const ${config.varName} = ${config.value};\n\nif (${config.varName} > ${config.threshold}) {\n  console.log("greater");\n} else {\n  console.log("less or equal");\n}\n`;
          const filename = `test-conditional-${config.varName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid conditional. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid conditional. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should execute successfully on valid for loops", () => {
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
          arrName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter(
              (s) =>
                LOWERCASE_IDENTIFIER_PATTERN.test(s) && !reservedWords.has(s)
            ),
          itemName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter(
              (s) =>
                LOWERCASE_IDENTIFIER_PATTERN.test(s) && !reservedWords.has(s)
            ),
          values: fc.array(fc.integer({ min: 1, max: 100 }), {
            minLength: 2,
            maxLength: 5,
          }),
        }),
        (config) => {
          // Generate valid for loop code
          const code = `const ${config.arrName} = [${config.values.join(", ")}];\n\nfor (const ${config.itemName} of ${config.arrName}) {\n  console.log(${config.itemName});\n}\n`;
          const filename = `test-loop-${config.arrName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run Biome
          const biomeResult = runBiomeCheck(filePath);

          // Should execute successfully
          assert.strictEqual(
            biomeResult.exitCode,
            0,
            `Biome should execute successfully on valid for loop. Output: ${biomeResult.output}`
          );

          // Run oxlint
          const oxlintResult = runOxlint(filePath);

          // Should execute successfully
          assert.strictEqual(
            oxlintResult.exitCode,
            0,
            `Oxlint should execute successfully on valid for loop. Output: ${oxlintResult.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });
});
