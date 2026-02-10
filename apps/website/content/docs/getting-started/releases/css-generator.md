---
title: Css Generator
description: '@vapor-ui/css-generator 패키지의 릴리즈 노트입니다.'
---

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

### Etc.

- feat: update color generator & color palette ([#337](https://github.com/goorm-dev/vapor-ui/pull/337)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Updated Dependencies

- @vapor-ui/color-generator@1.0.0-beta.6

## 1.0.0-beta.5

### Theme

- feat(theme): Add ThemeScope component and migrate to data-attribute based theming ([#278](https://github.com/goorm-dev/vapor-ui/pull/278)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Etc.

- feat: create @vapor-ui/color-generator & @vapor-ui/css-generator ([#234](https://github.com/goorm-dev/vapor-ui/pull/234)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- feat: update color tokens ([#261](https://github.com/goorm-dev/vapor-ui/pull/261)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Updated Dependencies

- @vapor-ui/color-generator@1.0.0
