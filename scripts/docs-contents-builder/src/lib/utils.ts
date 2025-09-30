import * as ts from 'typescript';
import { type ExternalTypeNode } from 'typescript-api-extractor';

/**
 * Utility functions for TypeScript analysis and component extraction
 */

/**
 * Checks if a prop should be included based on its source location
 * Only includes props from: component files, Base UI d.ts files, and Vanilla Extract files
 */
export function shouldIncludePropBySource(
    prop: ts.Symbol,
    checker: ts.TypeChecker,
    sourceFile: ts.SourceFile,
): boolean {
    const symbol = prop.valueDeclaration
        ? checker.getSymbolAtLocation(prop.valueDeclaration)
        : prop;

    if (!symbol || !symbol.declarations) {
        return false;
    }

    for (const declaration of symbol.declarations) {
        const { fileName: declarationFileName } = declaration.getSourceFile();
        // 1. Component file itself (current source file)
        if (declarationFileName === sourceFile.fileName) {
            return true;
        }

        // 2. Base UI component d.ts files
        if (
            declarationFileName.includes('node_modules/@base-ui-components/react/esm') &&
            declarationFileName.endsWith('.d.ts')
        ) {
            return true;
        }

        // 3. Vanilla Extract files (.css.ts)
        if (declarationFileName.endsWith('.css.ts')) {
            return true;
        }

        // 4. Project's own type definition files (packages/core/src)
        if (
            declarationFileName.includes('packages/core/src') &&
            (declarationFileName.endsWith('.ts') || declarationFileName.endsWith('.tsx'))
        ) {
            return true;
        }
    }

    return false;
}

/**
 * Checks if a property should be excluded from component props
 * Filters out HTML attributes, React built-ins, and ARIA attributes
 */
export function shouldExcludeProp(propName: string): boolean {
    const excludedPatterns = [
        // Event handlers
        /^on[A-Z]/,
        // ARIA attributes
        /^aria-/,
        // HTML global attributes
        /^(id|style|title|lang|dir|hidden|tabIndex|role|slot|key|ref)$/,
        // HTML form attributes
        /^(form|formAction|formEncType|formMethod|formNoValidate|formTarget|name|type|value|defaultValue|defaultChecked|autoFocus|disabled)$/,
        // React specific
        /^(children|dangerouslySetInnerHTML|suppressHydrationWarning|suppressContentEditableWarning)$/,
        // Accessibility and meta attributes
        /^(accessKey|autoCapitalize|autoCorrect|autoSave|contentEditable|contextMenu|draggable|enterKeyHint|inputMode|is|nonce|spellCheck|translate|unselectable|radioGroup)$/,
        // RDFa attributes
        /^(about|content|datatype|inlist|prefix|property|rel|resource|rev|typeof|vocab)$/,
        // Microdata attributes
        /^(itemProp|itemScope|itemType|itemID|itemRef)$/,
        // Other attributes
        /^(results|security|exportparts|part)$/,
    ];

    return excludedPatterns.some((pattern) => pattern.test(propName));
}

/**
 * Checks if a TypeScript type represents a React component
 */

const componentReturnTypes = [/Element/, /ReactNode/, /ReactElement(<.*>)?/];

export function isReactReturnType(type: ts.Type, checker: ts.TypeChecker) {
    const typeString = checker.typeToString(type);

    return componentReturnTypes.some((regex) => regex.test(typeString));
}

/**
 * Extracts JSDoc description from a TypeScript symbol
 */
export function getJSDocDescription(
    symbol: ts.Symbol,
    checker: ts.TypeChecker,
): string | undefined {
    const documentation = symbol.getDocumentationComment(checker);

    if (documentation.length > 0) {
        return documentation.map((part) => part.text).join('');
    }

    return undefined;
}

/**
 * Extracts default value from JSDoc @default tag
 */
export function getJSDocDefaultValue(symbol: ts.Symbol): string | undefined {
    const jsDocTags = symbol.getJsDocTags();
    const defaultTag = jsDocTags?.find((tag) => tag.name === 'default');
    if (defaultTag && defaultTag.text) {
        return defaultTag.text.map((part) => part.text).join('');
    }
    return undefined;
}

/**
 * Parses a literal value from a TypeScript AST node
 */
export function getLiteralValue(node: ts.Node): any {
    if (ts.isStringLiteral(node)) {
        return node.text;
    }
    if (ts.isNumericLiteral(node)) {
        return Number(node.text);
    }
    if (node.kind === ts.SyntaxKind.TrueKeyword) {
        return true;
    }
    if (node.kind === ts.SyntaxKind.FalseKeyword) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) {
        return null;
    }
    return undefined;
}

/**
 * Parses TypeScript union types into array format
 * Converts '"primary" | "success" | "warning" | undefined' to ["primary", "success", "warning"]
 * Removes "undefined" from union types for optional props
 */
export function parseTypeToArray(
    typeString: string,
    isRequired: boolean = false,
): string[] | string {
    // Check if it's a union type
    if (!typeString.includes(' | ')) {
        return typeString;
    }

    // Split by union separator and clean up each type
    let types = typeString
        .split(' | ')
        .map((type) => type.trim())
        .map((type) => {
            // Remove quotes from string literals: "primary" -> primary
            if (type.startsWith('"') && type.endsWith('"')) {
                return type.slice(1, -1);
            }
            // Remove quotes from string literals: 'primary' -> primary
            if (type.startsWith("'") && type.endsWith("'")) {
                return type.slice(1, -1);
            }
            // Keep other types as is: undefined, number, boolean, etc.
            return type;
        });

    // Remove "undefined" for optional props (not required)
    if (!isRequired) {
        types = types.filter((type) => type !== 'undefined');
    }

    return types;
}
