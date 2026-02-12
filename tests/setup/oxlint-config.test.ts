import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

/**
 * Unit tests for .oxlintrc.json configuration structure
 * Validates Requirements: 4.1, 4.2
 *
 * Tests verify that:
 * - .oxlintrc.json file exists in project root
 * - File contains valid JSON
 * - extends includes "ultracite/oxlint/next"
 * - plugins array includes "nextjs"
 */

describe("Oxlint Configuration", () => {
  const projectRoot = join(__dirname, "../..");
  const oxlintConfigPath = join(projectRoot, ".oxlintrc.json");

  describe(".oxlintrc.json file", () => {
    it("should exist in project root", () => {
      assert.ok(
        existsSync(oxlintConfigPath),
        ".oxlintrc.json should exist in project root"
      );
    });

    it("should contain valid JSON", () => {
      assert.doesNotThrow(() => {
        const content = readFileSync(oxlintConfigPath, "utf-8");
        JSON.parse(content);
      }, ".oxlintrc.json should contain valid JSON");
    });
  });

  describe("extends configuration", () => {
    it("should have extends array", () => {
      const config = JSON.parse(readFileSync(oxlintConfigPath, "utf-8"));

      assert.ok(Array.isArray(config.extends), "extends should be an array");
    });

    it("should include ultracite/oxlint/next preset", () => {
      const config = JSON.parse(readFileSync(oxlintConfigPath, "utf-8"));

      assert.ok(
        config.extends.includes("ultracite/oxlint/next"),
        'extends array should include "ultracite/oxlint/next"'
      );
    });
  });

  describe("plugins configuration", () => {
    it("should have plugins array", () => {
      const config = JSON.parse(readFileSync(oxlintConfigPath, "utf-8"));

      assert.ok(Array.isArray(config.plugins), "plugins should be an array");
    });

    it("should include nextjs plugin", () => {
      const config = JSON.parse(readFileSync(oxlintConfigPath, "utf-8"));

      assert.ok(
        config.plugins.includes("nextjs"),
        'plugins array should include "nextjs"'
      );
    });
  });

  describe("schema reference", () => {
    it("should have $schema property for IDE support", () => {
      const config = JSON.parse(readFileSync(oxlintConfigPath, "utf-8"));

      assert.ok(
        config.$schema,
        "$schema property should be present for IDE support"
      );

      assert.ok(
        config.$schema.includes("oxc.rs/schemas"),
        "$schema should reference oxc.rs schema"
      );
    });
  });

  describe("rules configuration", () => {
    it("should have rules object", () => {
      const config = JSON.parse(readFileSync(oxlintConfigPath, "utf-8"));

      assert.ok(
        typeof config.rules === "object" && config.rules !== null,
        "rules should be an object"
      );
    });
  });
});
