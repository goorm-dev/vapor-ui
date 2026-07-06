# `$style` Implementation — Plan Index

Spec: `docs/superpowers/specs/2026-06-22-style-fn-design.md`

Spec was split into 5 sub-plans, each producing working/testable software on its own.

| Plan                                             | Subsystem                                                                                                                           | Depends on              | Status |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------ |
| [A](./2026-06-22-style-fn-plan-a-macro-core.md)  | `@vapor-ui/style-macro` core (pure AST → `{code, css}`)                                                                             | —                       | Draft  |
| [B](./2026-06-22-style-fn-plan-b-unplugin.md)    | unplugin adapter + virtual CSS module + Vite/Rollup tests                                                                           | A                       | Draft  |
| [C](./2026-06-22-style-fn-plan-c-core-api.md)    | `$style` symbol in `@vapor-ui/core`, token manifest emit, `@vapor-ui/core/postcss` helper, `apps/storybook` + `apps/website` wiring | A, B                    | Draft  |
| [D](./2026-06-22-style-fn-plan-d-codemod.md)     | `@vapor-ui/codemod css-to-style` (jscodeshift transform + CLI)                                                                      | C (for `$style` symbol) | Draft  |
| [E](./2026-06-22-style-fn-plan-e-deprecation.md) | `$css` deprecation phases 1 + 3 (JSDoc + dev-mode warn)                                                                             | C                       | Draft  |

## Critical path

`A → B → C` is sequential. `D` and `E` are independent of each other and can run in parallel once `C` lands.

```
        ┌──> D (codemod)
A → B → C
        └──> E (deprecation)
```

## Cross-plan invariants (do not break)

1. **Token manifest path**: `@vapor-ui/core` exposes `./tokens.manifest.json` as a package export entry. Macro resolves `@vapor-ui/core/tokens.manifest.json` — never the deep `dist/` path. (Plan B Task 1 + Plan C Task 2.)
2. **Macro package boundary**: `@vapor-ui/style-macro` must not import anything from `@vapor-ui/core` source. Only the JSON manifest. (Plan A Global Constraints.)
3. **`$style` runtime fallback**: returns `''`, warns once in dev. This is what makes type-checking work in editors before the macro runs. (Plan C Task 1.)
4. **Ternary placement**: spec §4.4 + Plan A enforce — ternary only at entry-level (`{ color: x ? '$a' : '$b' }`), never inside condition-objects (`{ color: { default: x ? '$a' : '$b' } }` → build error).
5. **`$css` precedence on collision**: when codemod sees both `$css={{ padding: ... }}` and `padding="..."` on the same element, `$css` wins (matches today's `resolveStyles` runtime). (Plan D Task 1.)
6. **Breakpoint surface**: `sm`/`md`/`lg` only. `vaporCustomMedia` throws on any other key. (Plan C Task 3.)

## Out of scope across all plans

- Phase 4 (`$css` removal in v2.0). Drafted separately when the v2 cycle starts.
- Tokens being moved to a separate `@vapor-ui/tokens` package. The manifest contract is package-agnostic; moving the emitter later does not require changes to the macro.
- SWC native plugin (v2 candidate).
- Turbopack support (Next 16+ users must use `--webpack`).
- Class name minification (v2 candidate).
- Codemod handling of spread / dynamic-object cases (those are reported, not transformed).
