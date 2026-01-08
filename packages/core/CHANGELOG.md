# @vapor-ui/core

## 1.0.0-beta.12

### Button

- Update secondary button fill variant text color to use foreground.secondary[200] for improved contrast ([#427](https://github.com/goorm-dev/vapor-ui/pull/427)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

### Dialog

- adjust to max-width in dialog ([#394](https://github.com/goorm-dev/vapor-ui/pull/394)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Field

- feat(field): add typography and foreground props to Field.Label ([#399](https://github.com/goorm-dev/vapor-ui/pull/399)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

### Floatingbar

- add new `FloatingBar` component ([#359](https://github.com/goorm-dev/vapor-ui/pull/359)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- clone elements & enhance customizability ([#359](https://github.com/goorm-dev/vapor-ui/pull/359)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Tabs

- Refactor Tabs component structure for better customization ([#429](https://github.com/goorm-dev/vapor-ui/pull/429)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!
    - Changed `Tabs.Trigger` to `Tabs.Button` for clearer semantics
    - Extracted `Tabs.ListPrimitive` and `Tabs.IndicatorPrimitive` for enhanced customization
    - Added fill and line variant support with updated styles
    - Updated type definitions and utility props for better developer experience

### Updated Dependencies

- @vapor-ui/icons@1.0.0-beta.7

## 1.0.0-beta.11

### Text Input

- Correct background-color of TextInput component ([#387](https://github.com/goorm-dev/vapor-ui/pull/387)) - Thanks [@agetbase](https://github.com/agetbase)!

### Etc

- clone elements & enhance customizability ([#359](https://github.com/goorm-dev/vapor-ui/pull/359)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Updated Dependencies

- @vapor-ui/hooks@1.0.0-beta.6
- @vapor-ui/icons@1.0.0-beta.6

## 1.0.0-beta.10

### Toast

- avoid overflowing when toast width is wider than view port width ([#390](https://github.com/goorm-dev/vapor-ui/pull/390)) - Thanks [@noahchoii](https://github.com/noahchoii)!

## 1.0.0-beta.9

### Toast

- remove toastManager ([#383](https://github.com/goorm-dev/vapor-ui/pull/383)) - Thanks [@noahchoii](https://github.com/noahchoii)!

## 1.0.0-beta.8

### Toast

- add new `Toast` component ([#376](https://github.com/goorm-dev/vapor-ui/pull/376)) - Thanks [@noahchoii](https://github.com/noahchoii)!

## 1.0.0-beta.7

### Menu

- Updated Menu.Item paddingRight from 6px to 12px to match Figma design specification ([#325](https://github.com/goorm-dev/vapor-ui/pull/325)) - Thanks [@agetbase](https://github.com/agetbase)!

- Correct MenuPositionerPrimitive sideOffset from 8px to 4px to match Figma spec ([#342](https://github.com/goorm-dev/vapor-ui/pull/342)) - Thanks [@agetbase](https://github.com/agetbase)!

### Pagination

- add new `Pagination` component ([#329](https://github.com/goorm-dev/vapor-ui/pull/329)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Table

- add new `Table` component ([#294](https://github.com/goorm-dev/vapor-ui/pull/294)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Etc

- synchronized color tokens with figma ([#340](https://github.com/goorm-dev/vapor-ui/pull/340)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- **BREAKING CHANGE**: Remove `stretch` prop from Button, IconButton, and NavigationMenu components ([#368](https://github.com/goorm-dev/vapor-ui/pull/368)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

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

## 1.0.0-beta.6

It contains the same code as the previous version. Please refer to that version.

## 1.0.0-beta.5

### Button

- update horizontal padding for small size (`050 (4px)` -> `100 (8px)`) ([#323](https://github.com/goorm-dev/vapor-ui/pull/323)) - Thanks [@agetbase](https://github.com/agetbase)!

### Checkbox

- fix checkbox borderRadius sync error ([#267](https://github.com/goorm-dev/vapor-ui/pull/267)) - Thanks [@SimYunSup](https://github.com/SimYunSup)!

### Field

- add default layout styles to field.label ([#289](https://github.com/goorm-dev/vapor-ui/pull/289)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Form

- add new `Form` component ([#256](https://github.com/goorm-dev/vapor-ui/pull/256)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Icon Button

- Fixed a CSS dependency order issue where `IconButton` styles loaded before `Button` styles, causing incorrect style inheritance.

### Radio

- adjust indicator size to account for border ([#291](https://github.com/goorm-dev/vapor-ui/pull/291)) - Thanks [@SimYunSup](https://github.com/SimYunSup)!

### Radio Card

- add new component `RadioCard` ([#284](https://github.com/goorm-dev/vapor-ui/pull/284)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Radio Group

- synchronize the aria-labelledby with the recieved id prop ([#327](https://github.com/goorm-dev/vapor-ui/pull/327)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- replace layout styles into layout component like VStack, HStack ([#288](https://github.com/goorm-dev/vapor-ui/pull/288)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Text Input

- add component layer ([#253](https://github.com/goorm-dev/vapor-ui/pull/253)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Theme

- add ThemeScope component and migrate to data-attribute based theming ([#278](https://github.com/goorm-dev/vapor-ui/pull/278)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Theme Provider

- remove ThemeScript and simplify ThemeProvider ([#240](https://github.com/goorm-dev/vapor-ui/pull/240)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Etc

- enabled CSS tree shaking ([#298](https://github.com/goorm-dev/vapor-ui/pull/298)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!
    - Component CSS is now automatically imported by each component file.

- add white foreground variant to foreground recipe ([#305](https://github.com/goorm-dev/vapor-ui/pull/305)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

- export component with namespace ([#276](https://github.com/goorm-dev/vapor-ui/pull/276)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- migrate to base-ui beta v4 ([#292](https://github.com/goorm-dev/vapor-ui/pull/292)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- change components interface ([#360](https://github.com/goorm-dev/vapor-ui/pull/360)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- missing component exports in entry file ([#248](https://github.com/goorm-dev/vapor-ui/pull/248)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- add uilitiy css props ([#326](https://github.com/goorm-dev/vapor-ui/pull/326)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- rename `CombinedContent` to `Content` ([#247](https://github.com/goorm-dev/vapor-ui/pull/247)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- unify cascade layers under `vapor` namespace ([#334](https://github.com/goorm-dev/vapor-ui/pull/334)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- standardize state attributes for form components ([#282](https://github.com/goorm-dev/vapor-ui/pull/282)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- feat: rename color tokens ([#261](https://github.com/goorm-dev/vapor-ui/pull/261)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- prevent loading font while building CSS ([#265](https://github.com/goorm-dev/vapor-ui/pull/265)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- correct background color of interaction layer in dark mode ([#335](https://github.com/goorm-dev/vapor-ui/pull/335)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Updated Dependencies

- @vapor-ui/icons@1.0.0-beta.5

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
