import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as tae from 'typescript-api-extractor';

import { formatEnum, formatProperties } from './formatter';
import memberOrder from './order.json';

function extractDescriptionByLanguage(
    description: string | undefined,
    language: string,
): string | undefined {
    if (!description) return undefined;
    // Remove documentation URLs
    const cleanDescription = description.replace(/\n\nDocumentation: .*$/ms, '');

    // Split by lines to find language-specific descriptions
    const lines = cleanDescription.split('\n');

    // Look for lines with language prefix (e.g., "ko: 설명", "en: description")
    const languagePrefix = `${language}: `;
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith(languagePrefix)) {
            return trimmedLine.substring(languagePrefix.length).trim();
        }
    }

    // If no language-specific description found, try to find the first line that starts with the language prefix
    // or fallback to removing any language prefix from the first meaningful line
    const firstLine = lines.find((line) => line.trim() && !line.trim().startsWith('*'))?.trim();
    if (firstLine) {
        // Remove any language prefix from the first line
        return firstLine.replace(/^[a-z]{2}:\s*/, '').trim();
    }

    return undefined;
}

function extractDefaultVariants(componentFilePath: string): Record<string, any> | undefined {
    try {
        // Find corresponding CSS file (e.g., badge.tsx -> badge.css.ts)
        const dir = path.dirname(componentFilePath);
        const basename = path.basename(componentFilePath, path.extname(componentFilePath));
        const cssFilePath = path.join(dir, `${basename}.css.ts`);

        if (!fs.existsSync(cssFilePath)) {
            return undefined;
        }

        // Read and parse CSS file
        const cssContent = fs.readFileSync(cssFilePath, 'utf-8');
        const sourceFile = ts.createSourceFile(
            cssFilePath,
            cssContent,
            ts.ScriptTarget.Latest,
            true,
        );

        let defaultVariants: Record<string, any> | undefined;

        function visit(node: ts.Node) {
            // Look for recipe() call
            if (
                ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.text === 'recipe'
            ) {
                // Get the first argument (recipe config object)
                const configArg = node.arguments[0];
                if (ts.isObjectLiteralExpression(configArg)) {
                    // Find defaultVariants property
                    for (const property of configArg.properties) {
                        if (
                            ts.isPropertyAssignment(property) &&
                            ts.isIdentifier(property.name) &&
                            property.name.text === 'defaultVariants' &&
                            ts.isObjectLiteralExpression(property.initializer)
                        ) {
                            // Extract the default values
                            const defaults: Record<string, any> = {};
                            for (const defaultProp of property.initializer.properties) {
                                if (
                                    ts.isPropertyAssignment(defaultProp) &&
                                    ts.isIdentifier(defaultProp.name) &&
                                    ts.isStringLiteral(defaultProp.initializer)
                                ) {
                                    defaults[defaultProp.name.text] = defaultProp.initializer.text;
                                }
                            }
                            defaultVariants = defaults;
                            break;
                        }
                    }
                }
            }

            ts.forEachChild(node, visit);
        }

        visit(sourceFile);
        return defaultVariants;
    } catch (error) {
        console.warn(`Failed to extract default variants from CSS file: ${error}`);
        return undefined;
    }
}

export function formatComponentData(
    component: tae.ExportNode,
    allExports: tae.ExportNode[],
    language: string = 'ko',
    sourceFilePath: string = '',
    displayName?: string,
) {
    const description = extractDescriptionByLanguage(
        component.documentation?.description,
        language,
    );
    const dataAttributes = allExports.find(
        (node) => node.name === `${component.name}DataAttributes`,
    );
    const cssVariables = allExports.find((node) => node.name === `${component.name}CssVars`);

    // Extract default variants from CSS file
    const defaultVariants = extractDefaultVariants(sourceFilePath);

    const componentName = displayName || component.name;
    const importPath = displayName
        ? `import { ${displayName.split('.')[0]} } from '@vapor-ui/react'`
        : undefined;
    const usage = displayName ? `<${displayName}>` : undefined;

    return {
        name: componentName,
        importPath,
        usage,
        description,
        props: sortObjectByKeys(
            formatProperties(
                (component.type as tae.ComponentNode).props,
                language,
                defaultVariants,
            ),
            memberOrder.props,
        ),
        dataAttributes: dataAttributes
            ? sortObjectByKeys(
                  formatEnum(dataAttributes.type as tae.EnumNode),
                  memberOrder.dataAttributes,
              )
            : {},
        cssVariables: cssVariables
            ? sortObjectByKeys(
                  formatEnum(cssVariables.type as tae.EnumNode),
                  memberOrder.cssVariables,
              )
            : {},
    };
}

export function isPublicComponent(exportNode: tae.ExportNode) {
    return (
        exportNode.type instanceof tae.ComponentNode &&
        !exportNode.documentation?.hasTag('ignore') &&
        exportNode.isPublic()
    );
}

export function isNamespaceComponent(exportNode: tae.ExportNode) {
    return (
        exportNode.type instanceof tae.ObjectNode &&
        exportNode.name.match(/^[A-Z][a-zA-Z]+$/) &&
        !exportNode.documentation?.hasTag('ignore') &&
        exportNode.isPublic()
    );
}

export function extractNamespaceComponents(
    namespaceNode: tae.ExportNode,
    allExports: tae.ExportNode[],
): Map<string, tae.ExportNode> {
    const components = new Map<string, tae.ExportNode>();

    if (!(namespaceNode.type instanceof tae.ObjectNode)) {
        return components;
    }

    // Get the object properties (Root, Image, Fallback, etc.)
    const objectType = namespaceNode.type as tae.ObjectNode;

    for (const property of objectType.properties) {
        const propertyName = property.name;

        // Look for corresponding component exports
        // For Avatar = { Root, Image }, find the Root and Image components
        const componentExport = allExports.find((exportNode) => {
            return (
                exportNode.type instanceof tae.ComponentNode &&
                exportNode.name === propertyName &&
                exportNode.isPublic()
            );
        });

        if (componentExport) {
            components.set(propertyName, componentExport);
        }
    }

    return components;
}

function sortObjectByKeys<T>(obj: Record<string, T>, order: string[]): Record<string, T> {
    if (order.length === 0) {
        return obj;
    }

    const sortedObj: Record<string, T> = {};
    const everythingElse: Record<string, T> = {};

    // Gather keys that are not in the order array
    Object.keys(obj).forEach((key) => {
        if (!order.includes(key)) {
            everythingElse[key] = obj[key];
        }
    });

    // Sort the keys of everythingElse
    const sortedEverythingElseKeys = Object.keys(everythingElse).sort();

    // Populate the sorted object according to the order array
    order.forEach((key) => {
        if (key === '__EVERYTHING_ELSE__') {
            // Insert all "everything else" keys at this position, sorted
            sortedEverythingElseKeys.forEach((sortedKey) => {
                sortedObj[sortedKey] = everythingElse[sortedKey];
            });
        } else if (obj.hasOwnProperty(key)) {
            sortedObj[key] = obj[key];
        }
    });

    return sortedObj;
}
