import type { API, FileInfo, Transform } from 'jscodeshift';
import { migrateImportSpecifier } from '~/utils/import-transform';

const colorMapping: Record<string, string> = {
    'text-primary': 'primary-100',
    'text-primary-alternative': 'primary-200',
    'text-secondary': 'secondary-100',
    'text-secondary-alternative': 'secondary-200',
    'text-success': 'success-100',
    'text-success-alternative': 'success-200',
    'text-warning': 'warning-100',
    'text-warning-alternative': 'warning-200',
    'text-danger': 'danger-100',
    'text-danger-alternative': 'danger-200',
    'text-hint': 'hint-100',
    'text-hint-alternative': 'hint-200',
    'text-contrast': 'contrast-100',
    'text-contrast-alternative': 'contrast-200',
    'text-alternative': 'normal-100',
    'text-normal': 'normal-200',
};

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    root.find(j.ImportDeclaration).forEach((path) => {
        migrateImportSpecifier(root, j, path, 'Text', '@goorm-dev/vapor-core', '@vapor-ui/core');
    });

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'Text'
        ) {
            const attributesToRemove: number[] = [];
            let hasAsChild = false;

            element.openingElement.attributes?.forEach((attr, index) => {
                if (attr.type === 'JSXAttribute') {
                    if (attr.name.name === 'align') {
                        attributesToRemove.push(index);
                    } else if (attr.name.name === 'color') {
                        attr.name.name = 'foreground';
                        const colorValue = attr.value;
                        if (colorValue && colorValue.type === 'StringLiteral') {
                            const oldColor = colorValue.value;
                            if (oldColor && colorMapping[oldColor]) {
                                colorValue.value = colorMapping[oldColor];
                            }
                        }
                    } else if (attr.name.name === 'asChild') {
                        hasAsChild = true;
                        attributesToRemove.push(index);
                    } else if (attr.name.name === 'as') {
                        attr.name.name = 'render';
                        const asValue = attr.value;
                        if (
                            asValue &&
                            asValue.type === 'StringLiteral' &&
                            typeof asValue.value === 'string'
                        ) {
                            attr.value = j.jsxExpressionContainer(
                                j.jsxElement(
                                    j.jsxOpeningElement(j.jsxIdentifier(asValue.value), [], true)
                                )
                            );
                        }
                    }
                }
            });

            if (hasAsChild && element.children && element.children.length > 0) {
                const firstChild = element.children.find(
                    (child) => child.type === 'JSXElement' || child.type === 'JSXFragment'
                );

                if (firstChild && firstChild.type === 'JSXElement') {
                    const childElement = firstChild;
                    const childAttributes = childElement.openingElement.attributes || [];

                    element.openingElement.attributes = [
                        ...(element.openingElement.attributes || []),
                        j.jsxAttribute(
                            j.jsxIdentifier('render'),
                            j.jsxExpressionContainer(
                                j.jsxElement(
                                    j.jsxOpeningElement(
                                        childElement.openingElement.name,
                                        childAttributes,
                                        true
                                    )
                                )
                            )
                        ),
                    ];

                    element.children = childElement.children || [];
                }
            }

            attributesToRemove.reverse().forEach((index) => {
                element.openingElement.attributes?.splice(index, 1);
            });
        }
    });

    return root.toSource({});
};

export default transform;
export const parser = 'tsx';
