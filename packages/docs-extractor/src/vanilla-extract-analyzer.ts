import * as path from 'path';
import ts from 'typescript';

import { getLiteralValue } from './utils';

/**
 * Finds the CSS file associated with a component file
 */
export function findCssFile(program: ts.Program, componentFilePath: string): string | undefined {
    const dir = path.dirname(componentFilePath);
    const baseName = path.basename(componentFilePath, path.extname(componentFilePath));

    const possibleCssFiles = [
        path.join(dir, `${baseName}.css.ts`),
        path.join(dir, `${baseName}.styles.ts`),
        path.join(dir, `${baseName}.css.js`),
    ];

    for (const cssFile of possibleCssFiles) {
        const cssSourceFile = program.getSourceFile(cssFile);
        if (cssSourceFile) {
            return cssFile;
        }
    }

    return undefined;
}

/**
 * Extracts default value for a prop from CSS defaultVariants
 */
export function extractDefaultValue(
    program: ts.Program,
    cssFilePath: string,
    propName: string,
): string | undefined {
    const cssSourceFile = program.getSourceFile(cssFilePath);
    if (!cssSourceFile) {
        return undefined;
    }

    const defaultVariants = findDefaultVariants(cssSourceFile);
    if (defaultVariants && defaultVariants[propName] !== undefined) {
        return String(defaultVariants[propName]);
    }

    return undefined;
}

/**
 * Finds defaultVariants object in a Vanilla Extract recipe
 */
function findDefaultVariants(
    sourceFile: ts.SourceFile,
): Record<string, string | number | boolean | null> | undefined {
    let defaultVariants: Record<string, string | number | boolean | null> | undefined;

    const visit = (node: ts.Node) => {
        // recipe({ defaultVariants: { ... } }) pattern
        if (
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'recipe'
        ) {
            const arg = node.arguments[0];
            if (ts.isObjectLiteralExpression(arg)) {
                const defaultVariantsProp = arg.properties.find(
                    (prop) =>
                        ts.isPropertyAssignment(prop) &&
                        ts.isIdentifier(prop.name) &&
                        prop.name.text === 'defaultVariants',
                );

                if (defaultVariantsProp && ts.isPropertyAssignment(defaultVariantsProp)) {
                    defaultVariants = parseObjectLiteral(defaultVariantsProp.initializer);
                }
            }
        }

        // export const root = recipe({ ... }) pattern
        if (
            ts.isVariableDeclaration(node) &&
            node.initializer &&
            ts.isCallExpression(node.initializer)
        ) {
            visit(node.initializer);
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return defaultVariants;
}

/**
 * Parses an object literal expression into a plain JavaScript object
 */
function parseObjectLiteral(node: ts.Node): Record<string, string | number | boolean | null> {
    const result: Record<string, string | number | boolean | null> = {};

    if (ts.isObjectLiteralExpression(node)) {
        node.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                const key = prop.name.text;
                const value = getLiteralValue(prop.initializer);
                if (value !== undefined) {
                    result[key] = value;
                }
            }
        });
    }

    return result;
}
