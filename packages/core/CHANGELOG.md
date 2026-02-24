# @vapor-ui/core

## 1.1.0

### General changes

- expand utility props and scoping it `$css` ([#476](https://github.com/goorm-dev/vapor-ui/pull/476)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Etc.

- Change `useMutationObserver` hook to use only ref ([#332](https://github.com/goorm-dev/vapor-ui/pull/332)) - Thanks [@SimYunSup](https://github.com/SimYunSup)!

### Skeleton

- Add new `Skeleton` component ([#481](https://github.com/goorm-dev/vapor-ui/pull/481)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

### Updated Dependencies

- @vapor-ui/icons@1.0.1

## 1.0.0

### Checkbox / Switch / Radio

- **Breaking Change**: Root element changed from `HTMLButtonElement` to `HTMLSpanElement` ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Dialog

- fix(dialog): correct ReactElement type parameters in DialogPopup props ([#438](https://github.com/goorm-dev/vapor-ui/pull/438)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

    Fixed incorrect type parameters for `portalElement` and `overlayElement` in `DialogPopup.Props` from `typeof Component` to `Component.Props`.

### Field

- **Breaking Change**: `validationMode` default changed from `onBlur` to `onSubmit` ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- **New Feature**: `Field.Item`: New component added for improved accessibility when using Checkbox, Radio, Switch with Field ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### FloatingBar

- feat(FloatingBar): export `EventDetails` type ([#437](https://github.com/goorm-dev/vapor-ui/pull/437)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

    Export `ChangeEventDetails` type from `FloatingBarRoot` namespace for docs-extractor compatibility.

### Form

- **Breaking Change**: `onClearErrors` prop removed (now auto-handled internally) ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Menu

- **Breaking Change**: `openOnHover`, `delay`, `closeDelay` props moved from `Menu.Root` to `Menu.Trigger` ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### NavigationMenu

- **Breaking Change**: `Link`: `selected` prop renamed to `current` (for Breadcrumb API consistency) ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- **Breaking Change**: `data-selected` attribute changed to `data-active` ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Popover

- **Breaking Change**: `openOnHover`, `delay`, `closeDelay` props moved from `Popover.Root` to `Popover.Trigger` ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Radio Card

- removed the size prop from the RadioCard component and simplified its styling by removing typography mixins ([#442](https://github.com/goorm-dev/vapor-ui/pull/442)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Tabs

- fix(tabs): correct indicator position when list has padding ([#434](https://github.com/goorm-dev/vapor-ui/pull/434)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

    Fix indicator positioning issue when Tabs.List has padding-inline (horizontal) or padding-block (vertical). The indicator now correctly positions itself by explicitly setting `left: 0` (horizontal) or `top: 0` (vertical), ensuring it uses only the CSS variables for positioning regardless of padding.

- **Breaking Change**: `Tabs.Root`: `loop` prop renamed to `loopFocus` ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- **Breaking Change**: `activateOnFocus` default changed from `true` to `false` ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- **Breaking Change**: `data-selected` attribute changed to `data-active` ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Tooltip

- **Breaking Change**: `Tooltip.Root`: `hoverable` prop renamed to `disableHoverablePopup` (logic inverted) ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- **Breaking Change**: `delay`, `closeDelay` props moved from `Tooltip.Root` to `Tooltip.Trigger` ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Etc.

- Migrate to Base UI v1.1.0 ([#453](https://github.com/goorm-dev/vapor-ui/pull/453)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- Updated internal utilities to use official @base-ui/utils package (v0.2.4) ([#443](https://github.com/goorm-dev/vapor-ui/pull/443)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- fix: prevent passing props to Fragment in `createRender` ([#403](https://github.com/goorm-dev/vapor-ui/pull/403)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

    Fixed React warning `Invalid prop 'ref' supplied to 'React.Fragment'` by wrapping Fragment returns in a render callback to avoid `cloneElement` props merging.

### Updated Dependencies

- @vapor-ui/icons@1.0.0

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

### Etc.

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

### Etc.

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

### Etc.

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

### Callout

- add flex layout for icons and text alignment ([#181](https://github.com/goorm-dev/vapor-ui/pull/181)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

### Collapsible

- add new `Collapsible` component ([#197](https://github.com/goorm-dev/vapor-ui/pull/197)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Field

- add new `Field` components ([#224](https://github.com/goorm-dev/vapor-ui/pull/224)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

### Input Group

- add new `InputGroup` component ([#230](https://github.com/goorm-dev/vapor-ui/pull/230)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

### Multi Select

- add new `MultiSelect` component ([#225](https://github.com/goorm-dev/vapor-ui/pull/225)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Navigation Menu

- Migrate `Nav` to `NavigationMenu` ([#211](https://github.com/goorm-dev/vapor-ui/pull/211)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Popover

- add new `Popover` component ([#156](https://github.com/goorm-dev/vapor-ui/pull/156)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Select

- add new `Select` component ([#222](https://github.com/goorm-dev/vapor-ui/pull/222)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Sheet

- add new `Sheet` component ([#187](https://github.com/goorm-dev/vapor-ui/pull/187)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- edit spacing style implementation ([#238](https://github.com/goorm-dev/vapor-ui/pull/238)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Tabs

- add new `Tabs` component ([#157](https://github.com/goorm-dev/vapor-ui/pull/157)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Textarea

- Add new `Textarea` component ([#209](https://github.com/goorm-dev/vapor-ui/pull/209)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

### Tooltip

- eidt tooltip offset ([#212](https://github.com/goorm-dev/vapor-ui/pull/212)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Etc.

- change the overlay component interface ([#195](https://github.com/goorm-dev/vapor-ui/pull/195)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- remove `Label` sub-component from all form elements ([#204](https://github.com/goorm-dev/vapor-ui/pull/204)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- migrate to `Base UI` ([#186](https://github.com/goorm-dev/vapor-ui/pull/186)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- support readonly props in all of form elements ([#208](https://github.com/goorm-dev/vapor-ui/pull/208)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

- fix svg rendering issue on safari ([#237](https://github.com/goorm-dev/vapor-ui/pull/237)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- remove active style when provided readonly ([#246](https://github.com/goorm-dev/vapor-ui/pull/246)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- ensure focus styles take precedence over hover styles ([#200](https://github.com/goorm-dev/vapor-ui/pull/200)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Updated Dependencies

- @vapor-ui/icons@0.4.0

## 0.5.0

### Avatar

- align CSS variable with build identifiers config ([#176](https://github.com/goorm-dev/vapor-ui/pull/176)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

### Breadcrumb

- add new `Breadcrumb` component ([#151](https://github.com/goorm-dev/vapor-ui/pull/151)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Button

- add `no-wrap` CSS properties ([#114](https://github.com/goorm-dev/vapor-ui/pull/114)) - Thanks [@jun094](https://github.com/jun094)!

### Menu

- add new `Menu` component ([#147](https://github.com/goorm-dev/vapor-ui/pull/147)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Radio Group

- add background-color(white) to RadioGroup Indicator ([#146](https://github.com/goorm-dev/vapor-ui/pull/146)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

### Tooltip

- add new `Tooltip` component ([#150](https://github.com/goorm-dev/vapor-ui/pull/150)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Etc.

- enhance vanillaExtractPlugin identifiers ([#161](https://github.com/goorm-dev/vapor-ui/pull/161)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- remove hover state when used touchscreen ([#158](https://github.com/goorm-dev/vapor-ui/pull/158)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- add `VComponentProps` ([#168](https://github.com/goorm-dev/vapor-ui/pull/168)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- add `box-shadow` tokens ([#143](https://github.com/goorm-dev/vapor-ui/pull/143)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- enhance vanillaExtractPlugin identifiers for better debugging ([#149](https://github.com/goorm-dev/vapor-ui/pull/149)) - Thanks [@MaxLee-dev](https://github.com/MaxLee-dev)!

### Updated Dependencies

- @vapor-ui/icons@1.0.0

## 0.4.0

### Badge

- align text to center ([#137](https://github.com/goorm-dev/vapor-ui/pull/137)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Radio Group

- remove incorrectly injected props ([#125](https://github.com/goorm-dev/vapor-ui/pull/125)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Etc.

- change CSS layer names to `theme`, `reset`, `components`, and `utilities` ([#138](https://github.com/goorm-dev/vapor-ui/pull/138)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- add Tailwind CSS v4 preset ([#98](https://github.com/goorm-dev/vapor-ui/pull/98)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- improve DX by overhauling CSS bundling strategy ([#121](https://github.com/goorm-dev/vapor-ui/pull/121)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- add foreground mixin to style entry point ([#142](https://github.com/goorm-dev/vapor-ui/pull/142)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

### Updated Dependencies

- @vapor-ui/icons@0.2.0

## 0.3.1

### Theme Provider

- add `primaryColor` props for user custom ([#87](https://github.com/goorm-dev/vapor-ui/pull/87)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

## 0.3.0

### Etc.

- remove sprinkles on each components ([#88](https://github.com/goorm-dev/vapor-ui/pull/88)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- correct CSS layer priority ([#94](https://github.com/goorm-dev/vapor-ui/pull/94)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

## 0.2.1

### Theme Provider

- support RSC ([#82](https://github.com/goorm-dev/vapor-ui/pull/82)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

## 0.2.0

### Callout

- add new `Callout` component ([#67](https://github.com/goorm-dev/vapor-ui/pull/67)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Checkbox

- add new `Checkbox` Component ([#58](https://github.com/goorm-dev/vapor-ui/pull/58)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Dialog

- edit dialog animation style ([#72](https://github.com/goorm-dev/vapor-ui/pull/72)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Radio Group

- add new `RadioGroup` component ([#76](https://github.com/goorm-dev/vapor-ui/pull/76)) - Thanks [@noahchoii](https://github.com/noahchoii)!

### Switch

- add new `Switch` component - Thanks [@noahchoii](https://github.com/noahchoii)!

### Etc.

- remove `@vapor-ui/icons` for resolving storybook build error ([#57](https://github.com/goorm-dev/vapor-ui/pull/57)) - Thanks [@noahchoii](https://github.com/noahchoii)!

- prevent code splitting while tsup build ([#81](https://github.com/goorm-dev/vapor-ui/pull/81)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- resolve circular dependency in vanilla-extract ([#73](https://github.com/goorm-dev/vapor-ui/pull/73)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

- optimize build system for component bundling ([#73](https://github.com/goorm-dev/vapor-ui/pull/73)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!

## 0.1.0

### Etc.

- create package ([#48](https://github.com/goorm-dev/vapor-ui/pull/48)) - Thanks [@ZeroChoi2781](https://github.com/ZeroChoi2781)!
