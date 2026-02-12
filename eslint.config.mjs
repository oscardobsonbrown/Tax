import { defineConfig, globalIgnores } from "eslint/config";
import core from "ultracite/eslint/core";
import next from "ultracite/eslint/next";

const eslintConfig = defineConfig([
  ...core,
  ...next,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
