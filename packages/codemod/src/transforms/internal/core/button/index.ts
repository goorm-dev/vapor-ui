import type { API, FileInfo, Transform } from 'jscodeshift';
import { migrateImportSpecifier } from '~/utils/import-migration';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    root.find(j.ImportDeclaration).forEach((path) => {
        migrateImportSpecifier(root, j, path, 'Button', '@goorm-dev/vapor-core', '@vapor-ui/core');
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

    return root.toSource({});
};

export default transform;
export const parser = 'tsx';
