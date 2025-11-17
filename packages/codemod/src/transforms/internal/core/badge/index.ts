import type { API, FileInfo, ImportSpecifier, Transform } from 'jscodeshift';

import {
    cleanUpSourcePackage,
    collectImportSpecifiersToMove,
    createNewImportDeclaration,
    mergeIntoExistingImport,
    transformSpecifier,
} from '~/utils/import-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    const allSpecifiers: ImportSpecifier[] = collectImportSpecifiersToMove(j, root, SOURCE_PACKAGE);

    const specifiersToMove = allSpecifiers.filter((spec) => spec.imported.name === 'Badge');

    if (specifiersToMove.length === 0) {
        return root.toSource();
    }

    const badgeLocalName =
        specifiersToMove.find((spec) => spec.imported.name === 'Badge')?.local?.name || 'Badge';

    const transformedSpecifiers = transformSpecifier(j, specifiersToMove, {});

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === badgeLocalName
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

export default transform;
export const parser = 'tsx';
