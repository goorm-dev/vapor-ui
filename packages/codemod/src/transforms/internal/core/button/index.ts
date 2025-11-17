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

    const allSpecifiers: ImportSpecifier[] = collectImportSpecifiersToMove(
        j,
        root,
        SOURCE_PACKAGE,
    );

    const specifiersToMove = allSpecifiers.filter((spec) => spec.imported.name === 'Button');

    if (specifiersToMove.length === 0) {
        return root.toSource();
    }

    const buttonLocalName =
        specifiersToMove.find((spec) => spec.imported.name === 'Button')?.local?.name || 'Button';

    const transformedSpecifiers = transformSpecifier(j, specifiersToMove, {});

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === buttonLocalName
        ) {
            element.openingElement.attributes?.forEach((attr) => {
                if (attr.type === 'JSXAttribute') {
                    if (attr.name.name === 'shape') {
                        attr.name.name = 'variant';

                        if (
                            attr.value &&
                            attr.value.type === 'StringLiteral' &&
                            attr.value.value === 'invisible'
                        ) {
                            attr.value.value = 'ghost';
                        }
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
