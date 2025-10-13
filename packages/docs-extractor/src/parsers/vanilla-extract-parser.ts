import * as path from 'path';
import ts from 'typescript';

import { getLiteralValue } from '~/utils';

/**
 * Finds the CSS file associated with a component file
 */
export function findCssFile(program: ts.Program, componentFilePath: string): string | undefined {
    const dir = path.dirname(componentFilePath);
    const baseName = path.basename(componentFilePath, path.extname(componentFilePath));

    // For index.ts files, also check for sibling component files
    const possibleCssFiles = [
        path.join(dir, `${baseName}.css.ts`),
        path.join(dir, `${baseName}.styles.ts`),
        path.join(dir, `${baseName}.css.js`),
    ];

    // If this is an index.ts file, also check for CSS files with the directory name
    if (baseName === 'index') {
        const dirName = path.basename(dir);
        possibleCssFiles.push(path.join(dir, `${dirName}.css.ts`));
    }

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
        // export const root = recipe({ ... }) pattern - only check root variable
        if (
            ts.isVariableDeclaration(node) &&
            node.name &&
            ts.isIdentifier(node.name) &&
            node.name.text === 'root' &&
            node.initializer &&
            ts.isCallExpression(node.initializer) &&
            ts.isIdentifier(node.initializer.expression) &&
            node.initializer.expression.text === 'recipe'
        ) {
            const arg = node.initializer.arguments[0];
            if (ts.isObjectLiteralExpression(arg)) {
                const defaultVariantsProp = arg.properties.find(
                    (prop) =>
                        ts.isPropertyAssignment(prop) &&
                        ts.isIdentifier(prop.name) &&
                        prop.name.text === 'defaultVariants',
                );

                if (defaultVariantsProp && ts.isPropertyAssignment(defaultVariantsProp)) {
                    defaultVariants = parseObjectLiteral(defaultVariantsProp.initializer);
                    return; // Stop visiting once we find the root defaultVariants
                }
            }
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
