import type { API, FileInfo, JSXAttribute, JSXElement, Transform } from 'jscodeshift';
import { mergeImports, transformImportDeclaration } from '~/utils/import-transform';
import { transformAsChildToRender } from '~/utils/jsx-transform';

const TARGET_PACKAGE = '@vapor-ui/core';
const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const OLD_COMPONENT_NAME = 'IconButton';
const NEW_COMPONENT_NAME = 'IconButton';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    transformImportDeclaration({
        root,
        j,
        oldComponentName: OLD_COMPONENT_NAME,
        newComponentName: NEW_COMPONENT_NAME,
        sourcePackage: SOURCE_PACKAGE,
        targetPackage: TARGET_PACKAGE,
    });

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'IconButton'
        ) {
            transformIconButton(j, element);
        }
    });

    mergeImports(root, j, TARGET_PACKAGE);

    return root.toSource({});
};

function transformIconButton(j: API['jscodeshift'], element: JSXElement) {
    const attributes = element.openingElement.attributes || [];
    let hasRounded = false;
    let roundedValue: JSXAttribute['value'] = null;
    let hasShape = false;

    // First pass: collect information about rounded and shape props
    attributes.forEach((attr) => {
        if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
            if (attr.name.name === 'rounded') {
                hasRounded = true;
                roundedValue = attr.value;
            } else if (attr.name.name === 'shape') {
                hasShape = true;
            }
        }
    });

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

            // Warn about deprecated icon prop
            if (attrName === 'icon') {
                console.warn(
                    `[IconButton] 'icon' prop is deprecated. Use children instead. Found in ${element.loc?.start.line}`
                );
                return null;
            }

            // Warn about deprecated iconClassName prop
            if (attrName === 'iconClassName') {
                console.warn(
                    `[IconButton] 'iconClassName' prop is deprecated and will be removed. Found in ${element.loc?.start.line}`
                );
                return null;
            }

            // Warn about 'hint' color
            if (
                attrName === 'color' &&
                attr.value &&
                attr.value.type === 'StringLiteral' &&
                attr.value.value === 'hint'
            ) {
                console.warn(
                    `[IconButton] 'hint' color is not supported in new version. Consider using 'secondary' instead. Found in ${element.loc?.start.line}`
                );
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

    // Transform asChild prop to render prop
    transformAsChildToRender(j, element);
}

function createShapeAttributeFromRounded(
    j: API['jscodeshift'],
    roundedValue: JSXAttribute['value']
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
            j.stringLiteral('square')
        );
        return j.jsxAttribute(j.jsxIdentifier('shape'), j.jsxExpressionContainer(ternary));
    }

    // Default to square
    return j.jsxAttribute(j.jsxIdentifier('shape'), j.stringLiteral('square'));
}

export default transform;
export const parser = 'tsx';
