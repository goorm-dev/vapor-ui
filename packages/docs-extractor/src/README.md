# Type Extractor Architecture

This directory contains the refactored, modular architecture for the TypeScript Compiler API-based component type extraction system. The original monolithic `type-extractor.ts` has been split into specialized modules for better maintainability and separation of concerns.

## Architecture Overview

### Core Types (`types.ts`)
Central type definitions used across all modules:
- `ComponentTypeInfo` - Main component metadata structure
- `PropInfo` - Property information with types, descriptions, defaults
- `BaseUIComponent` - Base UI component reference structure 
- `TypeExtractorConfig` - Configuration for the main extractor

### Utilities (`utils.ts`)
Common utility functions for TypeScript analysis:
- `shouldExcludeProp()` - Filters out HTML/React built-in attributes
- `isReactComponent()` - Identifies React components from TypeScript types
- `getJSDocDescription()` - Extracts JSDoc documentation
- `getJSDocDefaultValue()` - Gets default values from JSDoc @default tags
- `getLiteralValue()` - Parses literal values from AST nodes

### Vanilla Extract Analyzer (`vanilla-extract-analyzer.ts`)
Specialized module for CSS-in-JS analysis:
- `VanillaExtractAnalyzer` class
- `findCssFile()` - Locates associated CSS files (`.css.ts`, `.styles.ts`)
- `extractDefaultValue()` - Gets prop defaults from CSS `defaultVariants`
- `findDefaultVariants()` - Parses `recipe({ defaultVariants: {...} })` patterns
- `parseObjectLiteral()` - Converts AST object literals to JS objects

### Base UI Analyzer (`base-ui-analyzer.ts`)
Handles Base UI component integration and JSDoc extraction:
- `BaseUIAnalyzer` class
- `findUsedBaseUIComponents()` - Discovers Base UI imports in source files
- `isComponentUsedInJSX()` - Checks actual JSX usage patterns
- `getBaseUIPropertyDescription()` - Extracts prop descriptions from node_modules
- `getAllBaseUITypeFiles()` - Gets all related type definition files
- `extractBaseUIJSDoc()` - Parses JSDoc from `.d.ts` files
- `findRelevantBaseUITypeFiles()` - Discovers Base UI files for TypeScript program

### Component Analyzer (`component-analyzer.ts`)
Analyzes React component structure and metadata:
- `ComponentAnalyzer` class
- `extractDisplayName()` - Finds `Component.displayName` assignments
- `extractDefaultElement()` - Discovers default rendering elements
- `findDefaultElementInFunction()` - Parses `useRender({ render: render || <element /> })` patterns
- `findDynamicComponent()` - Handles dynamic element selection (`const Component = condition ? 'span' : 'a'`)

### Props Analyzer (`props-analyzer.ts`)
Comprehensive props analysis with multiple data sources:
- `PropsAnalyzer` class
- `extractProps()` - Main props extraction with filtering and enhancement
- `extractPropsType()` - Gets props type from component types
- `extractForwardRefTypes()` - Handles `ForwardRefExoticComponent<Props & RefAttributes<T>>`
- Integrates Vanilla Extract defaults and Base UI descriptions

### Main Type Extractor (`type-extractor-refactored.ts`)
Orchestrates all analyzers and manages the TypeScript program:
- `TypeExtractor` class - Main entry point
- `initializeTypeScriptProgram()` - Sets up TypeScript compiler with Base UI types
- `initializeAnalyzers()` - Creates specialized analyzer instances
- `extractComponentTypes()` - Main extraction workflow
- `parseExport()` - Handles different export patterns
- `createComponentInfo()` - Assembles final component metadata

## Usage

### Basic Usage
```typescript
import { extractComponentTypesFromFile } from './lib/type-extractor-refactored.js';

const components = extractComponentTypesFromFile(
  '../../packages/core/tsconfig.json',
  '../../packages/core/src/components/button/button.tsx'
);
```

### Advanced Configuration
```typescript
import { TypeExtractor } from './lib/type-extractor-refactored.js';

const extractor = new TypeExtractor({
  configPath: '../../packages/core/tsconfig.json',
  files: ['src/components/**/*.tsx'],
  projectRoot: '/path/to/project'
});

const components = extractor.extractComponentTypes('path/to/component.tsx');
```

## Data Flow

1. **Initialization**: TypeScript program setup with Base UI type discovery
2. **Export Analysis**: Parse exported symbols from source files  
3. **Component Detection**: Identify React components using type signatures
4. **Props Extraction**: Extract prop types with TypeScript Compiler API
5. **Enhancement**: Add descriptions, defaults, and metadata from multiple sources:
   - JSDoc comments from component source
   - Default values from Vanilla Extract CSS recipes
   - Prop descriptions from Base UI node_modules type definitions
   - Display names and default elements from component analysis
6. **Output**: Generate comprehensive `ComponentTypeInfo` objects

## Extension Points

### Adding New CSS Analysis
Extend `VanillaExtractAnalyzer` to support other CSS-in-JS libraries:
```typescript
class StitchesAnalyzer extends VanillaExtractAnalyzer {
  protected findDefaultVariants(sourceFile: ts.SourceFile) {
    // Custom stitches pattern detection
  }
}
```

### Adding New Component Libraries  
Create new analyzers following the `BaseUIAnalyzer` pattern:
```typescript
class ChakraUIAnalyzer {
  findUsedComponents(sourceFile: ts.SourceFile) { /* ... */ }
  getPropertyDescription(component: any, propName: string) { /* ... */ }
}
```

### Custom Prop Enhancement
Extend `PropsAnalyzer` to add new data sources:
```typescript
class EnhancedPropsAnalyzer extends PropsAnalyzer {
  protected getCustomDescription(prop: ts.Symbol, sourceFile: ts.SourceFile) {
    // Custom description extraction logic
  }
}
```

## Debugging

Enable debug output by checking the console logs with `[DEBUG]` prefix:
- `[DEBUG] Base UI import 발견` - Base UI import detection
- `[DEBUG] JSX에서 사용됨` - JSX usage confirmation  
- `[DEBUG] Base UI 타입 파일 추가` - Type file discovery
- `[DEBUG] Base UI prop 발견` - Prop found in type definitions
- `[DEBUG] Base UI JSDoc 발견` - JSDoc description extraction

## Performance Considerations

- **TypeScript Program Reuse**: The same program instance analyzes multiple files
- **Base UI Type Caching**: Type files are discovered once and reused
- **Lazy Analyzer Initialization**: Analyzers are created only when needed
- **Selective File Inclusion**: Only relevant Base UI type files are included

## Future Improvements

- **Plugin Architecture**: Make analyzers pluggable with a registry system
- **Caching Layer**: Cache analysis results across runs
- **Parallel Processing**: Analyze multiple components concurrently  
- **Configuration File**: Support external configuration files for extensibility
- **Type Safety**: Add more strict typing for analyzer interfaces