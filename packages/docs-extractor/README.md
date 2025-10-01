# @vapor-ui/docs-extractor

Extract component documentation and type information from TypeScript files for generating comprehensive API documentation.

## Overview

The docs-extractor is a TypeScript analysis tool that extracts component metadata, props information, and type definitions from React component files. It provides detailed documentation data that can be used for generating API docs, component libraries, or development tooling.

## Features

- **Component Analysis**: Extracts React component props, types, and metadata
- **Type Extraction**: Comprehensive TypeScript type analysis and documentation
- **External Package Support**: Handles external type definitions from packages like Base UI
- **Vanilla Extract Support**: Special handling for vanilla-extract style definitions
- **CLI Tool**: Command-line interface for batch processing files
- **Configurable**: Flexible configuration options via TypeScript config files

## Installation

```bash
npm install @vapor-ui/docs-extractor
```

## Usage

### CLI

```bash
# Extract documentation from TypeScript files
docs-extractor -c tsconfig.json -o ./docs-output -f "src/**/*.{ts,tsx}"

# With external type paths
docs-extractor -c tsconfig.json -o ./docs-output -x "@base-ui-components/react:esm/index.d.ts"
```

#### CLI Options

- `-c, --configPath <path>`: Path to tsconfig.json file (required)
- `-o, --out <directory>`: Output directory for generated documentation (required)
- `-f, --files <patterns>`: File patterns to analyze (optional, defaults to all TS/TSX files)
- `-x, --externalTypePaths <paths>`: External type definition files (format: package:subpath)

### Programmatic API

```typescript
import {
    createComponentData,
    createTypeScriptProgram,
    processComponentExportedSymbols,
} from '@vapor-ui/docs-extractor';

// Create TypeScript program
const program = createTypeScriptProgram({
    configPath: './tsconfig.json',
    files: ['src/components/Button.tsx'],
    projectRoot: process.cwd(),
});

// Extract component information
const checker = program.getTypeChecker();
const components = processComponentExportedSymbols({
    program,
    checker,
    moduleSymbol,
    sourceFile,
});
```

## Architecture

The extractor is built with a modular architecture:

### Parsers

- `component-parser.ts`: React component analysis
- `props-parser.ts`: Component props extraction
- `export-parser.ts`: Module export analysis
- `module-parser.ts`: TypeScript module processing
- `program-parser.ts`: TypeScript program creation
- `vanilla-extract-parser.ts`: Vanilla Extract style handling

### Handlers

- `component-handler.ts`: Main component processing logic
- `external-packages-handler.ts`: External package type resolution
- `vanilla-extract-handler.ts`: Vanilla Extract specific processing

### Types

- `types.ts`: Core TypeScript interfaces and type definitions

## Configuration

The tool uses your existing TypeScript configuration (`tsconfig.json`) and supports additional options:

```json
{
    "compilerOptions": {
        "declaration": true,
        "declarationMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["**/*.test.*", "**/*.stories.*"]
}
```

## Output Format

The extractor generates structured component data including:

```typescript
interface ComponentTypeInfo {
    name: string;
    displayName?: string;
    description?: string;
    props: PropInfo[];
    defaultElement?: string;
}

interface PropInfo {
    name: string;
    type: string | string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}
```

## Requirements

- Node.js e 20.0.0
- TypeScript e 5.0.0

## License

Part of the Vapor UI design system.
