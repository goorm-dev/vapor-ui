---
'@vapor-ui/core': patch
---

remove `useAutoResize` and type-only exports that leaked through `export *`

- `TextInputProps` → `TextInput.Props`
- `TextareaFieldProps`, `TextareaState` → `Textarea.Props`, `Textarea.State`
- `ThemeProviderProps`, `ThemeConfig` → `ComponentProps<typeof ThemeProvider>`
- `ThemeScopeProps` → `ComponentProps<typeof ThemeScope>`
- `UseThemeProps`, `UseThemeReturn` → `ReturnType<typeof useTheme>`
- `useAutoResize`, `AutoResizeOptions` have no replacement (internal to `Textarea`)
