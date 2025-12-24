# @vapor-ui/core

## 1.0.0

### Minor Changes

- a935156: add new `FloatingBar` component

### Patch Changes

- b6bd4db: adjust to max-width in dialog
- a935156: clone elements & enhance customizability
- Updated dependencies [c968e76]
- Updated dependencies [a935156]
- Updated dependencies [712585a]
    - @vapor-ui/icons@1.0.0
    - @vapor-ui/hooks@1.0.0

## 1.0.0-beta.11

### Patch Changes

- af4ea2b: Correct background-color of TextInput component
- 8c5c755: clone elements & enhance customizability
- Updated dependencies [8c5c755]
- Updated dependencies [e9e83a8]
    - @vapor-ui/hooks@1.0.0-beta.6
    - @vapor-ui/icons@1.0.0-beta.6

## 1.0.0-beta.10

### Patch Changes

- af2d36f: avoid overflowing when toast width is wider than view port width

## 1.0.0-beta.9

### Minor Changes

- afa45da: remove toastManager

## 1.0.0-beta.8

### Minor Changes

- 308fd25: add new `Toast` component

## 1.0.0-beta.7

### Minor Changes

- 40bfa0a: change components interface
- 1aecc3d: synchronized color tokens with figma
- dbb74cf: add new `Table` component
- d4be5bb: add new `Pagination` component
- 9f9b700: **BREAKING CHANGE**: Remove `stretch` prop from Button, IconButton, and NavigationMenu components

    The `stretch` prop has been removed to align with Figma's component variant system. In Figma, width control is handled via "Fill Container" (Auto Layout), not as a component variant.

    **Migration Guide:**

    Replace `stretch` prop with Tailwind's `w-full` utility class:

    ```tsx
    // Before
    <Button stretch>Submit</Button>
    <NavigationMenu stretch>...</NavigationMenu>

    // After
    <Button className="w-full">Submit</Button>
    <NavigationMenu className="w-full">...</NavigationMenu>
    ```

    **Why this change:**
    - Maintains Figma-React design system parity (SSOT principle)
    - Follows "React Props = Figma Variants" architectural principle
    - Aligns with Vapor UI's 4-layer component architecture (Container, Interaction, Contents, Slot)
    - Layout concerns should be handled by parent containers, not component props

### Patch Changes

- 1fd7efc: Updated Menu.Item paddingRight from 6px to 12px to match Figma design specification
- ed63947: Correct MenuPositionerPrimitive sideOffset from 8px to 4px to match Figma spec

## 1.0.0-beta.6

### Patch Changes

- bd523c7: feat: update color generator & color palette

## 1.0.0-beta.5

### Minor Changes

- 27c0ba9: export component with namespace
- f8af6e2: feat: remove ThemeScript & simplify ThemeProvider
- c9e4b68: migrate to base-ui beta v4
- 220cda2: change components interface
- 216866e: feat: add new component `RadioCard`
- 6c02d6f: unreflected content revisions
- f17650a: add uilitiy props
- b581b9f: add `Form` component
- 7928a67: add subcomponent props to `Content`
- e12f4c4: split label into vertical/horizontal
- 5357a54: feat(theme): Add ThemeScope component and migrate to data-attribute based theming
- 98170c1: Add white foreground variant to foreground recipe

### Patch Changes

- abeac6d: Unified the Cascade Layer into a single layer `vapor`
- 3819233: Fix checkbox borderRadius sync error
- ee61a32: Synchronize the aria-labelledby with the recieved id prop
- df5cb78: separate `readonly` from `disabled`
- 707f705: feat: update color tokens
- f0f643b: feat: Remove Font Loading from CSS Build
- 43cfefb: feat: add font banner
- 74dc538: ### Features
    - **Enabled CSS Tree-shaking:** Component CSS is now imported by its corresponding JS file instead of being in the global `styles.css`. This significantly reduces your production bundle size by only including the CSS for components you actually use.

    ### Bug Fixes
    - Fixed a CSS dependency order issue where `IconButton` styles loaded before `Button` styles, causing incorrect style inheritance.

- 6f8de5b: correct padding-inline for sm size from 4px(050) to 8px(100)
- 4df6bcf: resolved interactions layer's color in dark mode
- 25c235e: adjust indicator size to account for border
- 716c1d6: restore reset css
- 9a3c4f6: fix(RadioGroup): Resolving orientation style errors
- d68304a: fix(text-input): add component layer
- Updated dependencies [8217749]
- Updated dependencies [402284e]
- Updated dependencies [fd4acaa]
- Updated dependencies [f2950ee]
    - @vapor-ui/icons@0.5.0

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
