import type { Rule } from 'eslint';
import type { ImportDeclaration } from 'estree';

import type { Any } from '~/utils/guard';
import { isJSXIdentifier, isJSXMemberExpression } from '~/utils/guard';

export const ariaLabelOnNavigationRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'Enforce aria-label prop on NavigationMenu.Root and Breadcrumb.Root components.',
        },
        fixable: undefined,
        messages: {
            missingAriaLabel: "The '{{ componentName }}' requires an 'aria-label' prop.",
        },
    },
    create(context) {
        const sourceToComponent: Record<string, string> = {
            '@vapor-ui/core/navigation-menu': 'NavigationMenu',
            '@vapor-ui/core/breadcrumb': 'Breadcrumb',
        };

        const components = new Set(['NavigationMenu', 'Breadcrumb']);
        const importedNames = new Set<string>(); // import { NavigationMenu }
        const namespaces = new Set<string>(); // import * as Vapor

        return {
            ImportDeclaration(node: ImportDeclaration) {
                const source = node.source.value as string;
                const targetComponent = sourceToComponent[source];

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
                            importedNames.add(specifier.local.name);
                        }

                        if (specifier.type === 'ImportNamespaceSpecifier') {
                            namespaces.add(specifier.local.name);
                        }
                    });
                }
            },

            JSXOpeningElement(node) {
                const nodeName = node.name;
                let isTarget = false;
                let detectedName = '';

                if (!isJSXMemberExpression(nodeName) || nodeName.property.name !== 'Root') return;

                const nodeObject = nodeName.object;

                // ex) <NavigationMenu.Root />
                if (isJSXIdentifier(nodeObject) && importedNames.has(nodeObject.name)) {
                    isTarget = true;
                    detectedName = `${nodeObject.name}.Root`;
                }

                // ex) <Vapor.NavigationMenu.Root />
                if (isJSXMemberExpression(nodeObject)) {
                    const nsObject = nodeObject.object;
                    const nsProperty = nodeObject.property;

                    if (
                        isJSXIdentifier(nsObject) &&
                        namespaces.has(nsObject.name) &&
                        components.has(nsProperty.name)
                    ) {
                        isTarget = true;
                        detectedName = `${nsProperty.name}.Root`;
                    }
                }

                if (!isTarget) return;

                // 속성 검사 로직
                const hasAriaLabel = node.attributes.some(
                    (attr: Any) => attr.type === 'JSXAttribute' && attr.name.name === 'aria-label',
                );

                if (!hasAriaLabel) {
                    context.report({
                        node,
                        messageId: 'missingAriaLabel',
                        data: { componentName: detectedName },
                    });
                }
            },
        };
    },
};
