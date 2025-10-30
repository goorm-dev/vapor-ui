import type { API, FileInfo, Transform } from 'jscodeshift';

import {
    getFinalImportName,
    hasComponentInPackage,
    transformImportDeclaration,
} from '~/utils/import-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Badge';
const NEW_COMPONENT_NAME = 'Badge';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    if (!hasComponentInPackage(root, j, OLD_COMPONENT_NAME, SOURCE_PACKAGE)) {
        return fileInfo.source;
    }

    // 1. Import migration: Alert -> Callout
    transformImportDeclaration({
        root,
        j,
        oldComponentName: OLD_COMPONENT_NAME,
        newComponentName: NEW_COMPONENT_NAME,
        sourcePackage: SOURCE_PACKAGE,
        targetPackage: TARGET_PACKAGE,
    });

    const badgeImportName = getFinalImportName(root, j, OLD_COMPONENT_NAME, SOURCE_PACKAGE);

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === badgeImportName
        ) {
            element.openingElement.attributes?.forEach((attr, index) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'pill') {
                    const pillValue = attr.value;

                    if (
                        pillValue &&
                        pillValue.type === 'JSXExpressionContainer' &&
                        pillValue.expression.type === 'BooleanLiteral'
                    ) {
                        const newShapeValue = pillValue.expression.value ? 'pill' : 'square';

                        const shapeAttr = j.jsxAttribute(
                            j.jsxIdentifier('shape'),
                            j.stringLiteral(newShapeValue),
                        );

                        element.openingElement.attributes![index] = shapeAttr;
                    } else if (
                        !pillValue ||
                        (pillValue.type === 'StringLiteral' && pillValue.value === 'true')
                    ) {
                        const shapeAttr = j.jsxAttribute(
                            j.jsxIdentifier('shape'),
                            j.stringLiteral('pill'),
                        );

                        element.openingElement.attributes![index] = shapeAttr;
                    }
                }
            });
        }
    });

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
