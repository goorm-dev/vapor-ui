---
name: vapor-ui
description: Vapor UI design system component guide and UI mockup generator with MCP integration. Provides component catalog, usage patterns, props documentation, and generates production-ready UI prototypes. Use when user asks "vapor-ui components", "vapor-ui component usage", "vapor-ui 사용법", "vapor-ui를 사용해서 시안 구현", "create page design", or mentions specific components like "Button", "Input", "Modal".
metadata:
    author: goorm
    version: 1.0.0
    mcp-server: vapor-ui
---

# Vapor UI Design Skill

## Instructions

### Step 1: Identify User Intent & Detect Version

**Run these checks in parallel:**

1. **Determine user intent**:
    - **Component lookup**: User wants to know available components or specific component details
    - **Usage guidance**: User needs props, variants, or example code
    - **Mockup generation**: User wants to create a UI prototype

2. **Detect Vapor UI version in codebase**:
    ```bash
    node scripts/detect-version.mjs [path-to-package.json]
    ```
    Expected output:
    ```
    CORE: 1.0.0-beta.12
    ICONS: 1.0.0-beta.12
    ```
    - `CORE`: @vapor-ui/core version (use this for all subsequent scripts)
    - `ICONS`: @vapor-ui/icons version (if installed)

### Step 2: Component Information

**Get component list:**
```bash
node scripts/get-component-list.mjs <VERSION>
```
Example: `node scripts/get-component-list.mjs 1.0.0-beta.12`

**Get component details (props, description):**
```bash
node scripts/get-component-info.mjs <VERSION> <COMPONENT> [PART]
```
Example: `node scripts/get-component-info.mjs 1.0.0-beta.12 avatar`

For detailed component structure, refer to `references/component-structure.md`.

### Step 3: Component Examples

**Get example code:**
```bash
node scripts/get-component-examples.mjs <VERSION> <COMPONENT> [EXAMPLE_NAME]
```
Example: `node scripts/get-component-examples.mjs 1.0.0-beta.12 avatar default`

### Step 4: Mockup Generation

For mockup requests:

1. Run `get-component-list.mjs` to identify available components
2. Run `get-component-info.mjs` for each needed component's props
3. Run `get-component-examples.mjs` for usage patterns
4. Generate code using Vapor UI components only
5. Provide complete, copy-paste ready code

---

## Examples

**Example 1: Component Usage Query**

**User**: "How do I use the Button component?"

**Action**:
1. Run `node scripts/get-component-info.mjs 1.0.0-beta.12 button`
2. Run `node scripts/get-component-examples.mjs 1.0.0-beta.12 button`
3. Provide props, variants, and example code

**Result**: Complete Button usage guide with code examples

---

**Example 2: Mockup Generation**

**User**: "Create a login page mockup"

**Action**:
1. Run `get-component-list.mjs` to check available components
2. Run `get-component-info.mjs` for text-input, button, card, form
3. Run `get-component-examples.mjs` for form patterns
4. Generate responsive layout using Vapor UI

**Result**: Production-ready login page code

---

**Example 3: Component Discovery**

**User**: "What form components are available?"

**Action**:
1. Run `node scripts/get-component-list.mjs 1.0.0-beta.12`
2. Filter output for form-related components (text-input, textarea, checkbox, radio, select, etc.)

**Result**: Categorized list of form-related components

---

## Troubleshooting

**Error**: Component not found

**Cause**: Component name may be different or version mismatch

**Solution**:
1. Run `get-component-list.mjs` to see all available components
2. Verify version matches user's codebase

---

**Error**: Script fails with fetch error

**Cause**: Invalid version or network issue

**Solution**:
1. Re-run `detect-version.mjs` to get correct version
2. Check network connectivity
3. Verify version exists in repository

---

## References

- `references/url-patterns.md`: GitHub URL patterns for fetching component data
- `references/component-structure.md`: Component file structure and JSON schema
- `examples/`: Ready-to-use mockup templates

## Scripts

| Script | Purpose |
|--------|---------|
| `detect-version.mjs` | Detect @vapor-ui/core and @vapor-ui/icons versions from package.json |
| `get-component-list.mjs` | List all available components |
| `get-component-info.mjs` | Get component props and documentation |
| `get-component-examples.mjs` | Get component example code |
