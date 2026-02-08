import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import * as fc from "fast-check";

/**
 * Property-based tests for linter ignored directories
 * Feature: ultracite-oxlint-setup
 * Property 7: Linters ignore build directories
 *
 * **Validates: Requirements 4.4, 6.2, 6.3**
 *
 * These tests verify that linting tools do not process files in ignored
 * directories such as .next/, node_modules/, build/, dist/, and out/.
 */

describe("Property 7: Linters ignore build directories", () => {
  const projectRoot = join(__dirname, "../..");

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
  function createTestFileWithViolations(
    dirPath: string,
    filename: string
  ): string {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
    const filePath = join(dirPath, filename);

    // Create code with obvious violations that would be caught by linters
    const code = `var x = 1
var y = 2
console.log(x == y)
`;
    writeFileSync(filePath, code, "utf-8");
    return filePath;
  }

  // Cleanup test directory after tests
  function cleanup(dirPath: string) {
    if (existsSync(dirPath)) {
      rmSync(dirPath, { recursive: true, force: true });
    }
  }

  it("should ignore files in .next/ directory when running Biome", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
        (filename) => {
          const testDir = join(projectRoot, ".next", "test-temp");
          const filePath = createTestFileWithViolations(
            testDir,
            `${filename}.ts`
          );

          // Run Biome on the entire project
          const result = runBiomeCheck(projectRoot);

          // The output should NOT mention the file in .next/
          assert.ok(
            !(
              result.output.includes(".next/test-temp") ||
              result.output.includes(filePath)
            ),
            `Biome should ignore files in .next/ directory. Output: ${result.output}`
          );

          cleanup(testDir);
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should ignore files in node_modules/ directory when running Biome", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
        (filename) => {
          const testDir = join(
            projectRoot,
            "node_modules",
            "test-temp-package"
          );
          const filePath = createTestFileWithViolations(
            testDir,
            `${filename}.ts`
          );

          // Run Biome on the entire project
          const result = runBiomeCheck(projectRoot);

          // The output should NOT mention the file in node_modules/
          assert.ok(
            !(
              result.output.includes("node_modules/test-temp-package") ||
              result.output.includes(filePath)
            ),
            `Biome should ignore files in node_modules/ directory. Output: ${result.output}`
          );

          cleanup(testDir);
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should ignore files in build/ directory when running Biome", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
        (filename) => {
          const testDir = join(projectRoot, "build");
          const filePath = createTestFileWithViolations(
            testDir,
            `${filename}.ts`
          );

          // Run Biome on the entire project
          const result = runBiomeCheck(projectRoot);

          // The output should NOT mention the file in build/
          assert.ok(
            !(
              result.output.includes("build/") ||
              result.output.includes(filePath)
            ),
            `Biome should ignore files in build/ directory. Output: ${result.output}`
          );

          cleanup(testDir);
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should ignore files in dist/ directory when running Biome", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
        (filename) => {
          const testDir = join(projectRoot, "dist");
          const filePath = createTestFileWithViolations(
            testDir,
            `${filename}.ts`
          );

          // Run Biome on the entire project
          const result = runBiomeCheck(projectRoot);

          // The output should NOT mention the file in dist/
          assert.ok(
            !(
              result.output.includes("dist/") ||
              result.output.includes(filePath)
            ),
            `Biome should ignore files in dist/ directory. Output: ${result.output}`
          );

          cleanup(testDir);
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should ignore files in out/ directory when running Biome", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
        (filename) => {
          const testDir = join(projectRoot, "out");
          const filePath = createTestFileWithViolations(
            testDir,
            `${filename}.ts`
          );

          // Run Biome on the entire project
          const result = runBiomeCheck(projectRoot);

          // The output should NOT mention the file in out/
          assert.ok(
            !(
              result.output.includes("out/") || result.output.includes(filePath)
            ),
            `Biome should ignore files in out/ directory. Output: ${result.output}`
          );

          cleanup(testDir);
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should ignore files in .next/ directory when running oxlint", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
        (filename) => {
          const testDir = join(projectRoot, ".next", "test-temp-ox");
          const filePath = createTestFileWithViolations(
            testDir,
            `${filename}.ts`
          );

          // Run oxlint on the entire project
          const result = runOxlint(projectRoot);

          // The output should NOT mention the file in .next/
          assert.ok(
            !(
              result.output.includes(".next/test-temp-ox") ||
              result.output.includes(filePath)
            ),
            `Oxlint should ignore files in .next/ directory. Output: ${result.output}`
          );

          cleanup(testDir);
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should ignore files in node_modules/ directory when running oxlint", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
        (filename) => {
          const testDir = join(
            projectRoot,
            "node_modules",
            "test-temp-ox-package"
          );
          const filePath = createTestFileWithViolations(
            testDir,
            `${filename}.ts`
          );

          // Run oxlint on the entire project
          const result = runOxlint(projectRoot);

          // The output should NOT mention the file in node_modules/
          assert.ok(
            !(
              result.output.includes("node_modules/test-temp-ox-package") ||
              result.output.includes(filePath)
            ),
            `Oxlint should ignore files in node_modules/ directory. Output: ${result.output}`
          );

          cleanup(testDir);
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should ignore files in multiple ignored directories simultaneously", () => {
    fc.assert(
      fc.property(
        fc.record({
          nextFile: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
          buildFile: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
          distFile: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
        }),
        (config) => {
          // Create files in multiple ignored directories
          const nextDir = join(projectRoot, ".next", "test-multi");
          const buildDir = join(projectRoot, "build");
          const distDir = join(projectRoot, "dist");

          const nextFile = createTestFileWithViolations(
            nextDir,
            `${config.nextFile}.ts`
          );
          const buildFile = createTestFileWithViolations(
            buildDir,
            `${config.buildFile}.ts`
          );
          const distFile = createTestFileWithViolations(
            distDir,
            `${config.distFile}.ts`
          );

          // Run Biome on the entire project
          const biomeResult = runBiomeCheck(projectRoot);

          // None of the ignored files should appear in output
          assert.ok(
            !(
              biomeResult.output.includes(".next/test-multi") ||
              biomeResult.output.includes("build/") ||
              biomeResult.output.includes("dist/")
            ),
            `Biome should ignore all build directories. Output: ${biomeResult.output}`
          );

          // Run oxlint on the entire project
          const oxlintResult = runOxlint(projectRoot);

          // None of the ignored files should appear in output
          assert.ok(
            !(
              oxlintResult.output.includes(".next/test-multi") ||
              oxlintResult.output.includes("build/") ||
              oxlintResult.output.includes("dist/")
            ),
            `Oxlint should ignore all build directories. Output: ${oxlintResult.output}`
          );

          cleanup(nextDir);
          cleanup(buildDir);
          cleanup(distDir);
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should ignore TypeScript and JavaScript files in ignored directories", () => {
    fc.assert(
      fc.property(
        fc.record({
          filename: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
          extension: fc.constantFrom(".ts", ".tsx", ".js", ".jsx"),
        }),
        (config) => {
          const testDir = join(projectRoot, ".next", "test-extensions");
          const filePath = createTestFileWithViolations(
            testDir,
            `${config.filename}${config.extension}`
          );

          // Run Biome on the entire project
          const biomeResult = runBiomeCheck(projectRoot);

          // The file should be ignored regardless of extension
          assert.ok(
            !(
              biomeResult.output.includes(".next/test-extensions") ||
              biomeResult.output.includes(filePath)
            ),
            `Biome should ignore ${config.extension} files in .next/. Output: ${biomeResult.output}`
          );

          // Run oxlint on the entire project
          const oxlintResult = runOxlint(projectRoot);

          // The file should be ignored regardless of extension
          assert.ok(
            !(
              oxlintResult.output.includes(".next/test-extensions") ||
              oxlintResult.output.includes(filePath)
            ),
            `Oxlint should ignore ${config.extension} files in .next/. Output: ${oxlintResult.output}`
          );

          cleanup(testDir);
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should ignore nested directories within ignored directories", () => {
    fc.assert(
      fc.property(
        fc.record({
          subdir: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
          filename: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
        }),
        (config) => {
          const testDir = join(projectRoot, ".next", "cache", config.subdir);
          const filePath = createTestFileWithViolations(
            testDir,
            `${config.filename}.ts`
          );

          // Run Biome on the entire project
          const biomeResult = runBiomeCheck(projectRoot);

          // Nested directories should also be ignored
          assert.ok(
            !(
              biomeResult.output.includes(".next/cache") ||
              biomeResult.output.includes(filePath)
            ),
            `Biome should ignore nested directories in .next/. Output: ${biomeResult.output}`
          );

          // Run oxlint on the entire project
          const oxlintResult = runOxlint(projectRoot);

          // Nested directories should also be ignored
          assert.ok(
            !(
              oxlintResult.output.includes(".next/cache") ||
              oxlintResult.output.includes(filePath)
            ),
            `Oxlint should ignore nested directories in .next/. Output: ${oxlintResult.output}`
          );

          cleanup(join(projectRoot, ".next", "cache"));
        }
      ),
      { numRuns: 1 }
    );
  });
});
