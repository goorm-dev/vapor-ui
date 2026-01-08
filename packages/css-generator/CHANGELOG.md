# @vapor-ui/css-generator

## 1.0.0-beta.8

### Tokens

- **BREAKING CHANGE**: rename `color-background-canvas` token to `color-canvas` ([#378](https://github.com/goorm-dev/vapor-ui/pull/378)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

    The canvas background token has been renamed for better semantic clarity and consistency:
    - Token name: `color-background-canvas` → `color-canvas`
    - CSS variable: `--vapor-color-background-canvas` → `--vapor-color-canvas`

    **Migration required:**
    - Update all references from `color-background-canvas` to `color-canvas`
    - Replace CSS variables from `--vapor-color-background-canvas` to `--vapor-color-canvas`

### Updated Dependencies

- @vapor-ui/color-generator@1.0.0-beta.8

## 1.0.0-beta.7

### Updated Dependencies

- @vapor-ui/color-generator@1.0.0-beta.7

## 1.0.0-beta.6

### Patch Changes

- bd523c7: feat: update color generator & color palette
- Updated dependencies [bd523c7]
    - @vapor-ui/color-generator@1.0.0

## 1.0.0-beta.5

### Minor Changes

- caf13a1: feat: create @vapor-ui/color-generator & @vapor-ui/css-generator
- 5357a54: feat(theme): Add ThemeScope component and migrate to data-attribute based theming

### Patch Changes

- 707f705: feat: update color tokens
- Updated dependencies [caf13a1]
- Updated dependencies [707f705]
    - @vapor-ui/color-generator@0.1.0
