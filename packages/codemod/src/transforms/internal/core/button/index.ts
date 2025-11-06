import type { API, FileInfo, Transform } from 'jscodeshift';

import {
    getFinalImportName,
    hasComponentInPackage,
    transformImportDeclaration,
} from '~/utils/import-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Button';
const NEW_COMPONENT_NAME = 'Button';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    if (!hasComponentInPackage(root, j, OLD_COMPONENT_NAME, SOURCE_PACKAGE)) {
        return fileInfo.source;
    }

    const buttonImportName = getFinalImportName(root, j, OLD_COMPONENT_NAME, SOURCE_PACKAGE);

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
            element.openingElement.name.name === buttonImportName
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

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
