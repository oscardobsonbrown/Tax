import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { satisfies } from "semver";

/**
 * Unit tests for dependency installation
 * Validates Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3
 *
 * Tests verify that:
 * - ultracite ≥7.1.2 is installed as a dev dependency
 * - oxlint ≥1.0.0 is installed as a dev dependency
 * - ultracite preset files exist in node_modules
 */

describe("Dependency Installation", () => {
  const projectRoot = join(__dirname, "../..");
  const packageJsonPath = join(projectRoot, "package.json");

  describe("package.json dependencies", () => {
    it("should contain ultracite ≥7.1.2 in devDependencies", () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

      assert.ok(
        packageJson.devDependencies?.ultracite,
        "ultracite should be in devDependencies"
      );

      const version = packageJson.devDependencies.ultracite.replace(
        /^\^|~/,
        ""
      );
      assert.ok(
        satisfies(version, ">=7.1.2"),
        `ultracite version should be ≥7.1.2, got ${version}`
      );
    });

    it("should contain oxlint ≥1.0.0 in devDependencies", () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

      assert.ok(
        packageJson.devDependencies?.oxlint,
        "oxlint should be in devDependencies"
      );

      const version = packageJson.devDependencies.oxlint.replace(/^\^|~/, "");
      assert.ok(
        satisfies(version, ">=1.0.0"),
        `oxlint version should be ≥1.0.0, got ${version}`
      );
    });
  });

  describe("ultracite preset files", () => {
    const ultraciteConfigPath = join(
      projectRoot,
      "node_modules/ultracite/config"
    );

    it("should have ultracite config directory", () => {
      assert.ok(
        existsSync(ultraciteConfigPath),
        "ultracite/config directory should exist in node_modules"
      );
    });

    it("should have biome preset directory", () => {
      const biomePath = join(ultraciteConfigPath, "biome");
      assert.ok(
        existsSync(biomePath),
        "ultracite/config/biome directory should exist"
      );
    });

    it("should have biome core preset", () => {
      const corePresetPath = join(ultraciteConfigPath, "biome/core");
      assert.ok(
        existsSync(corePresetPath),
        "ultracite/config/biome/core preset should exist"
      );
    });

    it("should have biome next preset", () => {
      const nextPresetPath = join(ultraciteConfigPath, "biome/next");
      assert.ok(
        existsSync(nextPresetPath),
        "ultracite/config/biome/next preset should exist"
      );
    });

    it("should have oxlint preset directory", () => {
      const oxlintPath = join(ultraciteConfigPath, "oxlint");
      assert.ok(
        existsSync(oxlintPath),
        "ultracite/config/oxlint directory should exist"
      );
    });

    it("should have oxlint next preset", () => {
      const nextPresetPath = join(ultraciteConfigPath, "oxlint/next");
      assert.ok(
        existsSync(nextPresetPath),
        "ultracite/config/oxlint/next preset should exist"
      );
    });
  });
});
