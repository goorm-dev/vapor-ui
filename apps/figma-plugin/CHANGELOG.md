# figma-plugin

## 1.0.0

### Minor Changes

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

- Updated dependencies [40bfa0a]
- Updated dependencies [1aecc3d]
- Updated dependencies [1fd7efc]
- Updated dependencies [dbb74cf]
- Updated dependencies [174d004]
- Updated dependencies [d4be5bb]
- Updated dependencies [ed63947]
- Updated dependencies [9f9b700]
    - @vapor-ui/core@1.0.0
    - @vapor-ui/color-generator@1.0.0
    - @vapor-ui/css-generator@1.0.0

## 1.0.0-beta.6

### Patch Changes

- bd523c7: feat: update color generator & color palette
- Updated dependencies [bd523c7]
    - @vapor-ui/color-generator@1.0.0
    - @vapor-ui/css-generator@1.0.0
    - @vapor-ui/core@1.0.0

## 1.0.0-beta.5

### Patch Changes

- 707f705: feat: update color tokens
- Updated dependencies [27c0ba9]
- Updated dependencies [f8af6e2]
- Updated dependencies [c9e4b68]
- Updated dependencies [abeac6d]
- Updated dependencies [220cda2]
- Updated dependencies [3819233]
- Updated dependencies [caf13a1]
- Updated dependencies [216866e]
- Updated dependencies [ee61a32]
- Updated dependencies [df5cb78]
- Updated dependencies [707f705]
- Updated dependencies [f0f643b]
- Updated dependencies [43cfefb]
- Updated dependencies [74dc538]
- Updated dependencies [6f8de5b]
- Updated dependencies [4df6bcf]
- Updated dependencies [25c235e]
- Updated dependencies [716c1d6]
- Updated dependencies [6c02d6f]
- Updated dependencies [f17650a]
- Updated dependencies [8217749]
- Updated dependencies [402284e]
- Updated dependencies [fd4acaa]
- Updated dependencies [f2950ee]
- Updated dependencies [b581b9f]
- Updated dependencies [7928a67]
- Updated dependencies [e12f4c4]
- Updated dependencies [5357a54]
- Updated dependencies [9a3c4f6]
- Updated dependencies [98170c1]
- Updated dependencies [d68304a]
    - @vapor-ui/core@0.7.0
    - @vapor-ui/color-generator@0.1.0
    - @vapor-ui/css-generator@0.1.0
    - @vapor-ui/icons@0.5.0
