import type { API, FileInfo, Transform } from 'jscodeshift';
import { transformImportDeclaration } from '~/utils/import-transform';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    transformImportDeclaration({
        j,
        root,
        oldComponentName: 'Button',
        newComponentName: 'Button',
        sourcePackage: '@goorm-dev/vapor-core',
        targetPackage: '@vapor-ui/core',
    });

    return root.toSource();
};
export default transform;
export const parser = 'tsx';
