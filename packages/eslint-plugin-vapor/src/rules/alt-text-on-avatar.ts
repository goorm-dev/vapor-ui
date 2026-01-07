import type { Rule } from 'eslint';
import type { ImportDeclaration } from 'estree';

import { getSource } from '~/utils/get-source';
import { isJSXIdentifier, isJSXMemberExpression } from '~/utils/guard';

export const altTextOnAvatarRule: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: {
            description: "Enforce 'alt' prop on Avatar.Root component when 'src' prop is present.",
        },
        messages: {
            missingAlt:
                "The '{{ componentName }}' must have an 'alt' prop when 'src' prop is used. It is important for accessibility to provide alternative text for images.",
        },
    },
    create(context) {
        const components = new Set(['Avatar']);
        const sourceToComponent = getSource(components);

        const importedNames = new Set<string>(); // import { Avatar }
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

                if (!isJSXMemberExpression(nodeName) || nodeName.property.name !== 'Root') {
                    return;
                }

                // Case 1: <Avatar.Root />
                if (isJSXIdentifier(nodeName.object) && importedNames.has(nodeName.object.name)) {
                    isTarget = true;
                    detectedName = `${nodeName.object.name}.Root`;
                }

                // Case 2: <Vapor.Avatar.Root />

                if (isJSXMemberExpression(nodeName.object)) {
                    const nsObject = nodeName.object.object;
                    const nsProperty = nodeName.object.property;

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

                // 속성 검사
                const hasSrc = node.attributes.some(
                    (attr) =>
                        attr.type === 'JSXAttribute' &&
                        attr.name.type === 'JSXIdentifier' && // NamespacedName (예: xml:lang) 방지
                        attr.name.name === 'src',
                );

                const hasAlt = node.attributes.some(
                    (attr) =>
                        attr.type === 'JSXAttribute' &&
                        attr.name.type === 'JSXIdentifier' &&
                        attr.name.name === 'alt',
                );

                // 규칙: src가 있는데 alt가 없으면 에러
                if (hasSrc && !hasAlt) {
                    context.report({
                        node,
                        messageId: 'missingAlt',
                        data: { componentName: detectedName },
                    });
                }
            },
        };
    },
};
