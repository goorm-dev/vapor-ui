import type {
    API,
    FileInfo,
    Transform,
    JSXElement,
    JSXAttribute,
    ImportSpecifier,
    ASTPath,
    ImportDeclaration,
    StringLiteral,
} from 'jscodeshift';
import { migrateImportSpecifier } from '~/utils/import-migration';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    root.find(j.ImportDeclaration).forEach((path) => {
        migrateImportSpecifier(
            root,
            j,
            path,
            'Breadcrumb',
            '@goorm-dev/vapor-core',
            '@vapor-ui/core'
        );
    });

    const vaporImports = root.find(j.ImportDeclaration, {
        source: { value: '@vapor-ui/core' },
    });

    if (vaporImports.length > 1) {
        const allSpecifiers: ImportSpecifier[] = [];
        vaporImports.forEach((path: ASTPath<ImportDeclaration>) => {
            path.value.specifiers?.forEach((spec) => {
                if (spec.type === 'ImportSpecifier') {
                    const exists = allSpecifiers.some(
                        (s) => s.imported.name === spec.imported.name
                    );
                    if (!exists) {
                        allSpecifiers.push(spec);
                    }
                }
            });
        });

        const firstImport = vaporImports.at(0).get();
        firstImport.value.specifiers = allSpecifiers;

        vaporImports.forEach((path, idx) => {
            if (idx > 0) {
                j(path).remove();
            }
        });
    }

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'Breadcrumb'
        ) {
            element.openingElement.name = j.jsxMemberExpression(
                j.jsxIdentifier('Breadcrumb'),
                j.jsxIdentifier('Root')
            );

            if (element.closingElement) {
                element.closingElement.name = j.jsxMemberExpression(
                    j.jsxIdentifier('Breadcrumb'),
                    j.jsxIdentifier('Root')
                );
            }

            element.openingElement.attributes?.forEach((attr) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'size') {
                    if (
                        attr.value &&
                        attr.value.type === 'StringLiteral' &&
                        attr.value.value === 'xs'
                    ) {
                        attr.value.value = 'sm';
                    }
                }
            });

            const itemElements: JSXElement[] = [];
            element.children?.forEach((child) => {
                if (
                    child.type === 'JSXElement' &&
                    child.openingElement.name.type === 'JSXMemberExpression' &&
                    child.openingElement.name.object.type === 'JSXIdentifier' &&
                    child.openingElement.name.object.name === 'Breadcrumb' &&
                    child.openingElement.name.property.name === 'Item'
                ) {
                    itemElements.push(child);
                }
            });

            const newChildren: (JSXElement | ReturnType<typeof j.jsxText>)[] = [];
            itemElements.forEach((item, index) => {
                newChildren.push(j.jsxText('\n    '));
                let href: string | undefined;
                let active = false;
                const otherAttrs: JSXAttribute[] = [];

                item.openingElement.attributes?.forEach((attr) => {
                    if (attr.type === 'JSXAttribute') {
                        if (attr.name.name === 'href') {
                            href = (attr.value as StringLiteral).value;
                        } else if (attr.name.name === 'active') {
                            active = true;
                        } else {
                            otherAttrs.push(attr);
                        }
                    }
                });

                const linkElement = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier('Breadcrumb'),
                            j.jsxIdentifier('Link')
                        ),
                        [
                            ...(href
                                ? [
                                      j.jsxAttribute(
                                          j.jsxIdentifier('href'),
                                          typeof href === 'string' ? j.stringLiteral(href) : href
                                      ),
                                  ]
                                : []),
                            ...(active ? [j.jsxAttribute(j.jsxIdentifier('current'))] : []),
                        ]
                    ),
                    j.jsxClosingElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier('Breadcrumb'),
                            j.jsxIdentifier('Link')
                        )
                    ),
                    item.children
                );

                const wrappedItem = j.jsxElement(
                    j.jsxOpeningElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier('Breadcrumb'),
                            j.jsxIdentifier('Item')
                        ),
                        otherAttrs
                    ),
                    j.jsxClosingElement(
                        j.jsxMemberExpression(
                            j.jsxIdentifier('Breadcrumb'),
                            j.jsxIdentifier('Item')
                        )
                    ),
                    [j.jsxText('\n      '), linkElement, j.jsxText('\n    ')]
                );

                newChildren.push(wrappedItem);

                if (index < itemElements.length - 1) {
                    newChildren.push(j.jsxText('\n    '));
                    newChildren.push(
                        j.jsxElement(
                            j.jsxOpeningElement(
                                j.jsxMemberExpression(
                                    j.jsxIdentifier('Breadcrumb'),
                                    j.jsxIdentifier('Separator')
                                ),
                                [],
                                true
                            )
                        )
                    );
                }
            });

            newChildren.push(j.jsxText('\n  '));

            const listElement = j.jsxElement(
                j.jsxOpeningElement(
                    j.jsxMemberExpression(j.jsxIdentifier('Breadcrumb'), j.jsxIdentifier('List')),
                    []
                ),
                j.jsxClosingElement(
                    j.jsxMemberExpression(j.jsxIdentifier('Breadcrumb'), j.jsxIdentifier('List'))
                ),
                newChildren
            );

            element.children = [j.jsxText('\n  '), listElement, j.jsxText('\n')];
        }

        if (
            element.openingElement.name.type === 'JSXMemberExpression' &&
            element.openingElement.name.object.type === 'JSXIdentifier' &&
            element.openingElement.name.object.name === 'Breadcrumb'
        ) {
            const propertyName = element.openingElement.name.property.name;

            if (propertyName === 'Item') {
                element.openingElement.attributes?.forEach((attr) => {
                    if (attr.type === 'JSXAttribute' && attr.name.name === 'active') {
                        attr.name.name = 'current';
                    }
                });
            }
        }
    });

    return root.toSource({});
};

export default transform;
export const parser = 'tsx';
