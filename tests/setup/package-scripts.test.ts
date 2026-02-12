import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

/**
 * Unit tests for package.json scripts
 * Validates Requirements: 5.1, 5.2, 5.3, 5.4
 *
 * Tests verify that:
 * - All required scripts exist in package.json
 * - Each script contains the correct command
 * - Scripts are configured for linting and formatting
 */

describe("Package Scripts", () => {
  const projectRoot = join(__dirname, "../..");
  const packageJsonPath = join(projectRoot, "package.json");

  let packageJson: { scripts?: Record<string, string> };

  // Load package.json once for all tests
  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error}`);
  }

  describe("script existence", () => {
    it("should have a lint script", () => {
      assert.ok(
        packageJson.scripts?.lint,
        "package.json should contain a 'lint' script"
      );
    });

    it("should have a lint:ox script", () => {
      assert.ok(
        packageJson.scripts?.["lint:ox"],
        "package.json should contain a 'lint:ox' script"
      );
    });

    it("should have a format script", () => {
      assert.ok(
        packageJson.scripts?.format,
        "package.json should contain a 'format' script"
      );
    });

    it("should have a check script", () => {
      assert.ok(
        packageJson.scripts?.check,
        "package.json should contain a 'check' script"
      );
    });
  });

  describe("script commands", () => {
    it("lint script should run biome check", () => {
      const lintScript = packageJson.scripts?.lint;
      assert.ok(lintScript, "lint script should exist");
      assert.ok(
        lintScript.includes("biome check"),
        `lint script should contain 'biome check', got: ${lintScript}`
      );
      assert.ok(
        lintScript.includes("."),
        `lint script should check current directory (.), got: ${lintScript}`
      );
    });

    it("lint:ox script should run oxlint", () => {
      const lintOxScript = packageJson.scripts?.["lint:ox"];
      assert.ok(lintOxScript, "lint:ox script should exist");
      assert.ok(
        lintOxScript.includes("oxlint"),
        `lint:ox script should contain 'oxlint', got: ${lintOxScript}`
      );
      assert.ok(
        lintOxScript.includes("."),
        `lint:ox script should check current directory (.), got: ${lintOxScript}`
      );
    });

    it("format script should run biome check with --write flag", () => {
      const formatScript = packageJson.scripts?.format;
      assert.ok(formatScript, "format script should exist");
      assert.ok(
        formatScript.includes("biome check"),
        `format script should contain 'biome check', got: ${formatScript}`
      );
      assert.ok(
        formatScript.includes("--write"),
        `format script should contain '--write' flag, got: ${formatScript}`
      );
      assert.ok(
        formatScript.includes("."),
        `format script should check current directory (.), got: ${formatScript}`
      );
    });

    it("check script should run both biome and oxlint", () => {
      const checkScript = packageJson.scripts?.check;
      assert.ok(checkScript, "check script should exist");
      assert.ok(
        checkScript.includes("biome check"),
        `check script should contain 'biome check', got: ${checkScript}`
      );
      assert.ok(
        checkScript.includes("oxlint"),
        `check script should contain 'oxlint', got: ${checkScript}`
      );
      assert.ok(
        checkScript.includes("&&"),
        `check script should run both commands sequentially with '&&', got: ${checkScript}`
      );
    });
  });

  describe("script command correctness", () => {
    it("lint script should be exactly 'biome check .'", () => {
      const lintScript = packageJson.scripts?.lint;
      assert.strictEqual(
        lintScript,
        "biome check .",
        `lint script should be 'biome check .', got: ${lintScript}`
      );
    });

    it("lint:ox script should be exactly 'oxlint .'", () => {
      const lintOxScript = packageJson.scripts?.["lint:ox"];
      assert.strictEqual(
        lintOxScript,
        "oxlint .",
        `lint:ox script should be 'oxlint .', got: ${lintOxScript}`
      );
    });

    it("format script should be exactly 'biome check --write .'", () => {
      const formatScript = packageJson.scripts?.format;
      assert.strictEqual(
        formatScript,
        "biome check --write .",
        `format script should be 'biome check --write .', got: ${formatScript}`
      );
    });

    it("check script should be exactly 'biome check . && oxlint .'", () => {
      const checkScript = packageJson.scripts?.check;
      assert.strictEqual(
        checkScript,
        "biome check . && oxlint .",
        `check script should be 'biome check . && oxlint .', got: ${checkScript}`
      );
    });
  });
});
