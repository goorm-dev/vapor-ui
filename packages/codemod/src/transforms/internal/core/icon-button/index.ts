import type {
    API,
    FileInfo,
    ImportSpecifier,
    JSXAttribute,
    JSXElement,
    JSXSpreadAttribute,
    Transform,
} from 'jscodeshift';

import {
    cleanUpSourcePackage,
    collectImportSpecifiersToMove,
    createNewImportDeclaration,
    mergeIntoExistingImport,
} from '~/utils/import-transform';
import { transformAsChildToRender } from '~/utils/jsx-transform';

const TARGET_PACKAGE = '@vapor-ui/core';
const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const OLD_COMPONENT_NAME = 'IconButton';
const NEW_COMPONENT_NAME = 'IconButton';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    const allSpecifiers: ImportSpecifier[] = collectImportSpecifiersToMove(j, root, SOURCE_PACKAGE);
    const specifiersToMove = allSpecifiers.filter(
        (spec) => spec.imported.name === OLD_COMPONENT_NAME,
    );

    if (specifiersToMove.length === 0) {
        return root.toSource();
    }

    const oldIconButtonLocalName =
        specifiersToMove.find((spec) => spec.imported.name === OLD_COMPONENT_NAME)?.local?.name ||
        OLD_COMPONENT_NAME;

    const localName = specifiersToMove[0].local?.name || NEW_COMPONENT_NAME;
    const hasAlias = localName !== NEW_COMPONENT_NAME;

    const transformedSpecifiers: ImportSpecifier[] = hasAlias
        ? [j.importSpecifier(j.identifier(NEW_COMPONENT_NAME), j.identifier(localName as string))]
        : [j.importSpecifier(j.identifier(NEW_COMPONENT_NAME))];

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === oldIconButtonLocalName
        ) {
            transformIconButton(j, element);
        }
    });

    const targetImport = root.find(j.ImportDeclaration, {
        source: { value: TARGET_PACKAGE },
    });

    if (targetImport.length > 0) {
        mergeIntoExistingImport(targetImport, transformedSpecifiers);
    } else {
        createNewImportDeclaration(j, root, TARGET_PACKAGE, transformedSpecifiers);
    }

    cleanUpSourcePackage(j, root, SOURCE_PACKAGE, specifiersToMove);

    return root.toSource();
};

function transformIconButton(j: API['jscodeshift'], element: JSXElement) {
    const attributes: (JSXAttribute | JSXSpreadAttribute)[] =
        element.openingElement.attributes || [];
    let hasRounded = false;
    let roundedValue: JSXAttribute['value'] = null;
    let hasShape = false;
    let iconPropValue: JSXAttribute['value'] | null = null;

    // First pass: collect information about rounded, shape, and icon props
    for (const attribute of attributes) {
        if (attribute.type === 'JSXAttribute' && attribute.name.type === 'JSXIdentifier') {
            if (attribute.name.name === 'rounded') {
                hasRounded = true;
                roundedValue = attribute.value;
            } else if (attribute.name.name === 'shape') {
                hasShape = true;
            } else if (attribute.name.name === 'icon') {
                iconPropValue = attribute.value;
            }
        }
    }
    // Second pass: transform props
    const newAttributes = attributes
        .map((attr) => {
            if (attr.type !== 'JSXAttribute') {
                return attr;
            }

            if (attr.name.type !== 'JSXIdentifier') {
                return attr;
            }

            const attrName = attr.name.name;

            // Remove rounded prop
            if (attrName === 'rounded') {
                return null;
            }

            // Transform shape prop to variant prop
            if (attrName === 'shape') {
                const newAttr = j.jsxAttribute(j.jsxIdentifier('variant'), attr.value);

                // Change 'invisible' to 'ghost'
                if (
                    attr.value &&
                    attr.value.type === 'StringLiteral' &&
                    attr.value.value === 'invisible'
                ) {
                    newAttr.value = j.stringLiteral('ghost');
                }

                return newAttr;
            }

            // Remove icon prop (will be converted to children)
            if (attrName === 'icon') {
                return null;
            }

            // Warn about deprecated iconClassName prop
            if (attrName === 'iconClassName') {
                console.warn(
                    `[IconButton] 'iconClassName' prop is deprecated and will be removed. Found in ${element.loc?.start.line}`,
                );
                return null;
            }

            if (attrName === 'color') {
                const newAttr = j.jsxAttribute(j.jsxIdentifier('colorPalette'), attr.value);

                if (
                    attr.value &&
                    attr.value.type === 'StringLiteral' &&
                    attr.value.value === 'hint'
                ) {
                    console.warn(
                        `[IconButton] 'hint' color is not supported in new version. Consider using 'secondary' instead. Found in ${element.loc?.start.line}`,
                    );
                }

                return newAttr;
            }

            return attr;
        })
        .filter((attr) => attr !== null);

    // Add shape prop if rounded was present and shape wasn't
    if (hasRounded && !hasShape) {
        const shapeAttr = createShapeAttributeFromRounded(j, roundedValue);
        newAttributes.push(shapeAttr);
    }

    element.openingElement.attributes = newAttributes;

    // Convert icon prop to children if present
    if (iconPropValue && element.openingElement.selfClosing) {
        element.openingElement.selfClosing = false;

        let iconChild;
        if (
            iconPropValue.type === 'JSXExpressionContainer' &&
            iconPropValue.expression.type === 'Identifier'
        ) {
            // icon={HeartIcon} -> <HeartIcon />
            iconChild = j.jsxElement(
                j.jsxOpeningElement(j.jsxIdentifier(iconPropValue.expression.name), [], true),
            );
        } else {
            // Fallback: just use the expression as-is
            iconChild = j.jsxExpressionContainer(iconPropValue);
        }

        element.children = [iconChild];
        element.closingElement = j.jsxClosingElement(j.jsxIdentifier('IconButton'));
    }

    // Transform asChild prop to render prop
    transformAsChildToRender(j, element);
}

function createShapeAttributeFromRounded(
    j: API['jscodeshift'],
    roundedValue: JSXAttribute['value'],
) {
    // If rounded is explicitly true or no value (means true)
    if (
        !roundedValue ||
        (roundedValue.type === 'JSXExpressionContainer' &&
            roundedValue.expression.type === 'BooleanLiteral' &&
            roundedValue.expression.value === true)
    ) {
        return j.jsxAttribute(j.jsxIdentifier('shape'), j.stringLiteral('circle'));
    }

    // If rounded is explicitly false
    if (
        roundedValue.type === 'JSXExpressionContainer' &&
        roundedValue.expression.type === 'BooleanLiteral' &&
        roundedValue.expression.value === false
    ) {
        return j.jsxAttribute(j.jsxIdentifier('shape'), j.stringLiteral('square'));
    }

    // If rounded is a variable or expression, create ternary
    if (
        roundedValue.type === 'JSXExpressionContainer' &&
        roundedValue.expression.type !== 'JSXEmptyExpression'
    ) {
        const ternary = j.conditionalExpression(
            roundedValue.expression,
            j.stringLiteral('circle'),
            j.stringLiteral('square'),
        );
        return j.jsxAttribute(j.jsxIdentifier('shape'), j.jsxExpressionContainer(ternary));
    }

    // Default to square
    return j.jsxAttribute(j.jsxIdentifier('shape'), j.stringLiteral('square'));
}

export default transform;
export const parser = 'tsx';
