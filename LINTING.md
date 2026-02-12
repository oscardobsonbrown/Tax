# Linting and Formatting Setup

This project uses a comprehensive linting and formatting setup with **Biome** and **oxlint**, both configured with strict, opinionated presets from **ultracite**.

## Tools Overview

### Biome
- **Primary formatter and linter** for JavaScript, TypeScript, JSX, and JSON
- Fast, all-in-one tool that handles both formatting and linting
- Configured with ultracite's strict presets for consistent, high-quality code
- Provides auto-fix capabilities for many violations

### Oxlint
- **High-performance supplementary linter** built in Rust
- Provides additional Next.js-specific linting rules
- Extremely fast, designed for speed
- Complements Biome with framework-aware checks

### ESLint
- **Legacy linter** still present for backward compatibility
- Biome is now the primary linting tool
- Consider using Biome for all new linting needs

## Configuration Files

### `biome.json`
Configures Biome with:
- **ultracite/core**: 200+ strict rules covering accessibility, complexity, correctness, performance, security, and style
- **ultracite/next**: Next.js-specific rules and overrides
- **Formatting**: 2-space indentation, 80-character line width, semicolons, LF line endings
- **Auto-fixes**: Unused imports, sorted imports, sorted attributes
- **VCS integration**: Respects .gitignore patterns

**Note**: JSON configuration files don't support comments. Refer to this documentation for detailed explanations of each setting.

### `.oxlintrc.json`
Configures oxlint with:
- **ultracite/oxlint/next**: Next.js-specific linting rules
- **Next.js plugin**: Framework-aware rules (no-img-element, no-head-element, etc.)
- **Overrides**: Special handling for Next.js patterns

**Note**: JSON configuration files don't support comments. Refer to this documentation for detailed explanations of each setting.

## Available Scripts

### `npm run lint`
Runs Biome linter and formatter checks **without modifying files**.

```bash
npm run lint
```

Use this to:
- Check for violations in CI/CD pipelines
- Review issues before committing
- Verify code quality

### `npm run lint:ox`
Runs oxlint for supplementary fast linting.

```bash
npm run lint:ox
```

Use this to:
- Get additional Next.js-specific checks
- Perform quick validation
- Complement Biome checks

### `npm run format`
Runs Biome with **auto-fix enabled** (formats and fixes linting issues).

```bash
npm run format
```

Use this to:
- Automatically fix formatting issues
- Organize imports
- Sort JSX attributes
- Apply safe auto-fixes

### `npm run check`
Runs **both Biome and oxlint** for comprehensive validation.

```bash
npm run check
```

Use this to:
- Perform complete code quality checks
- Validate before pushing to repository
- Ensure all linting rules pass

### `npm run typecheck`
Runs TypeScript type checking without emitting files.

```bash
npm run typecheck
```

Use this to:
- Verify type correctness
- Check for TypeScript errors
- Validate type definitions

## Common Workflows

### Before Committing
```bash
# Format and fix all auto-fixable issues
npm run format

# Run comprehensive checks
npm run check

# Verify types
npm run typecheck
```

### In CI/CD Pipeline
```bash
# Check without modifying files
npm run lint

# Run oxlint
npm run lint:ox

# Type check
npm run typecheck

# Build
npm run build
```

### Fixing Violations

1. **Run format first** to auto-fix most issues:
   ```bash
   npm run format
   ```

2. **Review remaining violations**:
   ```bash
   npm run lint
   ```

3. **Manually fix non-auto-fixable issues** such as:
   - File naming conventions (use kebab-case)
   - Array index keys in React (use stable identifiers)
   - Accessibility issues (add proper labels, ARIA attributes)
   - Explicit `any` types (specify proper types)

## Common Violations and Fixes

### CSS Class Sorting
**Issue**: Tailwind classes should be sorted consistently.

**Fix**: Run `npm run format` - Biome will automatically sort classes.

### Import Organization
**Issue**: Imports are not sorted or organized.

**Fix**: Run `npm run format` - Biome will automatically organize imports.

### Missing Semicolons
**Issue**: Statements should end with semicolons.

**Fix**: Run `npm run format` - Biome will automatically add semicolons.

### File Naming Convention
**Issue**: Files should use kebab-case (e.g., `BracketTable.tsx` → `bracket-table.tsx`).

**Fix**: Manually rename files to kebab-case.

### Array Index Keys
**Issue**: Using array indices as React keys can cause performance issues.

**Fix**: Use stable identifiers (e.g., unique IDs) instead of array indices.

### Label Without Control
**Issue**: Form labels must be associated with inputs.

**Fix**: Add `htmlFor` attribute to label or wrap input inside label:
```tsx
// Option 1: Use htmlFor
<label htmlFor="input-id">Label</label>
<input id="input-id" />

// Option 2: Wrap input
<label>
  Label
  <input />
</label>
```

### Explicit Any Types
**Issue**: Using `any` disables type checking.

**Fix**: Specify proper types:
```typescript
// Bad
catch (error: any) { }

// Good
catch (error: unknown) {
  if (error instanceof Error) {
    // Handle error
  }
}
```

## Ignored Directories

The linters automatically ignore:
- `.next/` - Next.js build output
- `node_modules/` - Dependencies
- `build/`, `dist/`, `out/` - Build artifacts
- Files matching `.gitignore` patterns

## IDE Integration

### VS Code
Install the Biome extension for real-time linting and formatting:
1. Install "Biome" extension
2. Set Biome as default formatter in settings
3. Enable format on save

### Other IDEs
Check Biome documentation for integration with your IDE:
https://biomejs.dev/guides/integrate-in-editor/

## Troubleshooting

### "Too many diagnostics" error
If you see this message, increase the limit:
```bash
npm run lint -- --max-diagnostics=1000
```

### Linter conflicts with ESLint
Biome is the primary linter. If ESLint conflicts arise:
1. Prioritize Biome rules
2. Consider disabling conflicting ESLint rules
3. Use Biome for formatting, ESLint for specialized checks only

### Performance issues
Both Biome and oxlint are designed for speed. If you experience slowness:
1. Ensure you're not linting `node_modules/` or build directories
2. Check that `.gitignore` patterns are respected
3. Run linters on specific files/directories when needed

## Resources

- **Biome Documentation**: https://biomejs.dev/
- **Oxlint Documentation**: https://oxc.rs/docs/guide/usage/linter.html
- **Ultracite Presets**: https://github.com/luxass/ultracite
- **Next.js Linting**: https://nextjs.org/docs/app/building-your-application/configuring/eslint

## Migration from ESLint

If you're migrating from ESLint:
1. Keep ESLint configuration for backward compatibility
2. Use Biome as primary formatter and linter
3. Run `npm run format` to apply Biome formatting
4. Gradually adopt Biome rules
5. Consider removing ESLint once fully migrated
