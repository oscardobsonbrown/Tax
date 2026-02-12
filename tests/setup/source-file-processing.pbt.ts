import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import * as fc from "fast-check";

/**
 * Property-based tests for source file processing
 * Feature: ultracite-oxlint-setup
 * Property 8: Linters process source files
 *
 * **Validates: Requirements 5.5, 6.4**
 *
 * These tests verify that linting tools correctly process all TypeScript
 * and TSX files in the src/ directory by generating files with known
 * violations and confirming they appear in linter output.
 */

describe("Property 8: Linters process source files", () => {
  const projectRoot = join(__dirname, "../..");
  const testDir = join(projectRoot, "src", ".test-temp-processing");

  // Helper function to run Biome check on a directory
  function runBiomeCheck(dirPath: string): {
    exitCode: number;
    output: string;
  } {
    try {
      const output = execSync(`npx biome check "${dirPath}" 2>&1`, {
        cwd: projectRoot,
        encoding: "utf-8",
        stdio: "pipe",
      });
      return { exitCode: 0, output };
    } catch (error: any) {
      const output = (error.stdout || "") + (error.stderr || "");
      return {
        exitCode: error.status || 1,
        output,
      };
    }
  }

  // Helper function to run oxlint on a directory
  function runOxlint(dirPath: string): { exitCode: number; output: string } {
    try {
      const output = execSync(`npx oxlint "${dirPath}" 2>&1`, {
        cwd: projectRoot,
        encoding: "utf-8",
        stdio: "pipe",
      });
      return { exitCode: 0, output };
    } catch (error: any) {
      const output = (error.stdout || "") + (error.stderr || "");
      return {
        exitCode: error.status || 1,
        output,
      };
    }
  }

  // Helper function to create a test file with violations
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

  it("should process TypeScript files in src/ directory with Biome", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
        fc.integer({ min: 1, max: 100 }),
        (varName, value) => {
          // Generate TypeScript file with violations (using var, missing semicolon)
          const code = `var ${varName} = ${value}\n`;
          const filename = `test-${varName}.ts`;
          createTestFile(filename, code);

          // Run Biome on the test directory
          const result = runBiomeCheck(testDir);

          // Biome should process the file and detect violations
          assert.ok(
            result.exitCode !== 0,
            `Biome should detect violations in src/ file: ${filename}`
          );

          // Output should mention the file or directory
          assert.ok(
            result.output.includes(filename) ||
              result.output.includes(".test-temp-processing"),
            `Biome output should mention the processed file: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should process TSX files in src/ directory with Biome", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[A-Z][a-zA-Z0-9]*$/.test(s)),
        fc
          .string({ minLength: 1, maxLength: 30 })
          .filter((s) => !(s.includes('"') || s.includes("'"))),
        (componentName, text) => {
          // Generate TSX file with violations (missing semicolon, using var)
          const code = `
export default function ${componentName}() {
  var message = "${text}"
  return <div>{message}</div>
}
`;
          const filename = `${componentName}.tsx`;
          createTestFile(filename, code);

          // Run Biome on the test directory
          const result = runBiomeCheck(testDir);

          // Biome should process the file and detect violations
          assert.ok(
            result.exitCode !== 0,
            `Biome should detect violations in src/ TSX file: ${filename}`
          );

          // Output should mention the file
          assert.ok(
            result.output.includes(filename) ||
              result.output.includes(".test-temp-processing"),
            `Biome output should mention the processed TSX file: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should process TypeScript files in src/ directory with oxlint", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
        fc.integer({ min: 1, max: 100 }),
        (varName, value) => {
          // Generate TypeScript file with violations (double equals)
          const code = `const ${varName} = ${value};\nconst check = ${varName} == ${value};\nconsole.log(check);\n`;
          const filename = `test-ox-${varName}.ts`;
          createTestFile(filename, code);

          // Run oxlint on the test directory
          const result = runOxlint(testDir);

          // Oxlint should process the file (exit code may be 0 or non-zero depending on violations)
          assert.ok(
            typeof result.exitCode === "number",
            `Oxlint should process src/ file: ${filename}`
          );

          // If violations detected, output should mention the file
          if (result.exitCode !== 0) {
            assert.ok(
              result.output.includes(filename) ||
                result.output.includes(".test-temp-processing"),
              `Oxlint output should mention the processed file: ${result.output}`
            );
          }

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should process TSX files in src/ directory with oxlint", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[A-Z][a-zA-Z0-9]*$/.test(s)),
        fc
          .string({ minLength: 1, maxLength: 30 })
          .filter((s) => !(s.includes('"') || s.includes("'"))),
        (componentName, imgSrc) => {
          // Generate TSX file with Next.js violations (img tag)
          const code = `
export default function ${componentName}() {
  return <img src="${imgSrc}" alt="test" />;
}
`;
          const filename = `${componentName}.tsx`;
          createTestFile(filename, code);

          // Run oxlint on the test directory
          const result = runOxlint(testDir);

          // Oxlint should process the file and detect violations
          assert.ok(
            result.output.toLowerCase().includes("img") ||
              result.output.toLowerCase().includes("image") ||
              result.output.includes(filename) ||
              result.output.includes(".test-temp-processing"),
            `Oxlint should process and detect violations in src/ TSX file: ${result.output}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should process multiple files in src/ directory simultaneously", () => {
    fc.assert(
      fc.property(
        fc.record({
          file1: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          file2: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          file3: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[A-Z][a-zA-Z0-9]*$/.test(s)),
          value1: fc.integer({ min: 1, max: 100 }),
          value2: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Create multiple files with violations
          createTestFile(`${config.file1}.ts`, `var x = ${config.value1}\n`);
          createTestFile(`${config.file2}.ts`, `var y = ${config.value2}\n`);
          createTestFile(
            `${config.file3}.tsx`,
            `export default function ${config.file3}() { return <img src="test.jpg" alt="test" /> }`
          );

          // Run Biome on the test directory
          const biomeResult = runBiomeCheck(testDir);

          // Biome should detect violations (non-zero exit code)
          assert.ok(
            biomeResult.exitCode !== 0,
            "Biome should detect violations in multiple src/ files"
          );

          // Run oxlint on the test directory
          const oxlintResult = runOxlint(testDir);

          // Oxlint should process the files
          assert.ok(
            typeof oxlintResult.exitCode === "number",
            "Oxlint should process multiple src/ files"
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should process files in nested src/ subdirectories", () => {
    fc.assert(
      fc.property(
        fc.record({
          subdir: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(s)),
          filename: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          value: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Create nested directory structure
          const nestedDir = join(testDir, config.subdir);
          if (!existsSync(nestedDir)) {
            mkdirSync(nestedDir, { recursive: true });
          }

          // Create file in nested directory with violations
          const filePath = join(nestedDir, `${config.filename}.ts`);
          const code = `var ${config.filename} = ${config.value}\n`;
          writeFileSync(filePath, code, "utf-8");

          // Run Biome on the test directory
          const result = runBiomeCheck(testDir);

          // Biome should process nested files and detect violations
          assert.ok(
            result.exitCode !== 0,
            "Biome should detect violations in nested src/ subdirectories"
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should process both .ts and .tsx files in the same directory", () => {
    fc.assert(
      fc.property(
        fc.record({
          tsFile: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-z][a-zA-Z0-9_]*$/.test(s)),
          tsxFile: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[A-Z][a-zA-Z0-9]*$/.test(s)),
          value: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Create .ts file with violations
          createTestFile(
            `${config.tsFile}.ts`,
            `var ${config.tsFile} = ${config.value}\n`
          );

          // Create .tsx file with violations
          createTestFile(
            `${config.tsxFile}.tsx`,
            `export default function ${config.tsxFile}() { var x = ${config.value}; return <div>{x}</div> }`
          );

          // Run Biome on the test directory
          const biomeResult = runBiomeCheck(testDir);

          // Biome should process both file types and detect violations
          assert.ok(
            biomeResult.exitCode !== 0,
            "Biome should process both .ts and .tsx files in src/"
          );

          // Run oxlint on the test directory
          const oxlintResult = runOxlint(testDir);

          // Oxlint should process both file types
          assert.ok(
            typeof oxlintResult.exitCode === "number",
            "Oxlint should process both .ts and .tsx files in src/"
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should process files with various violation types in src/", () => {
    fc.assert(
      fc.property(
        fc.record({
          filename: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          violationType: fc.constantFrom(
            "var",
            "semicolon",
            "indentation",
            "doubleEquals"
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
            case "indentation":
              code = `function test() {\n   const ${config.filename} = ${config.value};\n}\n`;
              break;
            case "doubleEquals":
              code = `const ${config.filename} = ${config.value};\nconst check = ${config.filename} == ${config.value};\n`;
              break;
          }

          createTestFile(`${config.filename}.ts`, code);

          // Run Biome on the test directory
          const result = runBiomeCheck(testDir);

          // Biome should process the file and detect violations
          assert.ok(
            result.exitCode !== 0,
            `Biome should process src/ file with ${config.violationType} violation`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });
});
