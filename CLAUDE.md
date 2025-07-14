# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is an Angular 20 application with standalone components.

## Build and Development Commands

```bash
# Development
pnpm start                # Start development server (http://localhost:4200)
ng serve                  # Alternative: start development server

# Build
pnpm build                # Build for production
ng build                  # Alternative: build for production

# Testing
pnpm test                 # Run unit tests with Karma
ng test                   # Alternative: run tests

# Other
ng build --watch          # Build with file watching
```

## Angular Application

- Uses Angular 20 with standalone components (no NgModules)
- Main component: `src/app/app.ts`
- Application config: `src/app/app.config.ts`
- Routing configured in `src/app/app.routes.ts`
- Component prefix: `app`
- Testing: Karma + Jasmine

## Package Management

- Uses pnpm as the package manager
- Lock file: `pnpm-lock.yaml` at root level

### Test-Driven Development (TDD)

- Follow Test-Driven Development (TDD) as a principle
- Create tests first based on expected inputs and outputs
- Write only tests without implementation code
- Run tests and confirm they fail
- Commit once tests are verified to be correct
- Then proceed with implementation to make tests pass
- Do not modify tests during implementation, only fix code
- Repeat until all tests pass

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.
## TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
## Angular Best Practices
- Always use standalone components over NgModules
- Don't use explicit `standalone: true` (it is implied by default)
- Use signals for state management
- Implement lazy loading for feature routes
- Use `NgOptimizedImage` for all static images.
## Components
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- DO NOT use `ngStyle`, use `style` bindings instead
## State Management
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
## Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
## Services
- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection


## Language Settings / 言語設定

**IMPORTANT / 重要**: In this project, Claude Code must ALWAYS respond in Japanese. Technical terms can remain in English.

このプロジェクトでは、Claude Codeは**必ず**日本語で返答してください。技術用語は英語のままで問題ありません。

### Examples / 例:
- ✅ 「componentを作成しました」
- ✅ 「TypeScriptの型定義を追加しました」
- ❌ "I've created a new component"
- ❌ "Added TypeScript type definitions"