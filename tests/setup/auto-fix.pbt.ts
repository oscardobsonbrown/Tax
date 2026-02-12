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
 * Property-based tests for auto-fix functionality
 * Feature: ultracite-oxlint-setup
 * Property 10: Auto-fix corrects violations
 *
 * **Validates: Requirements 7.4**
 *
 * These tests verify that the format command (Biome with --write flag)
 * automatically corrects fixable violations in code files.
 */

describe("Property 10: Auto-fix corrects violations", () => {
  const projectRoot = join(__dirname, "../..");
  const testDir = join(projectRoot, ".test-temp-autofix");

  // Helper function to run Biome format (auto-fix) on a file
  function runBiomeFormat(filePath: string): void {
    try {
      execSync(`npx biome check --write "${filePath}"`, {
        cwd: projectRoot,
        encoding: "utf-8",
        stdio: "pipe",
      });
    } catch {
      // Biome may return non-zero exit code even when fixing
      // This is okay as long as the file is modified
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

  // Helper function to read file content
  function readTestFile(filePath: string): string {
    return readFileSync(filePath, "utf-8");
  }

  // Cleanup test directory after tests
  function cleanup() {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  }

  it("should add missing semicolons", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
        fc.integer({ min: 1, max: 100 }),
        (varName, value) => {
          // Generate code without semicolons
          const code = `const ${varName} = ${value}\n`;
          const filename = `test-semi-${varName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should have semicolon added
          assert.ok(
            fixed.includes(`const ${varName} = ${value};`),
            `Auto-fix should add semicolons. Original: ${code}, Fixed: ${fixed}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should fix incorrect indentation to 2 spaces", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
        fc.integer({ min: 1, max: 100 }),
        fc
          .integer({ min: 3, max: 8 })
          .filter((n) => n !== 2), // Wrong indentation
        (funcName, value, wrongIndent) => {
          // Generate code with wrong indentation
          const indent = " ".repeat(wrongIndent);
          const code = `function ${funcName}() {\n${indent}return ${value};\n}\n`;
          const filename = `test-indent-${funcName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should have 2-space indentation
          assert.ok(
            fixed.includes("  return") && !fixed.includes("   return"),
            `Auto-fix should correct indentation to 2 spaces. Original: ${code}, Fixed: ${fixed}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should fix inconsistent spacing around operators", () => {
    fc.assert(
      fc.property(
        fc.record({
          varName: fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          value: fc.integer({ min: 1, max: 100 }),
          spacesBeforeEquals: fc.integer({ min: 0, max: 5 }),
          spacesAfterEquals: fc.integer({ min: 0, max: 5 }),
        }),
        (config) => {
          // Generate code with inconsistent spacing
          const beforeEq = " ".repeat(config.spacesBeforeEquals);
          const afterEq = " ".repeat(config.spacesAfterEquals);
          const code = `const ${config.varName}${beforeEq}=${afterEq}${config.value}\n`;
          const filename = `test-spacing-${config.varName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should have consistent spacing (exactly one space around =)
          assert.ok(
            fixed.includes(`const ${config.varName} = ${config.value};`),
            `Auto-fix should normalize spacing. Original: ${code}, Fixed: ${fixed}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should fix multiple violations in a single file", () => {
    fc.assert(
      fc.property(
        fc.record({
          var1: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          var2: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          value1: fc.integer({ min: 1, max: 100 }),
          value2: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate code with multiple fixable violations
          const code = `const ${config.var1}=${config.value1}\nconst ${config.var2}=${config.value2}\n`;
          const filename = `test-multi-${config.var1}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should fix all violations
          assert.ok(
            fixed.includes(`const ${config.var1} = ${config.value1};`) &&
              fixed.includes(`const ${config.var2} = ${config.value2};`),
            `Auto-fix should correct multiple violations. Original: ${code}, Fixed: ${fixed}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should fix formatting in TSX files", () => {
    fc.assert(
      fc.property(
        fc.record({
          componentName: fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => /^[A-Z][a-zA-Z0-9]*$/.test(s)),
          text: fc
            .string({ minLength: 1, maxLength: 30 })
            .filter((s) => !(s.includes('"') || s.includes("'"))),
        }),
        (config) => {
          // Generate TSX code with formatting violations
          const code = `export default function ${config.componentName}(){const message="${config.text}";return <div>{message}</div>}\n`;
          const filename = `${config.componentName}.tsx`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should have proper formatting (semicolons, spacing, line breaks)
          assert.ok(
            fixed.includes("const message") && fixed.includes(";"),
            `Auto-fix should format TSX files. Original: ${code}, Fixed: ${fixed}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should fix object literal formatting", () => {
    fc.assert(
      fc.property(
        fc.record({
          objName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          key1: fc
            .string({ minLength: 1, maxLength: 10 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          key2: fc
            .string({ minLength: 1, maxLength: 10 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          val1: fc.integer({ min: 1, max: 100 }),
          val2: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate object with poor formatting
          const code = `const ${config.objName}={${config.key1}:${config.val1},${config.key2}:${config.val2}}\n`;
          const filename = `test-obj-${config.objName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should have proper formatting (spacing, semicolon)
          assert.ok(
            fixed.includes(config.key1) &&
              fixed.includes(config.key2) &&
              fixed.trim().endsWith(";"),
            `Auto-fix should format object literals. Original: ${code}, Fixed: ${fixed}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should fix arrow function formatting", () => {
    fc.assert(
      fc.property(
        fc.record({
          funcName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          paramName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          returnValue: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate arrow function with poor formatting
          const code = `const ${config.funcName}=(${config.paramName})=>{return ${config.returnValue}}\n`;
          const filename = `test-arrow-${config.funcName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should have proper formatting (spacing, semicolons)
          assert.ok(
            fixed.includes(config.funcName) &&
              fixed.includes(config.paramName) &&
              fixed.trim().endsWith(";"),
            `Auto-fix should format arrow functions. Original: ${code}, Fixed: ${fixed}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should fix array formatting", () => {
    fc.assert(
      fc.property(
        fc.record({
          arrName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          values: fc.array(fc.integer({ min: 1, max: 100 }), {
            minLength: 2,
            maxLength: 5,
          }),
        }),
        (config) => {
          // Generate array with poor formatting
          const code = `const ${config.arrName}=[${config.values.join(",")}]\n`;
          const filename = `test-arr-${config.arrName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should have proper formatting (spacing, semicolon)
          assert.ok(
            fixed.includes(config.arrName) && fixed.trim().endsWith(";"),
            `Auto-fix should format arrays. Original: ${code}, Fixed: ${fixed}`
          );

          // All values should still be present
          for (const val of config.values) {
            assert.ok(
              fixed.includes(String(val)),
              `Auto-fix should preserve array values. Fixed: ${fixed}`
            );
          }

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should fix nested code block formatting", () => {
    fc.assert(
      fc.property(
        fc.record({
          funcName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          varName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          value: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate nested code with poor formatting
          const code = `function ${config.funcName}(){if(true){const ${config.varName}=${config.value};return ${config.varName}}}\n`;
          const filename = `test-nested-${config.funcName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should have proper formatting (line breaks, indentation, spacing)
          const lines = fixed.split("\n").filter((l) => l.trim().length > 0);
          assert.ok(
            lines.length > 3,
            `Auto-fix should add line breaks for nested code. Fixed: ${fixed}`
          );

          // Should have proper indentation
          assert.ok(
            fixed.includes("  if") || fixed.includes("  const"),
            `Auto-fix should indent nested code. Fixed: ${fixed}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should be idempotent (running twice produces same result)", () => {
    fc.assert(
      fc.property(
        fc.record({
          varName: fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          value: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate code with violations
          const code = `const    ${config.varName}=${config.value}\n`;
          const filename = `test-idempotent-${config.varName}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix first time
          runBiomeFormat(filePath);
          const fixed1 = readTestFile(filePath);

          // Run auto-fix second time
          runBiomeFormat(filePath);
          const fixed2 = readTestFile(filePath);

          // Should produce identical results
          assert.strictEqual(
            fixed1,
            fixed2,
            `Auto-fix should be idempotent. First: ${fixed1}, Second: ${fixed2}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should fix class formatting", () => {
    fc.assert(
      fc.property(
        fc.record({
          className: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[A-Z][a-zA-Z0-9]*$/.test(s)),
          methodName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-z][a-zA-Z0-9]*$/.test(s)),
          propName: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-z][a-zA-Z0-9]*$/.test(s)),
          propValue: fc.integer({ min: 1, max: 100 }),
        }),
        (config) => {
          // Generate class with poor formatting
          const code = `class ${config.className}{${config.propName}=${config.propValue};${config.methodName}(){return this.${config.propName}}}\n`;
          const filename = `test-class-${config.className}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should have proper formatting (line breaks, indentation)
          const lines = fixed.split("\n").filter((l) => l.trim().length > 0);
          assert.ok(
            lines.length > 3,
            `Auto-fix should format class with line breaks. Fixed: ${fixed}`
          );

          // Should contain all class members
          assert.ok(
            fixed.includes(config.propName) &&
              fixed.includes(config.methodName),
            `Auto-fix should preserve class members. Fixed: ${fixed}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });

  it("should fix import statement formatting", () => {
    fc.assert(
      fc.property(
        fc.record({
          import1: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[A-Z][a-zA-Z0-9]*$/.test(s)),
          import2: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-z][a-zA-Z0-9]*$/.test(s)),
          module: fc
            .string({ minLength: 1, maxLength: 15 })
            .filter((s) => /^[a-z][a-zA-Z0-9-]*$/.test(s)),
        }),
        (config) => {
          // Generate import with poor formatting and usage to prevent removal
          const code = `import{${config.import1},${config.import2}}from"${config.module}"\nconst x=new ${config.import1}();console.log(${config.import2}(x))\n`;
          const filename = `test-import-${config.import1}.ts`;
          const filePath = createTestFile(filename, code);

          // Run auto-fix
          runBiomeFormat(filePath);

          // Read the fixed content
          const fixed = readTestFile(filePath);

          // Should have proper formatting (spacing, semicolon)
          assert.ok(
            fixed.includes("import") &&
              fixed.includes("from") &&
              fixed.includes(";"),
            `Auto-fix should format import statements. Original: ${code}, Fixed: ${fixed}`
          );

          // Should preserve imports
          assert.ok(
            fixed.includes(config.import1) && fixed.includes(config.import2),
            `Auto-fix should preserve import names. Fixed: ${fixed}`
          );

          cleanup();
        }
      ),
      { numRuns: 1 }
    );
  });
});
