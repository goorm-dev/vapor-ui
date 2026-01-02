# @vapor-ui/docs-extractor

Extract TypeScript documentation from Vapor UI components with external JSDoc merging.

## Features

- **Automatic Documentation Extraction**: Extract JSDoc comments and type information from TypeScript components
- **External Library Support**: Merge JSDoc from external dependencies like `@base-ui-components/react`
- **Type Tracking**: Follow type inheritance across packages and node_modules
- **Vanilla-extract Variants**: Extract variant information from `.css.ts` files (size, colorPalette, variant, etc.)
- **HTML Props Filtering**: Filter out HTML intrinsic element props by default for cleaner API documentation
- **JSON Output**: Generate structured JSON documentation for programmatic use
- **CLI Interface**: Simple command-line interface with interactive prompts

## Installation

```bash
# From monorepo root
pnpm install
pnpm --filter @vapor-ui/docs-extractor build
```

## Usage

### Basic Usage

Extract documentation for all components:

```bash
npx @vapor-ui/docs-extractor
```

### Extract Specific Component

```bash
npx @vapor-ui/docs-extractor --component Button --output ./button-docs.json
```

### Command Line Options

```
--output, -o <path>         Output file path (default: ./docs-output.json)
--component, -c <name>      Extract specific component (default: all)
--verbose, -v               Verbose logging
--cwd <path>                Working directory (default: process.cwd())
--include-html-props        Include HTML intrinsic element props (default: false)
--help, -h                  Show help
--version                   Show version
```

### Examples

```bash
# Extract all components with verbose logging
npx @vapor-ui/docs-extractor --verbose

# Extract Checkbox component
npx @vapor-ui/docs-extractor --component Checkbox

# Extract to custom location
npx @vapor-ui/docs-extractor --output ./api/components.json

# Include HTML intrinsic props (disabled by default)
npx @vapor-ui/docs-extractor --include-html-props

# Interactive mode (prompts for component selection)
npx @vapor-ui/docs-extractor
```

## Output Format

The tool generates JSON with the following structure:

```json
{
    "metadata": {
        "version": "1.0.0-beta.1",
        "generatedAt": "2025-12-19T01:15:52.754Z",
        "rootPath": "/path/to/project",
        "componentCount": 1
    },
    "components": [
        {
            "name": "Button",
            "exports": [
                {
                    "type": "component",
                    "name": "Button",
                    "displayName": "Button",
                    "props": [
                        {
                            "name": "disabled",
                            "type": "boolean | undefined",
                            "required": false,
                            "description": "Whether the component should ignore user interaction.",
                            "isExternal": true,
                            "isHTMLIntrinsic": false,
                            "source": "external"
                        }
                    ],
                    "variants": {
                        "sourceFile": "/path/to/button.css.ts",
                        "variants": [
                            {
                                "name": "size",
                                "values": ["sm", "md", "lg", "xl"],
                                "defaultValue": "md"
                            },
                            {
                                "name": "colorPalette",
                                "values": ["primary", "secondary", "success", "warning", "danger"],
                                "defaultValue": "primary"
                            },
                            {
                                "name": "variant",
                                "values": ["fill", "outline", "ghost"],
                                "defaultValue": "fill"
                            }
                        ]
                    }
                }
            ]
        }
    ]
}
```

## How It Works

### Architecture

The tool uses **ts-morph** (TypeScript Compiler API wrapper) to:

1. **Scan Components**: Find all component files in `packages/core/src/components`
2. **Analyze Types**: Load TypeScript files and resolve type information
3. **Track Symbols**: Follow prop definitions across files and packages
4. **Extract JSDoc**: Parse JSDoc comments from both local and external sources
5. **Merge Documentation**: Combine local and external docs (local takes precedence)
6. **Generate Output**: Format as JSON

### Key Features

#### External JSDoc Merging

When a component extends props from an external library:

```typescript
// Your component
export namespace CheckboxRoot {
    type RootPrimitiveProps = VComponentProps<typeof BaseCheckbox.Root>;
    export interface Props extends RootPrimitiveProps, CheckboxSharedProps {}
}
```

