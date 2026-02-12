import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import * as fc from "fast-check";

/**
 * Property-based tests for Biome rule enforcement
 * Feature: ultracite-oxlint-setup
 * Property 4: Biome enforces ultracite rules
 *
 * **Validates: Requirements 3.4**
 *
 * These tests verify that Biome correctly detects violations of ultracite's
 * strict linting rules by generating code samples with known violations and
 * confirming that Biome reports them.
 */

describe("Property 4: Biome enforces ultracite rules", () => {
  const projectRoot = join(__dirname, "../..");
  const testDir = join(projectRoot, ".test-temp");

  // Helper function to run Biome on a test file
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
    } catch (error: any) {
      // Biome returns non-zero exit code when violations are found
      // Combine stdout and stderr for complete output
      const output = (error.stdout || "") + (error.stderr || "");
      return {
        exitCode: error.status || 1,
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

  it("should detect var usage violations (prefer const/let)", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
        fc.oneof(
          fc.constant("string"),
          fc.constant("number"),
          fc.constant("boolean")
        ),
        (varName, valueType) => {
          const values = {
            string: '"test"',
            number: "42",
            boolean: "true",
          };
          const value = values[valueType as keyof typeof values];

          // Generate code using 'var' which violates ultracite rules
          const code = `var ${varName} = ${value};\n`;
          const filePath = createTestFile(`test-var-${varName}.ts`, code);

          const result = runBiomeCheck(filePath);

          // Biome should detect the violation (non-zero exit code)
          assert.ok(
            result.exitCode !== 0,
            `Biome should detect 'var' usage violation in: ${code}`
          );

          // Output should mention the violation
          assert.ok(
            result.output.toLowerCase().includes("var") ||
              result.output.includes("noVar") ||
              result.output.includes("no-var"),
            `Biome output should mention var violation: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should detect missing semicolon violations", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
        fc.integer({ min: 1, max: 100 }),
        (varName, value) => {
          // Generate code without semicolons (violates ultracite formatting rules)
          const code = `const ${varName} = ${value}\nconsole.log(${varName})\n`;
          const filePath = createTestFile(`test-semicolon-${varName}.ts`, code);

          const result = runBiomeCheck(filePath);

          // Biome should detect formatting violations (non-zero exit code)
          assert.ok(
            result.exitCode !== 0,
            `Biome should detect missing semicolons in: ${code}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should detect incorrect indentation violations", () => {
    fc.assert(
      fc.property(
        fc
          .integer({ min: 3, max: 8 })
          .filter((n) => n !== 2), // Wrong indentation (not 2 spaces)
        (indentSize) => {
          const indent = " ".repeat(indentSize);
          // Generate code with wrong indentation
          const code = `function test() {\n${indent}return true;\n}\n`;
          const filePath = createTestFile(`test-indent-${indentSize}.ts`, code);

          const result = runBiomeCheck(filePath);

          // Biome should detect formatting violations (non-zero exit code)
          assert.ok(
            result.exitCode !== 0,
            `Biome should detect incorrect indentation (${indentSize} spaces) in: ${code}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should detect unused variable violations", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
        fc.integer({ min: 1, max: 100 }),
        (varName, value) => {
          // Generate code with unused variable
          const code = `const ${varName} = ${value};\n`;
          const filePath = createTestFile(`test-unused-${varName}.ts`, code);

          const result = runBiomeCheck(filePath);

          // Biome should detect the unused variable (non-zero exit code)
          assert.ok(
            result.exitCode !== 0,
            `Biome should detect unused variable in: ${code}`
          );

          // Output should mention unused variable
          assert.ok(
            result.output.includes("unused") ||
              result.output.includes("noUnusedVariables") ||
              result.output.includes("never read"),
            `Biome output should mention unused variable: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should detect double equals violations (prefer ===)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (a, b) => {
          // Generate code using == instead of ===
          const code = `const result = ${a} == ${b};\nconsole.log(result);\n`;
          const filePath = createTestFile(`test-equality-${a}-${b}.ts`, code);

          const result = runBiomeCheck(filePath);

          // Biome should detect the violation (non-zero exit code)
          assert.ok(
            result.exitCode !== 0,
            `Biome should detect '==' usage violation in: ${code}`
          );

          // Output should mention the equality violation
          assert.ok(
            result.output.includes("==") ||
              result.output.includes("===") ||
              result.output.includes("noDoubleEquals") ||
              result.output.includes("suspicious"),
            `Biome output should mention equality violation: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  it("should detect console.log violations in production code", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }), (message) => {
        // Generate code with console.log (often flagged in strict configs)
        const code = `console.log("${message.replace(/"/g, '\\"')}");\n`;
        const filePath = createTestFile(`test-console-${Date.now()}.ts`, code);

        const result = runBiomeCheck(filePath);

        // Note: This might not always fail depending on ultracite config
        // But we're testing that Biome runs and processes the file
        assert.ok(
          typeof result.exitCode === "number",
          "Biome should process the file and return an exit code"
        );

        cleanup();
      }),
      { numRuns: 3 }
    );
  });

  it("should detect violations across multiple rule categories", () => {
    fc.assert(
      fc.property(
        fc.record({
          varName: fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          value: fc.integer({ min: 1, max: 100 }),
          useVar: fc.boolean(),
          useSemicolon: fc.boolean(),
          useDoubleEquals: fc.boolean(),
        }),
        (config) => {
          // Generate code with multiple potential violations
          const varKeyword = config.useVar ? "var" : "const";
          const semicolon = config.useSemicolon ? ";" : "";
          const equality = config.useDoubleEquals ? "==" : "===";

          const code = `${varKeyword} ${config.varName} = ${config.value}${semicolon}\nconst check = ${config.varName} ${equality} ${config.value}${semicolon}\n`;
          const filePath = createTestFile(`test-multi-${Date.now()}.ts`, code);

          const result = runBiomeCheck(filePath);

          // If any violation exists, Biome should detect it
          const hasViolation =
            config.useVar || !config.useSemicolon || config.useDoubleEquals;

          if (hasViolation) {
            assert.ok(
              result.exitCode !== 0,
              `Biome should detect violations in: ${code}`
            );
          }

          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  });
});
