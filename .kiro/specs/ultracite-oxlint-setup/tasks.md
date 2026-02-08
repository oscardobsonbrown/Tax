# Implementation Plan: Ultracite and Oxlint Setup

## Overview

This implementation plan guides the installation and configuration of ultracite and oxlint for a Next.js TypeScript project. The approach follows a sequential process: install dependencies, create configuration files, update package scripts, and validate the setup. Each task builds on the previous one to ensure a working linting infrastructure.

## Tasks

- [x] 1. Install ultracite and oxlint dependencies
  - Run `npm install --save-dev ultracite oxlint` to add both packages
  - Verify installation by checking package.json devDependencies
  - Verify ultracite preset files exist in node_modules/ultracite/config/
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 1.1 Write unit test for dependency installation
  - Test that package.json contains ultracite ≥7.1.2 and oxlint ≥1.0.0
  - Test that preset files exist in node_modules
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 2. Create Biome configuration file
  - [x] 2.1 Create biome.json in project root
    - Add schema reference for IDE support
    - Extend ultracite/core and ultracite/next presets
    - Configure VCS integration for Git
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 2.2 Write unit test for biome.json structure
    - Test file exists and contains valid JSON
    - Test extends array includes "ultracite/core" and "ultracite/next"
    - Test VCS configuration is present
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Create oxlint configuration file
  - [x] 3.1 Create .oxlintrc.json in project root
    - Add schema reference for IDE support
    - Extend ultracite/oxlint/next preset
    - Enable Next.js plugin
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 3.2 Write unit test for .oxlintrc.json structure
    - Test file exists and contains valid JSON
    - Test extends includes "ultracite/oxlint/next"
    - Test plugins array includes "nextjs"
    - _Requirements: 4.1, 4.2_

- [x] 4. Update package.json scripts
  - [x] 4.1 Add linting and formatting scripts
    - Add "lint": "biome check ."
    - Add "lint:ox": "oxlint ."
    - Update "format": "biome check --write ."
    - Update "check": "biome check . && oxlint ."
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.2 Write unit test for package scripts
    - Test all required scripts exist in package.json
    - Test each script contains the correct command
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Checkpoint - Verify configuration files
  - Ensure all configuration files are created and valid
  - Ensure package.json is updated correctly
  - Ask the user if questions arise

- [x] 6. Write property tests for linting behavior
  - [x] 6.1 Write property test for Biome rule enforcement
    - **Property 4: Biome enforces ultracite rules**
    - Generate code samples violating ultracite rules
    - Run Biome and verify violations are detected
    - **Validates: Requirements 3.4**

  - [x] 6.2 Write property test for Biome formatting
    - **Property 5: Biome formats code consistently**
    - Generate code with varying formatting
    - Run Biome format and verify consistent output (2-space, 80-char, semicolons)
    - **Validates: Requirements 3.5**

  - [x] 6.3 Write property test for oxlint Next.js rules
    - **Property 6: Oxlint enforces Next.js rules**
    - Generate Next.js code violating framework-specific rules
    - Run oxlint and verify violations are detected
    - **Validates: Requirements 4.3**

  - [x] 6.4 Write property test for ignored directories
    - **Property 7: Linters ignore build directories**
    - Create test files in .next/, node_modules/, etc.
    - Run linters and verify these files are not processed
    - **Validates: Requirements 4.4, 6.2, 6.3**

  - [x] 6.5 Write property test for source file processing
    - **Property 8: Linters process source files**
    - Generate TypeScript/TSX files in src/ with violations
    - Run linters and verify all src/ files are processed
    - **Validates: Requirements 5.5, 6.4**

  - [x] 6.6 Write property test for error reporting
    - **Property 9: Linters report errors with context**
    - Generate code with violations at various line numbers
    - Run linters and verify output includes file paths, line numbers, descriptions
    - **Validates: Requirements 7.3**

  - [x] 6.7 Write property test for auto-fix
    - **Property 10: Auto-fix corrects violations**
    - Generate code with auto-fixable violations
    - Run format command and verify violations are corrected
    - **Validates: Requirements 7.4**

  - [x] 6.8 Write property test for successful execution
    - **Property 11: Linters execute successfully on valid code**
    - Generate valid Next.js TypeScript code following ultracite rules
    - Run both linters and verify exit code 0
    - **Validates: Requirements 7.1, 7.2**

- [x] 7. Run validation tests
  - [x] 7.1 Test Biome on existing codebase
    - Run `npm run lint` and review output
    - Identify any violations in existing code
    - _Requirements: 7.1, 7.3_

  - [x] 7.2 Test oxlint on existing codebase
    - Run `npm run lint:ox` and review output
    - Identify any violations in existing code
    - _Requirements: 7.2, 7.3_

  - [x] 7.3 Test auto-fix functionality
    - Run `npm run format` on a test file with violations
    - Verify violations are automatically corrected
    - _Requirements: 7.4_

- [x] 8. Document the setup
  - [x] 8.1 Add comments to configuration files
    - Add explanatory comments to biome.json
    - Add explanatory comments to .oxlintrc.json
    - _Requirements: 6.5_

  - [x] 8.2 Update README or add LINTING.md
    - Document the linting setup and available scripts
    - Explain the relationship between ESLint, Biome, and oxlint
    - Provide guidance on running linters and fixing violations
    - _Requirements: 6.5_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Run all linting scripts: `npm run check`
  - Run type checking: `npm run typecheck`
  - Verify the project builds successfully: `npm run build`
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster setup
- The core setup (tasks 1-5) provides a working linting infrastructure
- Property tests (task 6) validate correctness across various inputs
- Validation tests (task 7) ensure the setup works with the existing codebase
- Documentation (task 8) helps team members understand the new linting setup
- Consider adding pre-commit hooks with lint-staged for automatic formatting
- The existing ESLint configuration can coexist with Biome/oxlint
- Biome should be the primary formatter and linter going forward
