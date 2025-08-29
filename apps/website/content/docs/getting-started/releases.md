---
title: Releases
description: 각 Vapor UI 릴리스의 Chanagelogs입니다.
---

## 0.5.0

### @vapor-ui/core

#### Minor Changes

- df2dbc4: add new `Tooltip` component
- fdbf49d: enhance token structure
- 263874c: add new `Menu` component
- 66a0032: add new `Breadcrumb` component

#### Patch Changes

- b498ae2: Fix RadioGroup indicator color to use white background instead of theme-dependent background normal
- fe0d153: Align CSS variable naming with new build identifiers config
- 7b1b889: remove hover state when used touchscreen
- 74b7c97: add VComponentProps
- 3611d89: style(Button): add no-wrap
- 9188b0e: Enhance vanillaExtractPlugin identifiers for better debugging
- 96c0f7a: add box-shadow tokens
- Updated dependencies [c4d0e8e]
- Updated dependencies [a156f82]
    - @vapor-ui/icons@0.3.0

---

## 0.4.0

### @vapor-ui/core

#### Minor Changes

- 2ce16a6: refactor(build): Improve DX by Overhauling CSS Bundling Strategy
- 482e447: feat: The CSS layer names have been changed to “theme,” “reset,” “components,” and “utilities.”
- f5e6651: feat: Add Tailwind CSS v4 Preset

#### Patch Changes

- 0c6d39c: fix(RadioGroup): remove incorrectly injected props
- a813633: fix(Text): Add foreground mixin to style entry point
- 242d1e8: style(Badge): add center alignment
- Updated dependencies [30ebcde]
    - @vapor-ui/icons@0.2.0

---

## 0.3.1

### @vapor-ui/core

#### Patch Changes

- ca267e9: feat: Added primary color custom functionality

---

## 0.3.0

### @vapor-ui/core

#### Minor Changes

- e139a7f: remove sprinkles on each components

#### Patch Changes

- 03655b1: fix(tsup): Correct CSS Layer Priority for vapor-components
- 488c614: refactor: replace text sprinkles into mixins

### @vapor-ui/icons

#### Minor Changes

- c4d0e8e: Add new icons from Figma

    **New Basic Icons:** `LinearScaleOutlineIcon`

    **Also Updated:**

    - Basic Icons: `PlayIcon`, `ReplaceIcon`, `ClassIcon`, `ArrowUpOutlineIcon`, `ArrowDownOutlineIcon`, `TerminalOutlineIcon`, `ViewShrinkOutlineIcon`, `FolderSearchIcon`, `StarOutlineIcon`, `PriceOutlineIcon`, `HistoryOutlineIcon`, `CardsOutlineIcon`, `ZoomOutOutlineIcon`, `IntelliSensePropertyOutlineIcon`, `CorrectOutlineIcon`, `ChevronDoubleRightOutlineIcon`, `AutoCodeOutlineIcon`, `ChapterOutlineIcon`
    - Symbol Icons: `RstudioColorIcon`

- a156f82: Add new icons from Figma

    **New Basic Icons:** `SidenavIcon`

---

## 0.2.1

### @vapor-ui/core

#### Patch Changes

- 6749d80: fix(createThemeConfig): support RSC

---

## 0.2.0

### @vapor-ui/core

#### Minor Changes

- 55f2f42: Callout: added new callout component
- 4725a73: RadioGroup: add new component
- 9f96e2c: Checkbox: Add New `Checkbox` Component
- b59dd77: Switch: add new Switch component
- 267a998: IconButton: remove @vapor-ui/icons for resolving storybook build error
- d7c2714: fix: resolve circular dependency in vanilla-extract and improve tsup build

#### Patch Changes

- c5cd0fc: edit dialog & interaction animation functions
- a0c1ff0: chore: tsup spliting disable
- d7c2714: build(tsup): Optimize build system with per-component bundling

### @vapor-ui/icons

#### Minor Changes

- 30ebcde: feat: Add new icons and update existing icon components

    ## New Icons Added

    - `AlignJustifyOutlineIcon`, `CopyAsMarkdownOutlineIcon`, `IndentDecreaseOutlineIcon`, `SlotIcon`, `TextScanOutlineIcon`

    ## Updated Icons

    - Updated approximately 190 existing icons with refined SVG paths and improved rendering
    - Minor coordinate adjustments for better visual consistency
    - Enhanced clipPath definitions where needed

---

## 0.1.0

### @vapor-ui/core

#### Minor Changes

- 68b001c: create avatar , badge , box , button , card , dialog , flex , grid , h-stack , icon-button, nav , text-input , text , theme-provider , v-stack

#### Patch Changes

- Updated dependencies [68b001c]
    - @vapor-ui/hooks@0.1.0
    - @vapor-ui/icons@0.1.0

### @vapor-ui/hooks

#### Minor Changes

- 68b001c: create avatar , badge , box , button , card , dialog , flex , grid , h-stack , icon-button, nav , text-input , text , theme-provider , v-stack

### @vapor-ui/icons

#### Minor Changes

- 68b001c: create avatar , badge , box , button , card , dialog , flex , grid , h-stack , icon-button, nav , text-input , text , theme-provider , v-stack

---
