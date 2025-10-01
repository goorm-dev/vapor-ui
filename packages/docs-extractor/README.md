# @vapor-ui/docs-extractor

A TypeScript-based tool for extracting component API documentation from React components. This package analyzes TypeScript files to generate comprehensive documentation including props, types, default values, and component metadata.

## Features

- **Modular Parser System**: Building-block architecture with selectively enabled parser modules
- **Step-by-Step Configuration**: Configurable CLI with presets and custom setups
- **TypeScript Analysis**: Extracts props, types, and JSDoc comments from TypeScript React components
- **Vanilla Extract Support**: Reads default values from Vanilla Extract CSS-in-JS recipe files
- **External Type Resolution**: Includes types from external packages like Base UI
- **Flexible Input**: Supports glob patterns for file selection
- **JSON Output**: Generates structured JSON documentation files
- **Dual API**: Legacy functions + new modular parser orchestrator

## Installation

```bash
npm install @vapor-ui/docs-extractor
```

## CLI Usage

### Modular CLI (Recommended)

The new modular CLI supports presets and step-by-step configuration:

```bash
# Using design-system preset
docs-extractor-modular -c tsconfig.json -o ./docs --preset design-system -f "src/**/*.{ts,tsx}"

# Using react preset
docs-extractor-modular -c tsconfig.json -o ./docs --preset react -f "src/**/*.{ts,tsx}"

# Using minimal preset
docs-extractor-modular -c tsconfig.json -o ./docs --preset minimal -f "src/**/*.{ts,tsx}"
```

#### Preset Options

- **`design-system`**: All parsers enabled (components, props, external types, Vanilla Extract)
- **`react`**: Component and props parsing only
- **`minimal`**: Component parsing only

### Legacy CLI

The original CLI is still available for backward compatibility:

```bash
docs-extractor -c tsconfig.json -o ./docs -f "src/**/*.{ts,tsx}"
```

#### Command Options

- `-c, --configPath`: Path to tsconfig.json file (required)
- `-o, --out`: Output directory for generated documentation (required)
- `-f, --files`: File patterns to analyze (supports globs)
- `-x, --externalTypePaths`: External type definition files to include

### Examples

```bash
# Modern approach with design-system preset
docs-extractor-modular -c ./tsconfig.json -o ./api-docs --preset design-system -f "src/components/**/*.{ts,tsx}"

# Legacy approach with external types
docs-extractor -c ./tsconfig.json -o ./docs -f "src/**/*.{ts,tsx}" -x "@base-ui-components/react:esm/index.d.ts"

# Multiple patterns (both CLIs support this)
docs-extractor -c ./tsconfig.json -o ./docs -f "src/components/**/*.{ts,tsx}" -f "src/widgets/**/*.{ts,tsx}"
```

## Programmatic API

### Basic Usage

```typescript
import { extractComponentTypesFromFile } from '@vapor-ui/docs-extractor';

const components = extractComponentTypesFromFile('./tsconfig.json', './src/components/Button.tsx');

console.log(components);
```

### Advanced Usage

```typescript
import {
    createTypeScriptProgram,
    extractComponentTypes,
    extractDisplayName,
    extractProps,
} from '@vapor-ui/docs-extractor';

// Create TypeScript program
const { program, checker } = createTypeScriptProgram({
    configPath: './tsconfig.json',
    externalTypePaths: ['@base-ui-components/react:esm/index.d.ts'],
});

// Extract components from multiple files
const allComponents = [];
for (const filePath of filePaths) {
    const components = extractComponentTypes(program, checker, filePath);
    allComponents.push(...components);
}
```

## Architecture

The package is organized into modular functions that can be used independently:

### Core Functions

- **`extractComponentTypesFromFile`**: Main entry point for extracting component types
- **`createTypeScriptProgram`**: Creates TypeScript program with external types
- **`extractComponentTypes`**: Extracts components from a specific file

### Specialized Analyzers

- **`extractDisplayName`**: Gets component display names
- **`extractDefaultElement`**: Finds default rendering elements
- **`extractProps`**: Analyzes component props and types
- **`extractPropsType`**: Extracts props type from component type
- **`findCssFile`**: Locates associated Vanilla Extract files
- **`extractDefaultValue`**: Gets default values from CSS recipes

### Utilities

- **`createComponentData`**: Converts component info to output format
- **`writeComponentDataToFile`**: Writes JSON documentation files
- **`resolveExternalTypeFiles`**: Resolves external package types

## Output Format

The tool generates JSON files with the following structure:

```json
{
    "name": "Button",
    "displayName": "Button",
    "description": "A customizable button component",
    "props": [
        {
            "name": "variant",
            "type": ["primary", "secondary", "danger"],
            "required": false,
            "description": "Visual style variant",
            "defaultValue": "primary"
        },
        {
            "name": "children",
            "type": "React.ReactNode",
            "required": true,
            "description": "Button content"
        }
    ],
    "defaultElement": "button",
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "sourceFile": "/path/to/Button.tsx"
}
```

## Supported Features

### Component Analysis

- React functional components
- ForwardRef components
- Memo wrapped components
- Component display names
- Default rendering elements

### Props Analysis

- TypeScript interface props
- Union types (converted to arrays)
- Optional vs required props
- JSDoc descriptions
- JSDoc @default tags

### Vanilla Extract Integration

- Automatic CSS file detection
- Recipe defaultVariants extraction
- Default value inheritance

### External Types

- Base UI components
- Custom external packages
- Multiple package managers (npm, pnpm, yarn)

## Configuration

### TypeScript Configuration

Ensure your `tsconfig.json` includes the files you want to analyze:

```json
{
    "compilerOptions": {
        "strict": true,
        "jsx": "react-jsx"
    },
    "include": ["src/**/*"],
    "exclude": ["**/*.test.*", "**/*.stories.*"]
}
```

### External Types

Configure external type paths for packages:

```bash
# Base UI components
-x "@base-ui-components/react:esm/index.d.ts"

# Custom package
-x "my-ui-library:dist/types/index.d.ts"
```

## Workflow

See [CLI_WORKFLOW.md](./CLI_WORKFLOW.md) for a detailed mermaid diagram of how the extraction process works.

## File Structure

```
src/
├── bin/
│   └── cli.ts                    # CLI entry point
├── component-analyzer.ts         # Component analysis functions
├── external-resolver.ts          # External type resolution
├── props-analyzer.ts            # Props extraction functions
├── type-extractor.ts            # Main extraction logic
├── vanilla-extract-analyzer.ts  # CSS-in-JS analysis
├── utils.ts                     # Utility functions
├── types/
│   └── types.ts                 # Type definitions
└── index.ts                     # Public API exports
```

## Examples

### Extracting Button Component

Input TypeScript file:

```typescript
interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, ...props }, ref) => {
    return <button ref={ref} {...props}>{children}</button>;
  }
);

Button.displayName = 'Button';
```

Generated documentation:

```json
{
    "name": "Button",
    "displayName": "Button",
    "props": [
        {
            "name": "variant",
            "type": ["primary", "secondary", "danger"],
            "required": false,
            "description": "Visual style variant"
        },
        {
            "name": "children",
            "type": "React.ReactNode",
            "required": true,
            "description": "Button content"
        }
    ],
    "defaultElement": "button"
}
```

## Contributing

1. Follow the existing function-based architecture
2. Add comprehensive JSDoc comments
3. Include test cases for new features
4. Update this README for any API changes

## License

MIT
