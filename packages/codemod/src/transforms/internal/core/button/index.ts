import type { API, FileInfo, Transform } from 'jscodeshift';

import { transformImportDeclaration } from '~/utils/import-transform';

const SOURCE_PACKAGE = '@goorm-dev/vapor-core';
const TARGET_PACKAGE = '@vapor-ui/core';
const OLD_COMPONENT_NAME = 'Button';
const NEW_COMPONENT_NAME = 'Button';

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
            element.openingElement.name.name === 'Button'
        ) {
            element.openingElement.attributes?.forEach((attr) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'shape') {
                    attr.name.name = 'variant';

                    if (
                        attr.value &&
                        attr.value.type === 'StringLiteral' &&
                        attr.value.value === 'invisible'
                    ) {
                        attr.value.value = 'ghost';
                    }
                }
            });
        }
    });

    const printOptions = {
        quote: 'auto' as const,
        trailingComma: true,
        tabWidth: 4,
        reuseWhitespace: true,
    };

    return root.toSource(printOptions);
};

export default transform;
export const parser = 'tsx';
