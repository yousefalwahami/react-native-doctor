---
name: react-doctor
description: Diagnose and fix React codebase health issues. Use when reviewing React code, fixing performance problems, auditing security, or improving code quality. Run react-doctor to scan for issues, then fix them.
version: 1.0.0
---

# React Doctor

A CLI that audits your React codebase for security, performance, correctness, and architecture issues, then outputs a 0-100 score with actionable diagnostics.

## When to Use

- When reviewing or auditing React code
- When fixing performance, security, or correctness issues
- When a user asks to improve their React codebase health
- When onboarding to a new React project to find existing problems
- After making large changes to verify nothing regressed

## How to Run

Run this command at the project root:

```bash
npx -y react-doctor@latest .
```

Use `--verbose` to see affected files and line numbers:

```bash
npx -y react-doctor@latest . --verbose
```

Use `--fix` to open Ami and auto-fix all issues:

```bash
npx -y react-doctor@latest . --fix
```

## What It Checks

React Doctor runs 47+ rules across these categories:

### Security

- Hardcoded secrets exposed to client bundle (API keys, tokens)
- eval() and dynamic code execution risks

### State & Effects

- Derived state computed in useEffect (should compute during render)
- Data fetched in useEffect without cleanup (race conditions)
- useState initialized from prop (should derive during render)
- Cascading setState calls in useEffect
- Missing lazy initialization for expensive useState
- Stale closures in setState updates

### Architecture

- Components defined inside other components (destroys state every render)
- Giant components that should be split
- Inline render functions (breaks reconciliation)
- Non-descriptive event handler names

### Performance

- Animating layout properties (width, height, top, left) instead of transform
- transition-all causing unnecessary repaints
- Large animated blur values exceeding GPU memory on mobile
- useMemo on simple expressions (unnecessary overhead)

### Correctness

- Array index used as key (causes bugs when items are reordered)
- Conditional rendering bugs

### Next.js

- Missing metadata or generateMetadata export (hurts SEO)
- Client-side fetching for server data
- Async client components (not supported)
- Using `<img>` instead of `next/image`
- Using `<a>` instead of `next/link`
- redirect() inside try-catch (throws internally)

### Bundle Size

- Barrel file imports bloating bundles
- Full lodash imports instead of individual functions
- moment.js (300kb+, use date-fns or dayjs)
- Heavy libraries without code splitting

### Server

- Server actions missing authentication checks
- Blocking operations that should use after()

### Accessibility

- Missing prefers-reduced-motion checks for animations

### Dead Code

- Unused files, exports, types, and duplicate exports

## Workflow

1. Run `npx -y react-doctor@latest . --verbose` to scan the codebase
2. Read every diagnostic, noting the file paths and line numbers
3. Fix issues one by one, starting with errors (highest severity)
4. Re-run react-doctor to verify the score improved
5. Repeat until the score is above 75 (Great)

## Interpreting the Score

| Score  | Label      | Meaning                                            |
| ------ | ---------- | -------------------------------------------------- |
| 75-100 | Great      | Codebase follows React best practices              |
| 50-74  | Needs work | Several issues that should be addressed            |
| 0-49   | Critical   | Significant problems that need immediate attention |
