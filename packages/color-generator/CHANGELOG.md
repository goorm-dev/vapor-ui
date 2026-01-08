# @vapor-ui/color-generator

## 1.0.0-beta.8

### Tokens

- **BREAKING CHANGE**: rename `color-background-canvas` token to `color-canvas` ([#378](https://github.com/goorm-dev/vapor-ui/pull/378)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

    The canvas background token has been renamed for better semantic clarity and consistency:
    - Token name: `color-background-canvas` → `color-canvas`
    - CSS variable: `--vapor-color-background-canvas` → `--vapor-color-canvas`

    **Migration required:**
    - Update all references from `color-background-canvas` to `color-canvas`
    - Replace CSS variables from `--vapor-color-background-canvas` to `--vapor-color-canvas`

## 1.0.0-beta.7

### Color Generator

- add color-border-normal semantic token that dynamically adapts to background color customization (light: 100 step, dark: 300 step) ([#370](https://github.com/goorm-dev/vapor-ui/pull/370)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

## 1.0.0-beta.6

### etc

- feat: update color generator & color palette ([#337](https://github.com/goorm-dev/vapor-ui/pull/337)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

## 1.0.0-beta.5

### Minor Changes

- caf13a1: feat: create @vapor-ui/color-generator & @vapor-ui/css-generator

### Patch Changes

- 707f705: feat: update color tokens
