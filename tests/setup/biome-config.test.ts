import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

/**
 * Unit tests for biome.json configuration structure
 * Validates Requirements: 3.1, 3.2, 3.3
 *
 * Tests verify that:
 * - biome.json file exists in project root
 * - File contains valid JSON
 * - extends array includes "ultracite/core" and "ultracite/next"
 * - VCS configuration is present and properly configured
 */

describe("Biome Configuration", () => {
  const projectRoot = join(__dirname, "../..");
  const biomeConfigPath = join(projectRoot, "biome.json");

  describe("biome.json file", () => {
    it("should exist in project root", () => {
      assert.ok(
        existsSync(biomeConfigPath),
        "biome.json should exist in project root"
      );
    });

    it("should contain valid JSON", () => {
      assert.doesNotThrow(() => {
        const content = readFileSync(biomeConfigPath, "utf-8");
        JSON.parse(content);
      }, "biome.json should contain valid JSON");
    });
  });

  describe("extends configuration", () => {
    it("should have extends array with ultracite presets", () => {
      const config = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));

      assert.ok(Array.isArray(config.extends), "extends should be an array");

      assert.ok(
        config.extends.includes("ultracite/core"),
        'extends array should include "ultracite/core"'
      );

      assert.ok(
        config.extends.includes("ultracite/next"),
        'extends array should include "ultracite/next"'
      );
    });

    it("should extend ultracite/core preset", () => {
      const config = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));

      assert.ok(
        config.extends.includes("ultracite/core"),
        'extends array should include "ultracite/core"'
      );
    });

    it("should extend ultracite/next preset", () => {
      const config = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));

      assert.ok(
        config.extends.includes("ultracite/next"),
        'extends array should include "ultracite/next"'
      );
    });
  });

  describe("VCS configuration", () => {
    it("should have vcs configuration present", () => {
      const config = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));

      assert.ok(config.vcs, "vcs configuration should be present");
    });

    it("should have vcs enabled", () => {
      const config = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));

      assert.strictEqual(
        config.vcs?.enabled,
        true,
        "vcs.enabled should be true"
      );
    });

    it("should have git as clientKind", () => {
      const config = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));

      assert.strictEqual(
        config.vcs?.clientKind,
        "git",
        'vcs.clientKind should be "git"'
      );
    });

    it("should use ignore file", () => {
      const config = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));

      assert.strictEqual(
        config.vcs?.useIgnoreFile,
        true,
        "vcs.useIgnoreFile should be true"
      );
    });

    it("should have default branch configured", () => {
      const config = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));

      assert.ok(
        config.vcs?.defaultBranch,
        "vcs.defaultBranch should be configured"
      );

      assert.strictEqual(
        typeof config.vcs.defaultBranch,
        "string",
        "vcs.defaultBranch should be a string"
      );
    });
  });

  describe("schema reference", () => {
    it("should have $schema property for IDE support", () => {
      const config = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));

      assert.ok(
        config.$schema,
        "$schema property should be present for IDE support"
      );

      assert.ok(
        config.$schema.includes("biomejs.dev/schemas"),
        "$schema should reference biomejs.dev schema"
      );
    });
  });
});
