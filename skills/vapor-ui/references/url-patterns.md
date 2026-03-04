# Vapor UI URL Patterns

All URLs use the `{VERSION}` placeholder which should be replaced with the actual version from `detect-version.mjs`.

## Base URLs

| Type | URL |
|------|-----|
| Raw Content | `https://raw.githubusercontent.com/goorm-dev/vapor-ui/@vapor-ui/core@{VERSION}` |
| GitHub API | `https://api.github.com/repos/goorm-dev/vapor-ui/contents` |

## Component Information

### Component List (index.ts)

```
https://raw.githubusercontent.com/goorm-dev/vapor-ui/@vapor-ui/core@{VERSION}/packages/core/src/index.ts
```

### Component Folder Structure

```
https://api.github.com/repos/goorm-dev/vapor-ui/contents/packages/core/src/components/{COMPONENT}?ref=@vapor-ui/core@{VERSION}
```

### Component Parts (index.parts.ts)

```
https://raw.githubusercontent.com/goorm-dev/vapor-ui/@vapor-ui/core@{VERSION}/packages/core/src/components/{COMPONENT}/index.parts.ts
```

### Component JSON Documentation

```
https://raw.githubusercontent.com/goorm-dev/vapor-ui/@vapor-ui/core@{VERSION}/apps/website/public/components/generated/{PART_NAME}.json
```

**Note:** `{PART_NAME}` is the kebab-case version of the export name (e.g., `AvatarRoot` → `avatar-root`).

## Examples

### Example File List

```
https://api.github.com/repos/goorm-dev/vapor-ui/contents/apps/website/src/components/demo/examples/{COMPONENT}?ref=@vapor-ui/core@{VERSION}
```

### Example File Content

```
https://raw.githubusercontent.com/goorm-dev/vapor-ui/@vapor-ui/core@{VERSION}/apps/website/src/components/demo/examples/{COMPONENT}/{FILENAME}
```

## Version Detection

Run `detect-version.mjs` to get the current version from `package.json`:

```bash
node scripts/detect-version.mjs ./package.json
```

Output:
```
CORE: 1.0.0-beta.12
ICONS: 1.0.0-beta.12
```

Use the `CORE` version value to replace `{VERSION}` in all URLs above.
