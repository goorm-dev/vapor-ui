import type { Rule } from 'eslint';
import type { ImportDeclaration } from 'estree';

import type { Any } from '~/utils/guard';
import { isJSXIdentifier, isJSXMemberExpression } from '~/utils/guard';

// estree와 estree-jsx 타입을 활용하여 AST 노드에 접근합니다.
export const ariaLabelOnIconButtonRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce aria-label prop on IconButton component.',
        },
        fixable: undefined,
        messages: {
            missingAriaLabel: "The 'IconButton' component requires an 'aria-label' prop.",
        },
    },
    create(context: Rule.RuleContext) {
        const sourceToComponent: Record<string, string> = {
            '@vapor-ui/core/icon-button': 'IconButton',
        };

        const components = new Set(['IconButton']);
        const importedNames = new Set<string>();
        const namespaces = new Set<string>();

        return {
            // Import 분석
            ImportDeclaration(node: ImportDeclaration) {
                const source = node.source.value as string;
                const targetComponent = sourceToComponent[source];

                // import { IconButton } from '@vapor-ui/core/icon-button'
                if (targetComponent) {
                    node.specifiers.forEach((specifier) => {
                        if (
                            (specifier.type === 'ImportSpecifier' &&
                                specifier.imported.type === 'Identifier' &&
                                specifier.imported.name === targetComponent) ||
                            specifier.type === 'ImportDefaultSpecifier' // import Breadcrumb from '...' 대응
                        ) {
                            importedNames.add(specifier.local.name);
                        }
                    });
                }

                if (source === '@vapor-ui/core') {
                    node.specifiers.forEach((specifier) => {
                        if (
                            specifier.type === 'ImportSpecifier' &&
                            specifier.imported.type === 'Identifier' &&
                            components.has(specifier.imported.name)
                        ) {
                            // import { IconButton as MyBtn }
                            importedNames.add(specifier.local.name);
                        }

                        if (specifier.type === 'ImportNamespaceSpecifier') {
                            // import * as MDS from '...'
                            namespaces.add(specifier.local.name);
                        }
                    });
                }
            },

            JSXOpeningElement(node) {
                const nodeName = node.name;
                let isTarget = false;

                // ex) <IconButton />
                if (isJSXIdentifier(nodeName) && importedNames.has(nodeName.name)) {
                    isTarget = true;
                }

                // ex) <Vapor.IconButton />
                if (isJSXMemberExpression(nodeName)) {
                    const nsObject = nodeName.object;
                    const nsProperty = nodeName.property;

                    if (
                        isJSXIdentifier(nsObject) &&
                        namespaces.has(nsObject.name) &&
                        components.has(nsProperty.name)
                    ) {
                        isTarget = true;
                    }
                }

                if (!isTarget) return;

                const hasAriaLabel = node.attributes.some(
                    (attr: Any) => attr.type === 'JSXAttribute' && attr.name.name === 'aria-label',
                );

                if (!hasAriaLabel) {
                    context.report({
                        node,
                        messageId: 'missingAriaLabel',
                    });
                }
            },
        };
    },
};
