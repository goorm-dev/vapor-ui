import type { API, FileInfo, Transform } from 'jscodeshift';
import { migrateImportSpecifier } from '~/utils/import-migration';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    root.find(j.ImportDeclaration).forEach((path) => {
        migrateImportSpecifier(root, j, path, 'Badge', '@goorm-dev/vapor-core', '@vapor-ui/core');
    });

    root.find(j.JSXElement).forEach((path) => {
        const element = path.value;

        if (
            element.openingElement.name.type === 'JSXIdentifier' &&
            element.openingElement.name.name === 'Badge'
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
                            j.stringLiteral(newShapeValue)
                        );

                        element.openingElement.attributes![index] = shapeAttr;
                    } else if (
                        !pillValue ||
                        (pillValue.type === 'StringLiteral' && pillValue.value === 'true')
                    ) {
                        const shapeAttr = j.jsxAttribute(
                            j.jsxIdentifier('shape'),
                            j.stringLiteral('pill')
                        );

                        element.openingElement.attributes![index] = shapeAttr;
                    }
                }
            });
        }
    });

    return root.toSource({});
};

export default transform;
export const parser = 'tsx';
