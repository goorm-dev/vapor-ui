import type { API, FileInfo, Transform } from 'jscodeshift';

const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    root.find(j.ImportDeclaration).forEach((path) => {
        const importDeclaration = path.value;

        if (
            importDeclaration.source.value &&
            typeof importDeclaration.source.value === 'string' &&
            importDeclaration.source.value === '@goorm-dev/vapor-icons'
        ) {
            importDeclaration.source.value = '@vapor-ui/icons';
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
