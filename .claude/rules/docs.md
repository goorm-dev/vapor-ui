---
description: Storybook and Vapor docs content rules for packages/core
paths:
    - 'packages/core/src/**/*.stories.tsx'
---

# Documentation Rules (`packages/core`)

## Storybook

- **`Docs`**: generated automatically via Storybook `autodocs` — no manual setup needed.
- **`Test Bed`**: used as the visual regression baseline for Playwright tests. Keep it stable and representative.

Stories live colocated with the component:

```text
src/components/button/
  button.tsx
  button.stories.tsx   ← colocated
```
