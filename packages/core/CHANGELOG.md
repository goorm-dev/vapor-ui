# @vapor-ui/core

## 1.0.0-beta.1

### Patch Changes

- 707f705: feat: update color tokens

## 1.0.0-beta.0

### Major Changes

- 1.0.0-beta.0 Release

### Patch Changes

- Updated dependencies
    - @vapor-ui/hooks@1.0.0-beta.0
    - @vapor-ui/icons@1.0.0-beta.0

## 0.6.0

### Minor Changes

- 4d7eb69: Add new Textarea component with auto-resize functionality
- 4026b68: add field components
- 4a9bad5: add new `MultiSelect` component
- e64e867: change the overlay component interface
- 3fff33e: add new `Select` component
- d294454: remove label components'
- b92cff1: add new `Collapsible` component
- b78f3e1: add new `Tabs` component
- 98dee18: Migrate `Nav` to `NavigationMenu`
- 0880cf7: add new `Sheet` component
- 1d2f506: migrate to `Base UI`
- e1bf119: add inputgroup component
- b4509b1: add new `Popover` component

### Patch Changes

- 2651ee2: eidt tooltip offset
- 6de8824: edit spacing style implementation
- 1ea54c0: fix(Callout): add flex layout for icons and text alignment
    - Add display: 'flex' to align icons and text horizontally
    - Add alignItems: 'center' for vertical centering
    - Add gap spacing between icon and text content
    - Ensures consistent layout behavior with Button component

- 1ba360b: add readonly props
- 2b756c5: fix svg rendering issue on safari
- 6d1a2e3: remove active style when provided readonly
- 1f4ba60: prioritize focus style over hover
- Updated dependencies [450b324]
- Updated dependencies [2b756c5]
- Updated dependencies [e381247]
- Updated dependencies [3bfda49]
    - @vapor-ui/icons@0.4.0

## 0.5.0

### Minor Changes

- df2dbc4: add new `Tooltip` component
- fdbf49d: enhance token structure
- 263874c: add new `Menu` component
- 66a0032: add new `Breadcrumb` component

### Patch Changes

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

## 0.4.0

### Minor Changes

- 2ce16a6: refactor(build): Improve DX by Overhauling CSS Bundling Strategy
- 482e447: feat: The CSS layer names have been changed to “theme,” “reset,” “components,” and “utilities.”
- f5e6651: feat: Add Tailwind CSS v4 Preset

### Patch Changes

- 0c6d39c: fix(RadioGroup): remove incorrectly injected props
- a813633: fix(Text): Add foreground mixin to style entry point
- 242d1e8: style(Badge): add center alignment
- Updated dependencies [30ebcde]
    - @vapor-ui/icons@0.2.0

## 0.3.1

### Patch Changes

- ca267e9: feat: Added primary color custom functionality

## 0.3.0

### Minor Changes

- e139a7f: remove sprinkles on each components

### Patch Changes

- 03655b1: fix(tsup): Correct CSS Layer Priority for vapor-components
- 488c614: refactor: replace text sprinkles into mixins

## 0.2.1

### Patch Changes

- 6749d80: fix(createThemeConfig): support RSC

## 0.2.0

### Minor Changes

- 55f2f42: Callout: added new callout component
- 4725a73: RadioGroup: add new component
- 9f96e2c: Checkbox: Add New `Checkbox` Component
- b59dd77: Switch: add new Switch component
- 267a998: IconButton: remove @vapor-ui/icons for resolving storybook build error
- d7c2714: fix: resolve circular dependency in vanilla-extract and improve tsup build

### Patch Changes

- c5cd0fc: edit dialog & interaction animation functions
- a0c1ff0: chore: tsup spliting disable
- d7c2714: build(tsup): Optimize build system with per-component bundling

## 0.1.0

### Minor Changes

- 68b001c: create avatar , badge , box , button , card , dialog , flex , grid , h-stack , icon-button, nav , text-input , text , theme-provider , v-stack

### Patch Changes

- Updated dependencies [68b001c]
    - @vapor-ui/hooks@0.1.0
    - @vapor-ui/icons@0.1.0