The tool:

- Resolves `BaseCheckbox.Root` from `@base-ui-components/react`
- Extracts JSDoc from the external `.d.ts` files
- Merges external docs with local docs (local wins on conflicts)
- Marks properties with `isExternal: true/false`

#### HTML Props Filtering

By default, the tool filters out HTML intrinsic element props (from @types/react) to provide cleaner API documentation:

- **Default behavior**: Only component-specific props are included
- **Filtered props**: Props from `HTMLAttributes`, `AriaAttributes`, and `DOMAttributes`
- **Override**: Use `--include-html-props` flag to include all HTML props

Example: Button component is reduced from 276 props to only 4 component-specific props.

#### Variants Extraction

Automatically extracts vanilla-extract variants from `.css.ts` files:

```typescript
// button.css.ts
export const root = recipe({
  variants: {
    size: { sm: {...}, md: {...}, lg: {...} },
    colorPalette: { primary: {...}, secondary: {...} },
    variant: { fill: {...}, outline: {...}, ghost: {...} }
  },
  defaultVariants: {
    size: 'md',
    colorPalette: 'primary',
    variant: 'fill'
  }
});
```

The tool will extract:

- Variant names (size, colorPalette, variant)
- Possible values for each variant
- Default values
- JSDoc descriptions (if available)

#### Type Resolution

Handles complex TypeScript patterns:

- Generic types: `VComponentProps<typeof BaseCheckbox.Root>`
- Namespace access: `BaseCheckbox.Root.Props`
- Multiple inheritance: `extends A, B, C`
- Type imports: `import { Checkbox } from '@base-ui-components/react'`

## Development

### Project Structure

```
packages/docs-extractor/
├── src/
│   ├── bin/
│   │   └── cli.ts              # CLI entry point
│   ├── core/
│   │   ├── project-analyzer.ts # ts-morph initialization
│   │   ├── component-scanner.ts# Component file discovery
│   │   ├── type-resolver.ts    # Type tracking & external detection
│   │   ├── doc-extractor.ts    # JSDoc parsing
│   │   └── merge-engine.ts     # Doc merging logic
│   ├── renderer/
│   │   └── json-renderer.ts    # JSON output formatting
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── utils/
│       └── logger.ts           # Logging utilities
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

### Building

```bash
cd packages/docs-extractor
pnpm build
```

### Testing

```bash
# Test specific component
node dist/bin/cli.mjs --component Button --verbose

# Test all components
node dist/bin/cli.mjs --verbose
```

## Technical Details

### Dependencies

- **ts-morph**: TypeScript AST analysis and manipulation
- **meow**: CLI framework
- **@inquirer/prompts**: Interactive prompts
- **globby**: File pattern matching
- **picocolors**: Terminal colors

### Symbol Resolution

The tool uses TypeScript's symbol resolution to:

1. Detect external types by checking if declaration file path includes `node_modules`
2. Follow type aliases using `getAliasedSymbol()`
3. Extract inherited properties using `getBaseTypes()` and `getProperties()`
4. Distinguish local vs external props by source file location

### Performance Optimizations

- **Lazy Loading**: Uses `skipAddingFilesFromTsConfig: true` to avoid loading all files
- **Selective Import**: Only loads component files matching the scan pattern
- **Type Caching**: TypeScript's type checker caches resolved types

## Limitations

- Only extracts from `packages/core/src/components` directory
- Requires components to follow the namespace pattern
- Does not extract from `.stories.tsx` or `.test.tsx` files
- Generic type parameters in output may be verbose

## Contributing

When making changes:

1. Update types in `src/types/index.ts`
2. Maintain backward compatibility in JSON output format
3. Test with both simple (Button) and complex (Checkbox) components
4. Update this README if adding new features

## License

MIT

## Related

- [GUIDE.md](./GUIDE.md) - Original implementation guide
- [Vapor UI Documentation](https://vapor-ui.goorm.io)
- [ts-morph Documentation](https://ts-morph.com)
