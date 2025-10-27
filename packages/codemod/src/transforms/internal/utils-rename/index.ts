import type { API, FileInfo, Transform } from 'jscodeshift';

import { transformImportDeclaration } from '~/utils/import-transform';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    transformImportDeclaration({
        j,
        root,
        oldComponentName: 'OldButton',
        newComponentName: 'NewButton',
        sourcePackage: '@goorm-dev/vapor-core',
        targetPackage: '@vapor-ui/core',
    });

    root.find(j.JSXIdentifier, { name: 'OldButton' }).forEach((path) => {
        j(path).replaceWith(j.jsxIdentifier('NewButton'));
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
