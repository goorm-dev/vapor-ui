---
title: Color Generator
description: '@vapor-ui/color-generator 패키지의 릴리즈 노트입니다.'
---

# @vapor-ui/color-generator

## 1.0.0-beta.8

### Minor Changes

- bb41c2e: **BREAKING CHANGE**: rename `color-background-canvas` token to `color-canvas`

    The canvas background token has been renamed for better semantic clarity and consistency:
    - Token name: `color-background-canvas` → `color-canvas`
    - CSS variable: `--vapor-color-background-canvas` → `--vapor-color-canvas`

    **Migration required:**
    - Update all references from `color-background-canvas` to `color-canvas`
    - Replace CSS variables from `--vapor-color-background-canvas` to `--vapor-color-canvas`

## 1.0.0-beta.7

### Minor Changes

- 174d004: add color-border-normal semantic token that dynamically adapts to background color customization (light: 100 step, dark: 300 step)

## 1.0.0-beta.6

### Patch Changes

- bd523c7: feat: update color generator & color palette

## 1.0.0-beta.5

### Minor Changes

- caf13a1: feat: create @vapor-ui/color-generator & @vapor-ui/css-generator

### Patch Changes

- 707f705: feat: update color tokens
