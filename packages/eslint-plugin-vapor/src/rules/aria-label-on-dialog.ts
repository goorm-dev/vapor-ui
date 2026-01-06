import type { Rule } from 'eslint';
import type { ImportDeclaration } from 'estree';

import { getSource } from '~/utils/get-source';
import { isJSXIdentifier, isJSXMemberExpression } from '~/utils/guard';

export const ariaLabelOnDialogRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'Enforce aria-label prop on Dialog.Popup/PopupPrimitive, Popover.Popup/PopupPrimitive, and Sheet.Popup/PopupPrimitive elements.',
        },
        fixable: undefined,
        messages: {
            missingAriaLabel: "The '{{ componentName }}' requires an 'aria-label' prop.",
        },
    },
    create(context) {
        const targetComponents = new Set(['Dialog', 'Popover', 'Sheet']);
        const sourceToComponent = getSource(targetComponents);

        const importedNames = new Set<string>(); // import { Dialog }
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
                            specifier.type === 'ImportDefaultSpecifier'
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
                            targetComponents.has(specifier.imported.name)
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
                const targetName = new Set(['Popup', 'PopupPrimitive']);
                const nodeName = node.name;
                let isTarget = false;
                let detectedName = '';

                if (!isJSXMemberExpression(nodeName) || !targetName.has(nodeName.property.name)) {
                    return;
                }

                const nodeObject = nodeName.object;

                // 1. 일반 합성 컴포넌트 형태: <Dialog.Popup />
                if (isJSXIdentifier(nodeObject) && importedNames.has(nodeObject.name)) {
                    isTarget = true;
                    detectedName = `${nodeObject.name}.${nodeName.property.name}`;
                }

                // 2. 네임스페이스 합성 컴포넌트 형태: <Vapor.Dialog.Popup />
                if (isJSXMemberExpression(nodeObject)) {
                    const nsObject = nodeObject.object;
                    const nsProperty = nodeObject.property;

                    if (
                        isJSXIdentifier(nsObject) &&
                        namespaces.has(nsObject.name) &&
                        targetComponents.has(nsProperty.name)
                    ) {
                        isTarget = true;
                        detectedName = `${nsProperty.name}.${nodeName.property.name}`;
                    }
                }

                if (!isTarget) return;

                const hasAriaLabel = node.attributes.some(
                    (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'aria-label',
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
