# LiveCodes: AI Assistant Developer Guide

This document provides comprehensive guidance for AI assistants working on the LiveCodes codebase. LiveCodes is a feature-rich, open-source, client-side code playground supporting 90+ languages/frameworks.

## Table of Contents

- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Architecture](#architecture)
- [Development Workflow](#development-workflow)
- [Code Conventions](#code-conventions)
- [Testing Strategy](#testing-strategy)
- [Common Tasks](#common-tasks)
- [Key Files Reference](#key-files-reference)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is LiveCodes?

LiveCodes is a client-side code playground that runs entirely in the browser. It supports 90+ programming languages and frameworks without requiring server-side compilation or execution.

**Key Characteristics:**
- **Client-Side Only**: All code compilation and execution happens in the browser
- **Zero Backend**: No servers, databases, or backend infrastructure required
- **Multi-Language**: Supports 90+ languages including Python, Go, Ruby, PHP (via WebAssembly)
- **Embeddable**: Can be embedded as an iframe in any webpage via SDK
- **Extensible**: Modular architecture allows easy addition of new languages and features

### Tech Stack Summary

| Component | Technology |
|-----------|------------|
| **Language** | TypeScript 5.4.5 (strict mode) |
| **Build Tool** | esbuild 0.20.2 |
| **Package Manager** | npm |
| **Node Version** | v24.4.1 (see `.nvmrc`) |
| **Editors** | Monaco 0.48.0, CodeMirror, Blockly, CodeJar, Quill |
| **Testing** | Jest 29.7.0 (unit), Playwright 1.32.3 (e2e) |
| **Linting** | ESLint 9.20.1, Prettier 3.2.5, Stylelint 14.5.0 |
| **Runtime Target** | ES2020, DOM APIs |

---

## Repository Structure

```
/home/user/zp-editor/
├── src/
│   ├── livecodes/           # Main application (90+ modules)
│   │   ├── UI/              # UI components (28 modules)
│   │   ├── editor/          # Editor implementations (Monaco, CodeMirror, etc.)
│   │   ├── compiler/        # Compilation engine (worker-based)
│   │   ├── languages/       # 93+ language definitions
│   │   ├── services/        # Backend services (CDN, auth, modules)
│   │   ├── config/          # Configuration management
│   │   ├── storage/         # Data persistence layer
│   │   ├── import/          # Import from GitHub, CodePen, etc.
│   │   ├── export/          # Export to various platforms
│   │   ├── i18n/            # Internationalization (40+ languages)
│   │   └── utils/           # Utility functions
│   ├── sdk/                 # Public SDK for embedding
│   └── _modules/            # Dynamically loaded modules
├── e2e/                     # Playwright end-to-end tests
├── docs/                    # Docusaurus documentation site
├── storybook/               # Storybook component stories
├── scripts/                 # Build and utility scripts
├── build/                   # Compiled output (gitignored)
└── patches/                 # npm package patches
```

### Key Directories Explained

**`src/livecodes/`**: The heart of the application
- **`core.ts`** (5,772 lines): Main application logic and initialization
- **`index.ts`** (131 lines): Page loader and bootstrap
- **`main.ts`** (252 lines): SDK entry point for iframe loading
- **`languages/`**: Each language has its own module with compiler config
- **`UI/`**: Screen components (welcome, menu, settings, share, deploy, etc.)
- **`editor/`**: Multiple editor backends with unified interface
- **`compiler/`**: WebWorker-based compilation pipeline

**`src/sdk/`**: Public API for developers
- **`index.ts`** (17,518 lines): Main SDK with all public methods
- **`models.ts`** (52,879 lines): TypeScript type definitions
- **`vue.ts`**: Vue component wrapper
- React/Svelte/Solid wrappers also available

**`scripts/`**: Build tooling
- **`build.js`**: Main esbuild-based build script
- **`i18n-*.js`**: Internationalization management
- **`start-release.mjs`**: Release automation

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│  External Interface (livecodes.io/browser.html)     │
└───────────────────┬─────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Main Entry (main.ts) - SDK & iframe loader         │
└───────────────────┬─────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Index (index.ts) - Loading & initialization        │
└───────────────────┬─────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Core (core.ts) - Main application logic            │
└─────┬──────┬──────┬──────┬──────┬──────┬───────────┘
      │      │      │      │      │      │
      ↓      ↓      ↓      ↓      ↓      ↓
   Editor  Compiler Config Storage UI  Services
   System  (Worker) Manager (Async) Comps (CDN/Auth)
      │      │      │      │      │      │
      └──────┴──────┴──────┴──────┴──────┘
                    ↓
         Result Pane & Output
```

### Key Architectural Patterns

#### 1. **Modular Language System**

Each language is self-contained:

```typescript
// src/livecodes/languages/typescript/lang-typescript.ts
export const typescript: LanguageSpecs = {
  name: 'typescript',
  title: 'TypeScript',
  compiler: 'typescript',
  editor: 'monaco',
  editorLanguage: 'typescript',
  extensions: ['.ts'],
  // ... more config
};
```

#### 2. **Worker-Based Compilation**

Heavy compilation runs in WebWorkers to prevent UI blocking:

```
Main Thread                     Worker Thread
─────────────                   ─────────────
compile.page.ts  ←─────────→   compile.worker.ts
    ↓                                ↓
Request compilation          Execute compiler
    ↓                                ↓
Receive result  ←───────────  Return compiled code
```

#### 3. **Event-Driven Communication**

```typescript
// Custom events for loose coupling
const pub = createPub<ConfigChangeEvent>();
pub.subscribe((config) => handleConfigChange(config));
pub.publish(newConfig);
```

#### 4. **Storage Layer**

```typescript
// Async storage with encryption support
import { createStorage } from './storage';

const storage = createStorage();
await storage.setItem('key', value);
const data = await storage.getItem('key');
```

#### 5. **Three Execution Modes**

1. **Full App** (`app.ts`): Complete IDE with full UI
2. **Embed** (`embed.ts`): Lightweight iframe playground
3. **Headless** (`headless.ts`): No UI, API-only

### Compilation Flow

```
User Code (TypeScript)
       ↓
Editor Buffer
       ↓
Compiler Service (detects language)
       ↓
Worker Thread (runs Babel/TypeScript/etc.)
       ↓
Compiled JavaScript
       ↓
Result Pane (iframe sandbox)
       ↓
Console Output
```

---

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone https://github.com/live-codes/livecodes
cd livecodes

# Install dependencies (uses npm)
npm install

# Export i18n strings (required before first build)
npm run i18n-export

# Build the app
npm run build

# Start development server (watch + build + serve)
npm run start
```

### Development Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Watch files, rebuild on change, serve at http://127.0.0.1:8080 |
| `npm run serve` | Serve built app (without watching) |
| `npm run build` | Full production build |
| `npm run build:app` | Build app only (skip docs/storybook) |
| `npm run clean` | Delete build directory |
| `npm run docs` | Start docs dev server at http://localhost:3000 |
| `npm run storybook` | Start Storybook at http://localhost:6006 |

### Testing Commands

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests (unit + lint) |
| `npm run test:unit` | Jest unit tests only |
| `npm run test:lint` | ESLint + Prettier + Stylelint |
| `npm run e2e` | Playwright end-to-end tests |
| `npm run cov` | Generate coverage report |
| `npm run fix` | Auto-fix lint/format issues |

### Build Process

The build uses **esbuild** for speed:

```bash
npm run build
  ├── Clean build directory
  ├── Copy static assets
  ├── Build i18n locale files
  ├── Compile SCSS to CSS
  ├── Bundle JavaScript:
  │   ├── app.*.js (full app)
  │   ├── embed.*.js (embed mode)
  │   ├── headless.*.js (headless mode)
  │   └── lang-*.js (language modules)
  ├── Generate TypeScript declarations
  └── Build docs and Storybook
```

**Output**: `build/livecodes/`

Files are hashed for cache busting: `app.a1b2c3d4.js`

### Bundle Size Constraints

LiveCodes enforces strict bundle size limits (`.bundlewatch.config.js`):

- SDK: **5 KB max**
- Core bundles: **30 KB max**
- App/Embed/Headless: **120 KB max**
- Language modules: **10 KB max**
- Styles: **25 KB max**
- i18n files: **15 KB max**

⚠️ **Always run `npm run test:bundlewatch` after adding code.**

---

## Code Conventions

### TypeScript

**Configuration**: `tsconfig.json`

```json
{
  "strict": true,
  "target": "es6",
  "module": "esnext",
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

**Best Practices:**
- Use strict TypeScript (no implicit `any`)
- Prefer `const` over `let`
- No `var` declarations
- Use type inference where possible
- Export types from `models.ts`
- Use consistent type imports: `import type { Config } from './models'`

### File Naming

```
kebab-case.ts          # Standard files
lang-python.ts         # Language definitions
create-editor.ts       # Factory functions
editor-utils.ts        # Helper utilities
__tests__/             # Test directory
*.spec.ts              # Test files
```

### Module Organization

```typescript
// src/livecodes/example/index.ts
export * from './create-example';
export * from './example-service';
export * from './example-utils';

// Clear exports for public API
```

### Naming Conventions

```typescript
// Interfaces and types: PascalCase
interface Config { }
type LanguageSpecs = { };

// Functions and variables: camelCase
const createEditor = () => { };
const moduleService = { };

// Constants: UPPER_CASE (if truly constant)
const API_VERSION = '1.0.0';

// Private members: no leading underscore (ESLint rule)
// Use TypeScript private/protected instead
```

### ESLint Rules (Key)

From `eslint.config.mjs`:

- ✅ No `console.log` statements
- ✅ No only-tests (`test.only`, `describe.only`)
- ✅ No underscore naming (`_variable`)
- ✅ Explicit member accessibility (`public`/`private`/`protected`)
- ✅ Consistent type imports
- ✅ Prefer `const`, no `var`
- ✅ No duplicate imports
- ❌ No unused locals/parameters
- ❌ No implicit `any`

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-organize-imports"]
}
```

**Auto-format:**
```bash
npm run fix:prettier
```

### Commit Messages

Uses **Conventional Commits** for automatic changelog generation:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting changes
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(editor): add vim keybindings support
fix(compiler): resolve TypeScript import resolution issue
docs: update SDK documentation
```

### Internationalization (i18n)

All user-facing strings must be translatable:

**TypeScript:**
```typescript
// Use window.deps.translateString
const message = window.deps.translateString('app.save', 'Save');
```

**HTML:**
```html
<!-- Use data-i18n attribute -->
<button data-i18n="app.save">Save</button>
```

**After adding strings:**
```bash
npm run i18n-export
```

---

## Testing Strategy

### Unit Tests (Jest)

**Location**: `src/**/__tests__/*.spec.ts`

**Example Test:**
```typescript
// src/livecodes/utils/__tests__/utils.spec.ts
import { objectMap } from '../utils';

describe('objectMap', () => {
  it('should map object values', () => {
    const obj = { a: 1, b: 2 };
    const result = objectMap(obj, (v) => v * 2);
    expect(result).toEqual({ a: 2, b: 4 });
  });
});
```

**Run tests:**
```bash
npm run test:unit
```

**Coverage:**
```bash
npm run cov
```

### End-to-End Tests (Playwright)

**Location**: `e2e/specs/*.spec.ts`

**Configuration**: `playwright.config.ts`

**Example Test:**
```typescript
// e2e/specs/editor.spec.ts
import { test, expect } from '@playwright/test';

test('should load editor', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080');
  await expect(page.locator('.editor')).toBeVisible();
});
```

**Run e2e tests:**
```bash
npm run e2e
```

### Test Coverage Requirements

- Aim for >80% coverage on core modules
- All new features should include tests
- Bug fixes should include regression tests
- Critical paths (compilation, storage) require comprehensive tests

---

## Common Tasks

### Adding a New Language

See [Adding Languages Guide](./docs/docs/contribution/adding-languages.mdx)

**Quick steps:**

1. Create language definition in `src/livecodes/languages/`:

```typescript
// src/livecodes/languages/mylang/lang-mylang.ts
export const mylang: LanguageSpecs = {
  name: 'mylang',
  title: 'My Language',
  compiler: 'mylang',
  extensions: ['.ml'],
  editor: 'monaco',
  editorLanguage: 'mylang',
};
```

2. Add compiler if needed:

```typescript
// src/livecodes/compilers/mylang.ts
export const mylangCompiler = {
  compile: async (code, config) => {
    // Compile code
    return compiledCode;
  },
};
```

3. Register in `src/livecodes/languages/languages.ts`:

```typescript
export const languages: LanguageSpecs[] = [
  // ... existing languages
  mylang,
];
```

4. Add tests and documentation

### Adding a UI Component

1. Create component in `src/livecodes/UI/`:

```typescript
// src/livecodes/UI/my-feature.ts
export const setupMyFeature = async (api: API) => {
  // Initialize UI
  const container = document.getElementById('my-feature');

  // Add event listeners
  container?.addEventListener('click', handleClick);

  // Return cleanup function
  return () => {
    container?.removeEventListener('click', handleClick);
  };
};
```

2. Add to core initialization in `src/livecodes/core.ts`:

```typescript
import { setupMyFeature } from './UI/my-feature';

// In initApp function:
await setupMyFeature(api);
```

3. Add i18n strings and styles if needed

### Making a Pull Request

From `CONTRIBUTING.md` and `.github/PULL_REQUEST_TEMPLATE.md`:

1. **Fork and clone** the repository
2. **Create a branch** from `develop`:
   ```bash
   git checkout develop
   git checkout -b feat/my-feature
   ```
3. **Make changes** following code conventions
4. **Add tests** for new functionality
5. **Run linters and tests**:
   ```bash
   npm run fix    # Auto-fix issues
   npm test       # Run all tests
   ```
6. **Export i18n strings** if you added translatable text:
   ```bash
   npm run i18n-export
   ```
7. **Commit** using conventional commits:
   ```bash
   git commit -m "feat: add awesome feature"
   ```
8. **Push** to your fork:
   ```bash
   git push origin feat/my-feature
   ```
9. **Create PR** targeting `develop` branch
10. **Fill PR template** completely:
    - Check PR type (Feature/Bug Fix/etc.)
    - Add description
    - Link to related issue
    - Add screenshots for visual changes
    - Confirm tests added
    - Confirm docs updated

### Debugging Tips

**Enable source maps in dev mode:**
```typescript
// Build script automatically includes sourcemaps in dev mode
npm run start
```

**View compiled code:**
- Open the playground
- Click "Tools" → "Compiled Code" tab

**Console debugging:**
- Use `console.log` during development
- Remove before committing (ESLint will error)

**Monaco editor debugging:**
```typescript
// Access Monaco instance
const editor = await getEditor();
console.log(editor.getValue());
```

---

## Key Files Reference

### Critical Files (Must Understand)

| File | Lines | Purpose |
|------|-------|---------|
| `src/livecodes/core.ts` | 5,772 | Main app logic, initialization, API |
| `src/sdk/index.ts` | 17,518 | Public SDK, embedding API |
| `src/sdk/models.ts` | 52,879 | All TypeScript type definitions |
| `src/livecodes/index.ts` | 131 | Page loader and bootstrap |
| `src/livecodes/main.ts` | 252 | SDK entry point |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `tsconfig.json` | TypeScript compiler configuration |
| `eslint.config.mjs` | ESLint rules (flat config) |
| `playwright.config.ts` | E2E test configuration |
| `.nvmrc` | Node.js version (v24.4.1) |
| `.bundlewatch.config.js` | Bundle size limits |
| `.prettierrc` | Code formatting rules |
| `.stylelintrc.json` | CSS linting rules |

### Build Scripts

| File | Purpose |
|------|---------|
| `scripts/build.js` | Main esbuild-based build script |
| `scripts/i18n-export.js` | Extract translatable strings |
| `scripts/i18n-import.mjs` | Import translations from Lokalise |
| `scripts/start-release.mjs` | Release automation |
| `scripts/hash.js` | Add content hashes to filenames |

---

## Troubleshooting

### Common Issues

#### Build Errors

**Issue**: `Cannot find module 'X'`
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue**: TypeScript errors after pulling changes
```bash
# Solution: Rebuild TypeScript declarations
npm run build:ts
```

**Issue**: Bundle size exceeds limit
```bash
# Solution: Check bundle size report
npm run test:bundlewatch

# Optimize:
# - Lazy load heavy modules
# - Use dynamic imports
# - Check for duplicate dependencies
```

#### Test Failures

**Issue**: Jest tests fail with "Cannot find module"
```bash
# Solution: Clear Jest cache
npx jest --clearCache
npm run test:unit
```

**Issue**: Playwright tests timeout
```bash
# Solution: Increase timeout in playwright.config.ts
# Or run with more retries
npm run e2e -- --retries=3
```

#### Runtime Errors

**Issue**: "Storage is not available"
- Check browser privacy settings
- LocalStorage might be disabled
- Fallback to fake storage in embed mode

**Issue**: "Compiler worker not responding"
- Check browser console for worker errors
- Ensure worker files are served correctly
- Check CORS headers

#### i18n Issues

**Issue**: Strings not translated
```bash
# Solution: Re-export i18n strings
npm run i18n-export

# Then commit the generated files
git add src/livecodes/i18n/
```

### Getting Help

1. **Check existing issues**: https://github.com/live-codes/livecodes/issues
2. **Start a discussion**: https://github.com/live-codes/livecodes/discussions
3. **Read the docs**: https://livecodes.io/docs/
4. **Check Storybook**: https://livecodes.io/stories

---

## AI Assistant Best Practices

When working on LiveCodes as an AI assistant:

### DO ✅

- **Read existing code** before making changes
- **Follow TypeScript strict mode** - use proper types
- **Add tests** for new features and bug fixes
- **Run linters** before committing: `npm run fix`
- **Check bundle sizes** after changes: `npm run test:bundlewatch`
- **Export i18n strings** if you add user-facing text: `npm run i18n-export`
- **Use conventional commits** for clear changelog
- **Colocate tests** in `__tests__/` directories
- **Document public APIs** with JSDoc comments
- **Ask for clarification** if requirements are ambiguous

### DON'T ❌

- **Don't commit console.log** - ESLint will fail
- **Don't use `var`** - use `const` or `let`
- **Don't use underscores** for naming - ESLint rule
- **Don't skip tests** - all code should be tested
- **Don't ignore bundle size** - it's strictly enforced
- **Don't modify `_modules/`** - it's auto-generated
- **Don't push to `main`** - branch from `develop`
- **Don't use force-push** if PR has reviews
- **Don't add unused dependencies** - keep bundle small
- **Don't hardcode strings** - use i18n

### Code Review Checklist

Before marking work as complete:

- [ ] TypeScript compiles without errors
- [ ] ESLint passes: `npm run lint:eslint`
- [ ] Prettier formatted: `npm run lint:prettier`
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Bundle size within limits: `npm run test:bundlewatch`
- [ ] i18n strings exported: `npm run i18n-export`
- [ ] Conventional commit message used
- [ ] No console.log statements
- [ ] No underscore naming
- [ ] Types properly defined
- [ ] Tests added/updated
- [ ] Documentation updated (if needed)

---

## Summary

LiveCodes is a sophisticated, client-side code playground with:

- **Modular architecture** - easy to extend with new languages and features
- **Worker-based compilation** - non-blocking execution
- **Strict type safety** - comprehensive TypeScript coverage
- **Bundle size constraints** - performance-focused
- **Multi-editor support** - Monaco, CodeMirror, etc.
- **90+ languages** - extensive language ecosystem
- **Comprehensive testing** - unit and e2e tests
- **i18n support** - 40+ UI languages

When contributing, focus on:
1. Following existing patterns
2. Maintaining strict TypeScript
3. Keeping bundles small
4. Adding comprehensive tests
5. Using conventional commits

For questions, see:
- **Docs**: https://livecodes.io/docs/
- **Issues**: https://github.com/live-codes/livecodes/issues
- **Discussions**: https://github.com/live-codes/livecodes/discussions

---

**Last Updated**: 2025-11-17
**Version**: Based on LiveCodes v47
**Maintained By**: LiveCodes Community
